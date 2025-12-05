# backend-test-logisly

# Whatsapp Cargo Message Parser

### install kode program dan jalankan kode program dengan npx jest

---

## 2. Database Design – Nearby Trucks Lookup

### 2.1 Skema Tabel

Skenario: sistem menggunakan MySQL/MariaDB dengan dua tabel utama, yaitu `trucks` dan `location_history`. Desain skema yang saya usulkan:

```sql
CREATE TABLE trucks (
  truck_id INT NOT NULL PRIMARY KEY,
  license_plate_number VARCHAR(20) NOT NULL,
  INDEX idx_license_plate (license_plate_number)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


CREATE TABLE location_history (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  truck_id INT NOT NULL,
  `timestamp` DATETIME NOT NULL,
  latitude  DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address   VARCHAR(255),

  -- Kolom POINT untuk operasi spasial, menggunakan SRID WGS84 (4326)
  location_point POINT NOT NULL SRID 4326,

  -- Index untuk pencarian lokasi terakhir per truck
  INDEX idx_truck_timestamp (truck_id, `timestamp` DESC),

  -- Index numerik untuk bounding-box (filter kasar)
  INDEX idx_lat (latitude),
  INDEX idx_lng (longitude),

  -- Spatial index untuk operasi spasial berbasis POINT
  SPATIAL INDEX idx_location_point (location_point),

  CONSTRAINT fk_location_truck
    FOREIGN KEY (truck_id) REFERENCES trucks(truck_id)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci;
```

lalu untuk querynya

```sql
SELECT
      t.truck_id,
      t.license_plate_number,
      lh.latitude,
      lh.longitude,
      lh.address,

      ST_Distance_Sphere(
        lh.location_point,
        ST_GeomFromText(CONCAT('POINT(', :lng, ' ', :lat, ')'), 4326)
      ) / 1000 AS distance_km

    FROM trucks t
    INNER JOIN location_history lh
        ON t.truck_id = lh.truck_id
    INNER JOIN (
        SELECT truck_id, MAX(timestamp) AS max_ts
        FROM location_history
        GROUP BY truck_id
    ) latest
        ON lh.truck_id = latest.truck_id
       AND lh.timestamp = latest.max_ts

    WHERE
      lh.latitude BETWEEN :lat - (:radius / 111.0)
                      AND :lat + (:radius / 111.0)

      AND lh.longitude BETWEEN :lng - (:radius / (111.0 * COS(RADIANS(:lat))))
                           AND :lng + (:radius / (111.0 * COS(RADIANS(:lat))))

      AND ST_Distance_Sphere(
          lh.location_point,
          ST_GeomFromText(CONCAT('POINT(', :lng, ' ', :lat, ')'), 4326)
      ) <= :radius * 1000

    ORDER BY distance_km
    LIMIT 100;
```

### 2.3 Alasan Desain 

#### 1) Index

- `idx_license_plate`  
  Supaya query seperti `SELECT truck_id FROM trucks WHERE license_plate_number = 'B 1234 ABC'` cepat diproses.

- `idx_truck_timestamp (truck_id, timestamp DESC)`  
  Index ini dipakai untuk mencari **lokasi terakhir per truck**. Dengan index ini maka tidak perlu menscan seluruh database, cukup fokus ke kombinasi index `truck_id + timestamp` yang terbaru.

- `idx_lat` dan `idx_lng`  
  Dipakai untuk **filter kasar** dengan bounding box (`BETWEEN`). Jadi dari jutaan baris, jadi proses querynya diminimize terlebih dahulu sebelum menghitung jarak yang prosesnya jadi lebih mahal.

- `SPATIAL INDEX idx_location_point`  
  Disiapkan untuk operasi spasial (misalnya kalau nanti mau memakai fungsi GIS lain). Di desain ini utamanya dipakai dengan menggunakan `ST_Distance_Sphere`.

---

#### 2) Alasan memakai bounding box + `ST_Distance_Sphere`

- Bounding box (pakai `latitude` dan `longitude`):
  - dengan hanya membandingkan angka maka bisa membuat query menjadi lebih cepat (`BETWEEN`).

- Setelah itu baru diquery dengan `ST_Distance_Sphere`:
  - Lebih akurat untuk mengukur jarak berdasarkan radius.
  - Karena sudah difilter dulu dengan bounding box sebelumnya, jumlah baris yang dihitung jaraknya jadi jauh lebih sedikit.

---

#### 3) Kenapa menyimpan field `POINT`?

- `location_point` (kolom `POINT`):
  - Bisa memanfaatkan SPATIAL INDEX.

Memang bakal ada sedikit duplikasi data, tapi sebagai gantinya:

- Query fleksibel,
- Proposal saya ini bisa dipilih mana yang paling efisien tergantung kebutuhan.

---

#### 4) Kenapa pakai subquery `MAX(timestamp)` untuk latest location?

Potongan:

```sql
SELECT truck_id, MAX(`timestamp`) AS max_ts
FROM location_history
GROUP BY truck_id
```

---

### 3. Additional Questions

###### a. Pembatasan penalti dibuat per jenis keterlambatan (POD dan ePOD masing-masing maksimal 30 hari) karena keduanya dianggap sebagai dua kewajiban yang berbeda. Kalau hanya dibuat satu batasan total 30 hari untuk semuanya, maka worst casenya POD/ ePOD salah satu atau dua duanya bisa terlambat melebihi batas normal.


###### b) Jika tidak dilimitasi menjadi `TS_MAX_TOP_DELAY = 45`, maka nilai TOP akhir bisa menjadi sangat besar. Hal ini berpotensi mengganggu arus kas transporter yang dapat menimbulkan keberatan, dispute, atau hubungan kerja sama yang tidak baik.

Contoh:

- Baseline TOP: `45` hari
- POD Late Days: `100` → dibatasi menjadi `30`
- ePOD Late Days: `100` → dibatasi menjadi `30`
- Total TOP tanpa batas akhir: `45 + 30 + 30 = 105` hari

---

#### c) Saya dapat membuat config sebagai parameter yang diterima oleh fungsi calculateToP sebagai konfigurasi ke dalam fungsi perhitungan. misal:

```ts
export interface TopConfig {
  maxPodDelay: number; // contoh: 30
  maxEpodDelay: number; // contoh: 30
  maxTotalTop: number; // contoh: 45
}

export function calculateTopResult(
  baselineTop: number,
  podLateDays: number,
  epodLateDays: number,
  config: TopConfig
): number {
  const normalizedPod = Math.max(0, podLateDays);
  const normalizedEpod = Math.max(0, epodLateDays);

  const podDelay = Math.min(normalizedPod, config.maxPodDelay);
  const epodDelay = Math.min(normalizedEpod, config.maxEpodDelay);

  const penalty = podDelay + epodDelay;
  const totalTop = baselineTop + penalty;

  return Math.min(totalTop, config.maxTotalTop);
}

````

dan kemudian konfigurasi ini bisa didapatkan dari database misalnya `payment_top_config`, yang kemudian bisa diubah sesuai dengan ketentuan
