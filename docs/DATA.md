# Data cuti

Sumber utama: [Jadual BKPP JPM 2026](https://www.kabinet.gov.my/storage/2025/08/HKA-2026.pdf), halaman 1–3. Metadata semakan: 29 Oktober 2026. Snapshot ini mengekalkan jadual asas dan bukan pengesahan bahawa semua pindaan telah digabungkan.

Rujukan kemas kini:
- [Indeks Hari Kelepasan Am BKPP](https://www.kabinet.gov.my/hari-kelepasan-am/) — jadual tahun berikutnya.
- [Akta dan Warta BKPP](https://www.kabinet.gov.my/akta-dan-warta/) — pindaan dan hari tambahan.
- [Warta tambahan Raya 2026](https://www.kabinet.gov.my/storage/2026/03/PUB-111_2026.pdf) — pengisytiharan bersyarat; belum dimasukkan.
- [Portal rasmi Johor](https://www.johor.gov.my/rakyat/cuti-umum-2) — semakan silang negeri.
- [Portal rasmi Kelantan](https://administration.kelantan.gov.my/index.php/rakyat/penerbitan/takwim-cuti/takwim-cuti-2026) — semakan silang negeri.

BKPP turut mengumumkan 2 Jun 2026 sebagai gantian Wesak bagi negeri yang menetapkan Ahad sebagai hari kelepasan mingguan. Snapshot tidak menganggap aturan gantian seragam bagi semua negeri atau majikan. Sabah dan Sarawak serta cuti bertindih perlu disemak berasingan.

## Kontrak import

```json
{"year":2027,"status":"Data pengguna — belum disahkan","holidays":[{"date":"2027-01-01","name":"Tahun Baharu","states":["SGR"]}]}
```

Contoh di atas menerangkan format sahaja, bukan dataset lengkap. Kod negeri ada dalam `src/states.js`. Tarikh ISO mesti sah dan dalam tahun yang sama. Satu rekod boleh meliputi beberapa negeri; beberapa nama pada tarikh sama tidak menambah kos atau hari rehat. Jangan masukkan hari hujung minggu sebagai cuti gantian tanpa bukti.

## Proses penyelenggaraan

Transkripsi jadual → semak setiap tanda negeri dan tarikh → semak warta/pindaan → tambah gantian yang disahkan → rekod URL, tarikh semakan dan skop liputan → jalankan ujian → semakan manusia melalui PR. Untuk v0.2, tambah provenance per rekod dan status kelengkapan sebelum memaparkan dataset sebagai lengkap. Jangan menyalin jadual tahun lepas atau menjangka tarikh perayaan bergerak.
