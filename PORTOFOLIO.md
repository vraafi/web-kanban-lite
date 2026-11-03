## Masalah
Papan kanban sering butuh library berat. Untuk kebutuhan tiga kolom, itu menambah dependensi tanpa nilai tambah.

## Yang Dibangun
Kanban Lite: papan tiga kolom tanpa library. Pengguna bisa menambah, menggeser, dan menghapus kartu. Data tersimpan di localStorage. Papan ketik didukung.

Hasil: app.js (5901 B), index.html (1341 B), style.css (3574 B).

## Keputusan Teknis
JavaScript murni tanpa dependensi. State disimpan di localStorage agar data bertahan tanpa backend. Kendali papan ketik dipasang di level dokumen supaya operasi kartu bisa dilakukan tanpa mouse.

## Bukti
QC mencakup tiga lapis: kode, pengguna, visual. Ketiganya lulus. Waktu QC 41,23 detik. Temuan: 0. Rincian kode: 1 JS, 0 py, 0 json, 0 lua, 2 lain.

## Batasan
Hanya tiga kolom. Tidak ada backend, sinkronisasi, atau multi-pengguna. Skala data dibatasi kapasitas localStorage. Kode belum diuji untuk volume kartu besar.