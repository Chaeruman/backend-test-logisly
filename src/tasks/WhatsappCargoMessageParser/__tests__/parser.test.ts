// src/tasks/db/parser/__tests__/parser.test.ts
import { WhatsappCargoMessageParser } from "../index.js";

const message1 = `
*Dear Team Transporter*
*Remind Order*
*Planning Loading*
*Rabu, 23 Oktober 2024*
*Origin KCS Karawang*
Csa Cikupa + Rajeg 45 Cbm 1 Unit (Gudang Bayur)
Tuj Pekalongan 46 Cbm *2 Unit*
Csa Rajeg 47 Cbm 1 Unit
_
*Pastikan Driver memakai (Sepatu Safety, Berpkaian rapi, tanda pengenal,Helm &
Safety Vest)*
_
*Terima kasih*
`;

const message2 = `
*Dear Team Transporter*
*Order Baru*
*Planning Loading*
*Senin, 28 Oktober 2024*
*Origin KCS Karawang*
Sample Koneksi Benoa 2 Cbm 1 Unit
Sample Shopee Logos 17 Cbm 1 Unit
TSM Purwakarta+Dlj Karawang 10 Cbm 1 Unit
TSM Indramayu 38 Cbm 1 Unit
_
*Pastikan Driver memakai (Sepatu Safety, Berpkaian rapi, tanda pengenal,Helm &
Safety Vest)*
_
*Terima kasih*
`;

const message3 = `
*Dear Team Transporter*
*Remind Order*
*Planning Loading*
*Kamis, 20 Feb 2025*
*Origin KCS Karawang*
*Csa Cengkareng 47 Cbm *4 Unit* *Urgent*
*CSA Cipondoh 46 cbm 2 unit*
*Csa Cikupa 43 Cbm 1 Unit*
*Csa Cijantung 46 Cbm 3 Unit*
*Csa Cijantung 21 Cbm 1 Unit*
*Csa Cikupa 23 Cbm 1 Unit*
*Csa Cikup 38 Cbm 1 Unit*
*Csa Rajeg + Cipondoh 46 Cbm 1 Unit* *(Gudang Bayur)*
*Csa Cijantung + Cakung 48 Cbm 1 Unit *(Gudang Bayur)*
*UDN Jatibening 48 Cbm *4 Unit* *Urgent Bongkar Besok*
*Udn Jatibening + Udn Jababeka 47 Cbm 1 Unit *Urgent*
*Udn Cinangka 48 Cbm 1 Unit*
*Udn Daanmogot 24 Cbm 1 Unit*
Tuj Yogyakarta + Udn Purwokerto 42 Cbm 1 Unit.
TUJ Purwodadi+TUJ Salatiga 49 Cbm *2 Unit *Urgent*
Tuj Pati + Tuj Kendal 49 Cbm 1 Unit
Tuj Pekalongan 48 Cbm 1 Unit
MHS Bogor 16 Cbm 1 Unit
Tuj Yogyakarta 16 Cbm 1 Unit
Udn Madiun + Ponorogo 34 Cbm 1 Unit
Wahana Surakarta + Tuj Magelang 38 Cbm 1 Unit
TSM Tasikmalaya 48 Cbm 1 Unit
Jembatan Lombok + Jayatama Lombok 45 Cbm 1 Unit
RDA Cianjur + Sukabumi 46 Cbm 1 Unit
TSm Subang 15 Cbm 1 Unit
Rda Sumedang 18 Cbm *2 Unit*
Tuj Tegal + Tuj Pekalongan 18 Cbm 1 Unit
Tsm Tasikmalaya 29 Cbm *2 Unit*
_
*Pastikan Driver memakai (Sepatu Safety, Berpkaian rapi, tanda pengenal,Helm &
Safety Vest)*
_
*Terima Kasih*
`;

const message4 = `
*Dear Team Transporter*
*Order Baru*
*Planning Loading*
*Selasa, 08 Oktober 2024*
*Origin KCS Karawang*
TSJ Lumajang + Udn ponorogo 35 Cbm 1 Unit
Udn Banywangi 36 Cbm 1 Unit
Lotte Pasar Rebo 1 Cbm 1 Unit *PO 11 Okt 2024*
Lotte Meruya 1 Cbm 1 unit *PO 11 Okt 2024*
Duta Intidaya 8 Cbm 1 Unit *PO 11 Okt 2024*
_
*Pastikan Driver memakai (Sepatu Safety, Berpkaian rapi, tanda pengenal,Helm &
Safety Vest)*
_
*Terima kasih*
`;

