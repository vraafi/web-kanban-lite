## Masalah
Papan kanban biasanya bergantung pada library berat. Untuk kebutuhan 3 kolom, ketergantungan itu memperlambat pemuatan dan menyulitkan audit kode. Kami bangun Kanban Lite sebagai alternatif mandiri.

## Yang Dibangun
Papan kanban 3 kolom berbasis web tanpa library. Pengguna dapat menambah, menggeser, dan menghapus kartu. Data tersimpan di localStorage. Navigasi papan ketik didukung penuh. Hasilnya tiga berkas: app.js (6595 B), index.html (1767 B), style.css (4361 B).

## Keputusan Teknis
Kami pisahkan logika, struktur, dan tampilan ke tiga berkas agar mudah diaudit. localStorage dipakai sebagai penyimpanan tanpa server. Dukungan papan ketik kami masukkan sejak awal, bukan tambahan akhir.

## Bukti
QC mencakup 3 lapis aktif: kode, pengguna, visual. Ketiganya lulus dalam 41,2 detik dengan 0 temuan. Pemeriksaan kode mencakup 1 berkas JS, 0 Python, 0 JSON, 0 Lua, dan 2 berkas lain.

## Batasan
Tanpa backend, data terikat pada satu peramban. Tanpa akun, tidak ada sinkronisasi antar perangkat. Skala uji terbatas pada papan 3 kolom, bukan papan besar bertingkat.