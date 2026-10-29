# CutiPintar MY 🌴

Rehat lebih lama dengan cuti tahunan yang ada. Aplikasi web sumber terbuka untuk Malaysia, tanpa akaun atau pelayan data.

## Jalankan

Perlu Python 3 untuk pratonton; Node.js 20+ untuk ujian.

```sh
python3 -m http.server 4173
# buka http://localhost:4173
node --test
```

Atau `npm run dev` dan `npm test`. Tiada pemasangan pakej diperlukan. Jangan buka index.html terus melalui file:// kerana aplikasi memuat JSON menggunakan fetch.

## MVP v0.1

- Semua 13 negeri dan 3 wilayah persekutuan; jadual asas 2026 disertakan.
- Pilihan tahun tersedia berdasarkan dataset yang dimuatkan. Import JSON menambah tahun lain; tarikh tahun lain tidak diteka.
- Bajet 0–60 hari; tarikh mula carian; hujung minggu Sabtu–Ahad atau Jumaat–Sabtu boleh ditukar mengikut jadual kerja sendiri.
- Enam cadangan alternatif tanpa pertindihan, setiap satu dalam bajet penuh yang dimasukkan.
- Tarikh permohonan cuti diperincikan. Eksport `.ics` mengandungi **cuti tahunan sahaja**, sebagai acara sehari penuh berstatus cadangan, untuk Google Calendar / Outlook / Apple Calendar.
- Import JSON tempatan disahkan; data hanya kekal dalam sesi pelayar. Refresh memulihkan data asal.

## Pelan dan seni bina

1. MVP: input → tapis cuti negeri → tandakan hari bukan bekerja → cari rehat berterusan → susun → eksport.
2. Seterusnya: dataset 2027 disemak, cuti gantian dan pindaan dengan bukti sumber setiap rekod, ujian pelayar automatik.
3. Kemudian: gabungan beberapa perjalanan menggunakan satu bajet tahunan (dynamic programming), simpan pilihan dan kalendar bulanan.

Frontend statik ES modules, pengiraan tulen dalam `src/planner.js`, data berversi dalam `data/`. Tiada backend diperlukan. Boleh dihoskan dengan GitHub Pages daripada akar repo atau mana-mana pelayan statik. Google Fonts adalah pilihan visual sahaja; fon sistem menjadi fallback.

```text
index.html / style.css       Antara muka responsif Bahasa Melayu
src/app.js                  Interaksi, import, muat turun
src/planner.js              Pengiraan dan eksport ICS
src/states.js               Kod negeri
 data/2026.json             Snapshot jadual asas rasmi
 tests/planner.test.js      Ujian Node terbina dalam
 docs/DATA.md               Sumber, batasan dan kemas kini
 .github/workflows/test.yml CI ujian
```

## Cara pengiraan

Semua selang dalam tahun dipertimbangkan. Kos = bilangan hari bekerja yang bukan cuti umum; hanya selang dalam bajet diterima. Susunan: hari rehat terbanyak, cuti tahunan paling sedikit, tarikh paling awal. Selepas pilihan pertama, kad alternatif dipilih tanpa bertindih. Masa O(D² log D) termasuk sorting, D ≤ 366; sesuai di pelayar. Pilihan pertama ialah optimum untuk **satu tempoh rehat berterusan**. Kad lain bukan pelan pembahagian bajet tahunan. Pengiraan tidak merentasi sempadan tahun.

## Status data — baca dahulu

Data 2026 ialah **jadual asas**, bukan kalendar terkini yang lengkap. Tidak menjana cuti gantian automatik. Cuti khas, pengumuman baharu, pertindihan perayaan dan polisi majikan boleh mengubah hasil. Antaranya, BKPP telah menerbitkan pindaan / warta tambahan 2026 yang belum digabungkan dalam snapshot ini. Semak dengan sumber rasmi dan majikan, kemudian import dataset disemak yang mengandungi tarikh gantian sebenar. Lihat [sumber dan proses](docs/DATA.md).

## Sumbangan dan lesen

Lihat [CONTRIBUTING.md](CONTRIBUTING.md). Kod di bawah MIT; jadual fakta cuti ditranskripsi daripada sumber kerajaan dengan atribusi, tanpa menyalin PDF atau logo. Tiada hubungan rasmi dengan kerajaan. Repo GitHub: https://github.com/spymasterzul-png/CutiPintarMY.