describe("WhatsappCargoMessageParser – example messages", () => {
  it("parses example #1 correctly", () => {
    const parsed = WhatsappCargoMessageParser(message1);

    // header
    expect(parsed.date).toBe("2024-10-23");
    expect(parsed.origin).toBe("KCS Karawang");

    // items
    expect(parsed.items).toHaveLength(3);

    expect(parsed.items[0]).toMatchObject({
      destinations: ["Csa Cikupa", "Rajeg"],
      volumeCbm: 45,
      unitCount: 1,
      // Gudang Bayur jadi notes
      notes: "(Gudang Bayur)",
    });

    expect(parsed.items[1]).toMatchObject({
      destinations: ["Tuj Pekalongan"],
      volumeCbm: 46,
      unitCount: 2,
    });

    // safety note
    expect(parsed.safetyNote).toBeDefined();
    expect(parsed.safetyNote).toMatch(/Pastikan Driver memakai/i);
  });

  it("parses example #2 with multiple simple items", () => {
    const parsed = WhatsappCargoMessageParser(message2);

    expect(parsed.date).toBe("2024-10-28");
    expect(parsed.origin).toBe("KCS Karawang");

    expect(parsed.items).toHaveLength(4);

    expect(parsed.items[0]).toMatchObject({
      destinations: ["Sample Koneksi Benoa"],
      volumeCbm: 2,
      unitCount: 1,
    });

    expect(parsed.items[1]).toMatchObject({
      destinations: ["Sample Shopee Logos"],
      volumeCbm: 17,
      unitCount: 1,
    });

    // plus-sign tanpa spasi harus kebaca 2 destination
    expect(parsed.items[2]).toMatchObject({
      destinations: ["TSM Purwakarta", "Dlj Karawang"],
      volumeCbm: 10,
      unitCount: 1,
    });

    expect(parsed.items[3]).toMatchObject({
      destinations: ["TSM Indramayu"],
      volumeCbm: 38,
      unitCount: 1,
    });

    expect(parsed.safetyNote).toBeDefined();
  });

  it("parses example #3 with many mixed items and Gudang Bayur notes", () => {
    const parsed = WhatsappCargoMessageParser(message3);

    expect(parsed.date).toBe("2025-02-20");
    expect(parsed.origin).toBe("KCS Karawang");

    // Jumlah line cargo yang mengandung "Cbm" di example #3 = 28
    expect(parsed.items.length).toBe(28);

    // Contoh item awal (Csa Cengkareng)
    expect(parsed.items[0]).toMatchObject({
      destinations: ["Csa Cengkareng"],
      volumeCbm: 47,
      unitCount: 4,
    });

    // Contoh item dengan notes Gudang Bayur
    const rajegGudangBayur = parsed.items.find((item) =>
      item.destinations.includes("Csa Rajeg")
    );
    expect(rajegGudangBayur).toBeDefined();
    expect(rajegGudangBayur?.notes).toMatch(/Gudang Bayur/i);

    const cijantungCakungGudangBayur = parsed.items.find(
      (item) =>
        item.destinations.includes("Csa Cijantung") &&
        item.destinations.includes("Cakung")
    );
    expect(cijantungCakungGudangBayur).toBeDefined();
    expect(cijantungCakungGudangBayur?.notes).toMatch(/Gudang Bayur/i);

    // beberapa sample tujuan lain (sanity check)
    const hasTasik = parsed.items.some((item) =>
      item.destinations.some((d) => /Tsm Tasikmalaya/i.test(d))
    );
    const hasLombok = parsed.items.some((item) =>
      item.destinations.some((d) => /Lombok/i.test(d))
    );

    expect(hasTasik).toBe(true);
    expect(hasLombok).toBe(true);

    expect(parsed.safetyNote).toBeDefined();
    expect(parsed.safetyNote).toMatch(/Pastikan Driver memakai/i);
  });

  it("parses example #4 and extracts PO dates", () => {
    const parsed = WhatsappCargoMessageParser(message4);

    expect(parsed.date).toBe("2024-10-08");
    expect(parsed.origin).toBe("KCS Karawang");

    expect(parsed.items).toHaveLength(5);

    // Item tanpa PO
    expect(parsed.items[0]).toMatchObject({
      destinations: ["TSJ Lumajang", "Udn ponorogo"],
      volumeCbm: 35,
      unitCount: 1,
    });

    // Tiga item terakhir punya PO date yang sama
    const lottePasarRebo = parsed.items[2];
    const lotteMeruya = parsed.items[3];
    const dutaIntidaya = parsed.items[4];

    expect(lottePasarRebo.poDate).toBe("2024-10-11");
    expect(lotteMeruya.poDate).toBe("2024-10-11");
    expect(dutaIntidaya.poDate).toBe("2024-10-11");

    expect(parsed.safetyNote).toBeDefined();
    expect(parsed.safetyNote).toMatch(/Pastikan Driver memakai/i);
  });
});
