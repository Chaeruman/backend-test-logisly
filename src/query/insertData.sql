-- ============================================================================
-- TRUCK LOCATION TRACKING DATABASE SCHEMA
-- MySQL/MariaDB optimized for millions of location records
-- ============================================================================

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS location_history;
DROP TABLE IF EXISTS trucks;

-- ============================================================================
-- TRUCKS TABLE
-- ============================================================================
CREATE TABLE trucks (
    truck_id INT AUTO_INCREMENT PRIMARY KEY,
    license_plate_number VARCHAR(20) NOT NULL,
    truck_type VARCHAR(50) DEFAULT 'box_truck',
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index for frequent license plate lookups
    INDEX idx_license_plate (license_plate_number),
    
    -- Unique constraint on license plate
    UNIQUE KEY uk_license_plate (license_plate_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- LOCATION_HISTORY TABLE
-- ============================================================================
CREATE TABLE location_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    truck_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    
    -- High precision coordinates (DECIMAL is better than FLOAT for accuracy)
    -- DECIMAL(10,8) for latitude = 8 decimal places = ~1mm precision
    -- DECIMAL(11,8) for longitude = 8 decimal places = ~1mm precision
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    -- Address field (can be NULL for raw GPS data)
    address VARCHAR(255) DEFAULT NULL,
    
    -- POINT column for spatial operations (stores as SRID 4326 - WGS84)
    location_point POINT NOT NULL,
    
    -- Optional: speed and heading for more realistic tracking
    speed_kmh DECIMAL(5, 2) DEFAULT NULL,
    heading_degrees SMALLINT DEFAULT NULL,
    
    -- ========================================================================
    -- CRITICAL INDEXES FOR PERFORMANCE
    -- ========================================================================
    
    -- 1. MOST IMPORTANT: Composite index for "latest location per truck"
    --    DESC on timestamp allows fast lookup of most recent record
    INDEX idx_truck_timestamp (truck_id, timestamp DESC),
    
    -- 2. Timestamp index for time-range queries and partitioning
    INDEX idx_timestamp (timestamp),
    
    -- 3. Separate lat/lng indexes for bounding box pre-filtering
    --    MySQL can use these efficiently, unlike spatial indexes with ST_Distance_Sphere
    INDEX idx_latitude (latitude),
    INDEX idx_longitude (longitude),
    
    -- 4. Spatial index on POINT column
    --    Limited use due to MySQL bug, but good to have for other spatial queries
    SPATIAL INDEX idx_location_point (location_point),
    
    -- Foreign key constraint
    FOREIGN KEY fk_truck (truck_id) REFERENCES trucks(truck_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Insert 50 sample trucks with Indonesian license plates
INSERT INTO trucks (license_plate_number, truck_type, status) VALUES
-- Jakarta (B)
('B 1234 ABC', 'box_truck', 'active'),
('B 5678 DEF', 'flatbed', 'active'),
('B 9012 GHI', 'box_truck', 'active'),
('B 3456 JKL', 'refrigerated', 'active'),
('B 7890 MNO', 'box_truck', 'maintenance'),
-- Bandung (D)
('D 1111 PQR', 'box_truck', 'active'),
('D 2222 STU', 'flatbed', 'active'),
('D 3333 VWX', 'box_truck', 'active'),
-- Surabaya (L)
('L 4444 YZA', 'box_truck', 'active'),
('L 5555 BCD', 'refrigerated', 'active'),
('L 6666 EFG', 'box_truck', 'active'),
-- Semarang (H)
('H 7777 HIJ', 'flatbed', 'active'),
('H 8888 KLM', 'box_truck', 'active'),
-- Medan (BK)
('BK 9999 NOP', 'box_truck', 'active'),
('BK 1010 QRS', 'refrigerated', 'active'),
-- More trucks for realistic dataset
('B 2020 TUV', 'box_truck', 'active'),
('B 3030 WXY', 'flatbed', 'active'),
('D 4040 ZAB', 'box_truck', 'active'),
('L 5050 CDE', 'refrigerated', 'active'),
('H 6060 FGH', 'box_truck', 'active'),
('B 7070 IJK', 'box_truck', 'active'),
('B 8080 LMN', 'flatbed', 'active'),
('D 9090 OPQ', 'box_truck', 'active'),
('L 1212 RST', 'box_truck', 'active'),
('H 3434 UVW', 'refrigerated', 'active'),
('B 5656 XYZ', 'box_truck', 'active'),
('B 7878 ABC', 'flatbed', 'active'),
('D 9090 DEF', 'box_truck', 'active'),
('L 1122 GHI', 'box_truck', 'active'),
('H 3344 JKL', 'refrigerated', 'active'),
('B 5566 MNO', 'box_truck', 'active'),
('B 7788 PQR', 'flatbed', 'active'),
('D 9900 STU', 'box_truck', 'active'),
('L 1133 VWX', 'box_truck', 'active'),
('H 2244 YZA', 'refrigerated', 'active'),
('B 3355 BCD', 'box_truck', 'active'),
('B 4466 EFG', 'flatbed', 'active'),
('D 5577 HIJ', 'box_truck', 'active'),
('L 6688 KLM', 'box_truck', 'active'),
('H 7799 NOP', 'refrigerated', 'active'),
('B 8800 QRS', 'box_truck', 'active'),
('B 9911 TUV', 'flatbed', 'active'),
('D 1020 WXY', 'box_truck', 'active'),
('L 2030 ZAB', 'box_truck', 'active'),
('H 3040 CDE', 'refrigerated', 'active'),
('B 4050 FGH', 'box_truck', 'active'),
('B 5060 IJK', 'flatbed', 'active'),
('D 6070 LMN', 'box_truck', 'active'),
('L 7080 OPQ', 'box_truck', 'active'),
('H 8090 RST', 'refrigerated', 'active');

-- ============================================================================
-- Insert realistic location history data
-- Simulating trucks moving around Jakarta and surrounding areas
-- Creating multiple historical records per truck + current location
-- ============================================================================

-- Truck 1 (B 1234 ABC) - Route from Jakarta to Tangerang
INSERT INTO location_history (truck_id, timestamp, latitude, longitude, location_point, address, speed_kmh, heading_degrees) VALUES
(1, DATE_SUB(NOW(), INTERVAL 3 HOUR), -6.2088, 106.8456, ST_GeomFromText('POINT(106.8456 -6.2088)', 4326), 'Jl. Sudirman, Jakarta', 45.5, 270),
(1, DATE_SUB(NOW(), INTERVAL 2 HOUR), -6.1944, 106.8229, ST_GeomFromText('POINT(106.8229 -6.1944)', 4326), 'Tol Dalam Kota, Jakarta', 60.0, 280),
(1, DATE_SUB(NOW(), INTERVAL 1 HOUR), -6.1781, 106.7831, ST_GeomFromText('POINT(106.7831 -6.1781)', 4326), 'Tol Jakarta-Tangerang', 70.0, 275),
(1, NOW(), -6.1701, 106.6400, ST_GeomFromText('POINT(106.6400 -6.1701)', 4326), 'BSD City, Tangerang', 0.0, 275);

-- Truck 2 (B 5678 DEF) - Near Monas area
INSERT INTO location_history (truck_id, timestamp, latitude, longitude, location_point, address, speed_kmh, heading_degrees) VALUES
(2, DATE_SUB(NOW(), INTERVAL 4 HOUR), -6.1844, 106.8294, ST_GeomFromText('POINT(106.8294 -6.1844)', 4326), 'Menteng, Jakarta', 30.0, 180),
(2, DATE_SUB(NOW(), INTERVAL 2 HOUR), -6.1754, 106.8272, ST_GeomFromText('POINT(106.8272 -6.1754)', 4326), 'Monas Area, Jakarta', 25.0, 170),
(2, NOW(), -6.1701, 106.8250, ST_GeomFromText('POINT(106.8250 -6.1701)', 4326), 'Harmoni, Jakarta', 0.0, 180);

-- Truck 3 (B 9012 GHI) - East Jakarta route
INSERT INTO location_history (truck_id, timestamp, latitude, longitude, location_point, address, speed_kmh, heading_degrees) VALUES
(3, DATE_SUB(NOW(), INTERVAL 5 HOUR), -6.2146, 106.8451, ST_GeomFromText('POINT(106.8451 -6.2146)', 4326), 'Kuningan, Jakarta', 40.0, 90),
(3, DATE_SUB(NOW(), INTERVAL 3 HOUR), -6.2250, 106.8700, ST_GeomFromText('POINT(106.8700 -6.2250)', 4326), 'Cawang, Jakarta', 50.0, 95),
(3, DATE_SUB(NOW(), INTERVAL 1 HOUR), -6.2417, 106.9000, ST_GeomFromText('POINT(106.9000 -6.2417)', 4326), 'Rawamangun, Jakarta', 45.0, 100),
(3, NOW(), -6.2615, 106.9500, ST_GeomFromText('POINT(106.9500 -6.2615)', 4326), 'Bekasi Border', 35.0, 90);

-- Truck 4 (B 3456 JKL) - South Jakarta (currently near SCBD)
INSERT INTO location_history (truck_id, timestamp, latitude, longitude, location_point, address, speed_kmh, heading_degrees) VALUES
(4, DATE_SUB(NOW(), INTERVAL 2 HOUR), -6.2615, 106.7800, ST_GeomFromText('POINT(106.7800 -6.2615)', 4326), 'Senopati, Jakarta', 25.0, 350),
(4, DATE_SUB(NOW(), INTERVAL 1 HOUR), -6.2350, 106.7920, ST_GeomFromText('POINT(106.7920 -6.2350)', 4326), 'Kebayoran Baru, Jakarta', 30.0, 10),
(4, NOW(), -6.2255, 106.8090, ST_GeomFromText('POINT(106.8090 -6.2255)', 4326), 'SCBD, Jakarta', 0.0, 0);

-- Truck 5 (B 7890 MNO) - In maintenance, parked in depot
INSERT INTO location_history (truck_id, timestamp, latitude, longitude, location_point, address, speed_kmh, heading_degrees) VALUES
(5, DATE_SUB(NOW(), INTERVAL 24 HOUR), -6.3000, 106.8800, ST_GeomFromText('POINT(106.8800 -6.3000)', 4326), 'Depot Cibubur', 0.0, 0),
(5, NOW(), -6.3000, 106.8800, ST_GeomFromText('POINT(106.8800 -6.3000)', 4326), 'Depot Cibubur', 0.0, 0);

-- Add more recent locations for remaining trucks (simulating current positions)
INSERT INTO location_history (truck_id, timestamp, latitude, longitude, location_point, address, speed_kmh, heading_degrees) VALUES
-- Trucks around Jakarta CBD
(6, NOW(), -6.1820, 106.8300, ST_GeomFromText('POINT(106.8300 -6.1820)', 4326), 'Thamrin, Jakarta', 15.0, 90),
(7, NOW(), -6.1950, 106.8210, ST_GeomFromText('POINT(106.8210 -6.1950)', 4326), 'Tanah Abang, Jakarta', 20.0, 180),
(8, NOW(), -6.2100, 106.8400, ST_GeomFromText('POINT(106.8400 -6.2100)', 4326), 'Setiabudi, Jakarta', 25.0, 270),
-- Trucks in North Jakarta
(9, NOW(), -6.1200, 106.8300, ST_GeomFromText('POINT(106.8300 -6.1200)', 4326), 'Kelapa Gading, Jakarta', 30.0, 45),
(10, NOW(), -6.1380, 106.8600, ST_GeomFromText('POINT(106.8600 -6.1380)', 4326), 'Sunter, Jakarta', 35.0, 135),
-- Trucks in West Jakarta
(11, NOW(), -6.1600, 106.7800, ST_GeomFromText('POINT(106.7800 -6.1600)', 4326), 'Grogol, Jakarta', 40.0, 225),
(12, NOW(), -6.1700, 106.7500, ST_GeomFromText('POINT(106.7500 -6.1700)', 4326), 'Kebon Jeruk, Jakarta', 28.0, 315),
-- Trucks in South Jakarta
(13, NOW(), -6.2900, 106.8100, ST_GeomFromText('POINT(106.8100 -6.2900)', 4326), 'Cilandak, Jakarta', 22.0, 60),
(14, NOW(), -6.3100, 106.8400, ST_GeomFromText('POINT(106.8400 -6.3100)', 4326), 'Pasar Minggu, Jakarta', 18.0, 150),
(15, NOW(), -6.2800, 106.7900, ST_GeomFromText('POINT(106.7900 -6.2800)', 4326), 'Pondok Indah, Jakarta', 32.0, 240),
-- Trucks scattered around Greater Jakarta
(16, NOW(), -6.3500, 106.8800, ST_GeomFromText('POINT(106.8800 -6.3500)', 4326), 'Depok', 45.0, 180),
(17, NOW(), -6.1800, 106.6300, ST_GeomFromText('POINT(106.6300 -6.1800)', 4326), 'Tangerang', 50.0, 270),
(18, NOW(), -6.2400, 106.9800, ST_GeomFromText('POINT(106.9800 -6.2400)', 4326), 'Bekasi', 55.0, 90),
(19, NOW(), -6.0800, 106.7400, ST_GeomFromText('POINT(106.7400 -6.0800)', 4326), 'Cengkareng', 38.0, 315),
(20, NOW(), -6.4000, 106.8200, ST_GeomFromText('POINT(106.8200 -6.4000)', 4326), 'Bogor Border', 42.0, 200),
-- Additional trucks with varied positions
(21, NOW(), -6.1650, 106.8100, ST_GeomFromText('POINT(106.8100 -6.1650)', 4326), 'Senen, Jakarta', 27.0, 45),
(22, NOW(), -6.2200, 106.7700, ST_GeomFromText('POINT(106.7700 -6.2200)', 4326), 'Pesanggrahan, Jakarta', 31.0, 180),
(23, NOW(), -6.1400, 106.8900, ST_GeomFromText('POINT(106.8900 -6.1400)', 4326), 'Pulo Gadung, Jakarta', 48.0, 90),
(24, NOW(), -6.2700, 106.8600, ST_GeomFromText('POINT(106.8600 -6.2700)', 4326), 'Mampang, Jakarta', 24.0, 270),
(25, NOW(), -6.1900, 106.7900, ST_GeomFromText('POINT(106.7900 -6.1900)', 4326), 'Palmerah, Jakarta', 29.0, 135),
(26, NOW(), -6.2500, 106.8300, ST_GeomFromText('POINT(106.8300 -6.2500)', 4326), 'Pancoran, Jakarta', 33.0, 45),
(27, NOW(), -6.1300, 106.8100, ST_GeomFromText('POINT(106.8100 -6.1300)', 4326), 'Ancol, Jakarta', 19.0, 315),
(28, NOW(), -6.3200, 106.7800, ST_GeomFromText('POINT(106.7800 -6.3200)', 4326), 'Lebak Bulus, Jakarta', 36.0, 225),
(29, NOW(), -6.1100, 106.8500, ST_GeomFromText('POINT(106.8500 -6.1100)', 4326), 'Tanjung Priok, Jakarta', 44.0, 0),
(30, NOW(), -6.2000, 106.9200, ST_GeomFromText('POINT(106.9200 -6.2000)', 4326), 'Cipinang, Jakarta', 37.0, 90),
(31, NOW(), -6.1550, 106.7650, ST_GeomFromText('POINT(106.7650 -6.1550)', 4326), 'Tomang, Jakarta', 26.0, 270),
(32, NOW(), -6.2850, 106.8250, ST_GeomFromText('POINT(106.8250 -6.2850)', 4326), 'Jagakarsa, Jakarta', 21.0, 180),
(33, NOW(), -6.1750, 106.8750, ST_GeomFromText('POINT(106.8750 -6.1750)', 4326), 'Matraman, Jakarta', 34.0, 135),
(34, NOW(), -6.2350, 106.7550, ST_GeomFromText('POINT(106.7550 -6.2350)', 4326), 'Bintaro, Jakarta', 41.0, 225),
(35, NOW(), -6.1450, 106.8350, ST_GeomFromText('POINT(106.8350 -6.1450)', 4326), 'Kemayoran, Jakarta', 23.0, 45),
(36, NOW(), -6.2650, 106.8450, ST_GeomFromText('POINT(106.8450 -6.2650)', 4326), 'Tebet, Jakarta', 28.0, 315),
(37, NOW(), -6.1850, 106.7850, ST_GeomFromText('POINT(106.7850 -6.1850)', 4326), 'Gambir, Jakarta', 17.0, 0),
(38, NOW(), -6.2150, 106.8650, ST_GeomFromText('POINT(106.8650 -6.2150)', 4326), 'Casablanca, Jakarta', 39.0, 90),
(39, NOW(), -6.1250, 106.7950, ST_GeomFromText('POINT(106.7950 -6.1250)', 4326), 'Pluit, Jakarta', 46.0, 270),
(40, NOW(), -6.2950, 106.8550, ST_GeomFromText('POINT(106.8550 -6.2950)', 4326), 'Lenteng Agung, Jakarta', 35.0, 180),
(41, NOW(), -6.1650, 106.8950, ST_GeomFromText('POINT(106.8950 -6.1650)', 4326), 'Jatinegara, Jakarta', 43.0, 135),
(42, NOW(), -6.2450, 106.7650, ST_GeomFromText('POINT(106.7650 -6.2450)', 4326), 'Ciputat, Jakarta', 30.0, 225),
(43, NOW(), -6.1350, 106.8250, ST_GeomFromText('POINT(106.8250 -6.1350)', 4326), 'Pademangan, Jakarta', 25.0, 45),
(44, NOW(), -6.2750, 106.8350, ST_GeomFromText('POINT(106.8350 -6.2750)', 4326), 'Kalibata, Jakarta', 32.0, 315),
(45, NOW(), -6.1950, 106.7750, ST_GeomFromText('POINT(106.7750 -6.1950)', 4326), 'Tanah Kusir, Jakarta', 20.0, 0),
(46, NOW(), -6.2250, 106.8550, ST_GeomFromText('POINT(106.8550 -6.2250)', 4326), 'Menteng Dalam, Jakarta', 38.0, 90),
(47, NOW(), -6.1150, 106.8050, ST_GeomFromText('POINT(106.8050 -6.1150)', 4326), 'Muara Karang, Jakarta', 47.0, 270),
(48, NOW(), -6.3050, 106.8650, ST_GeomFromText('POINT(106.8650 -6.3050)', 4326), 'Srengseng Sawah, Jakarta', 29.0, 180),
(49, NOW(), -6.1750, 106.9050, ST_GeomFromText('POINT(106.9050 -6.1750)', 4326), 'Kramat Jati, Jakarta', 41.0, 135),
(50, NOW(), -6.2550, 106.7750, ST_GeomFromText('POINT(106.7750 -6.2550)', 4326), 'Rempoa, Jakarta', 36.0, 225);

-- ============================================================================
-- Add historical data for a few trucks to simulate realistic movement patterns
-- ============================================================================

-- Truck 10 historical journey (showing movement over 6 hours)
INSERT INTO location_history (truck_id, timestamp, latitude, longitude, location_point, address, speed_kmh, heading_degrees) VALUES
(10, DATE_SUB(NOW(), INTERVAL 6 HOUR), -6.2088, 106.8456, ST_GeomFromText('POINT(106.8456 -6.2088)', 4326), 'Start: Kuningan', 0.0, 0),
(10, DATE_SUB(NOW(), INTERVAL 5 HOUR), -6.1950, 106.8350, ST_GeomFromText('POINT(106.8350 -6.1950)', 4326), 'Moving North', 45.0, 350),
(10, DATE_SUB(NOW(), INTERVAL 4 HOUR), -6.1750, 106.8300, ST_GeomFromText('POINT(106.8300 -6.1750)', 4326), 'Central Jakarta', 50.0, 355),
(10, DATE_SUB(NOW(), INTERVAL 3 HOUR), -6.1500, 106.8400, ST_GeomFromText('POINT(106.8400 -6.1500)', 4326), 'Kemayoran', 55.0, 10),
(10, DATE_SUB(NOW(), INTERVAL 2 HOUR), -6.1350, 106.8550, ST_GeomFromText('POINT(106.8550 -6.1350)', 4326), 'Near Sunter', 40.0, 45);

-- Truck 15 historical journey
INSERT INTO location_history (truck_id, timestamp, latitude, longitude, location_point, address, speed_kmh, heading_degrees) VALUES
(15, DATE_SUB(NOW(), INTERVAL 8 HOUR), -6.3500, 106.8500, ST_GeomFromText('POINT(106.8500 -6.3500)', 4326), 'Start: Depok', 0.0, 0),
(15, DATE_SUB(NOW(), INTERVAL 6 HOUR), -6.3200, 106.8300, ST_GeomFromText('POINT(106.8300 -6.3200)', 4326), 'Moving North', 60.0, 340),
(15, DATE_SUB(NOW(), INTERVAL 4 HOUR), -6.2900, 106.8150, ST_GeomFromText('POINT(106.8150 -6.2900)', 4326), 'Cilandak', 55.0, 350),
(15, DATE_SUB(NOW(), INTERVAL 2 HOUR), -6.2850, 106.8000, ST_GeomFromText('POINT(106.8000 -6.2850)', 4326), 'Near Pondok Indah', 30.0, 280);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check total records
-- SELECT COUNT(*) as total_trucks FROM trucks;
-- SELECT COUNT(*) as total_locations FROM location_history;

-- View sample data
-- SELECT * FROM trucks LIMIT 10;
-- SELECT * FROM location_history ORDER BY timestamp DESC LIMIT 10;

-- Check latest location per truck
-- SELECT 
--     t.truck_id, 
--     t.license_plate_number,
--     lh.latitude,
--     lh.longitude,
--     lh.timestamp
-- FROM trucks t
-- INNER JOIN location_history lh ON t.truck_id = lh.truck_id
-- INNER JOIN (
--     SELECT truck_id, MAX(timestamp) as max_ts
--     FROM location_history
--     GROUP BY truck_id
-- ) latest ON lh.truck_id = latest.truck_id AND lh.timestamp = latest.max_ts
-- ORDER BY t.truck_id;