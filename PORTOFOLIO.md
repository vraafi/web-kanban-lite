## Masalah
Banyak papan kanban web bergantung pada library besar. Itu menambah beban muatan dan permukaan bug. Untuk kebutuhan sederhana—tiga kolom, tambah, geser, hapus kartu—ketergantungan itu tidak sepadan.

## Yang Dibangun
Kanban Lite: papan kanban web tiga kolom tanpa library. Pengguna dapat menambah, menggeser, dan menghapus kartu. Semua data tersimpan di localStorage, sehingga papan tetap ada setelah halaman dimuat ulang. Dukungan papan ketik disertakan agar operasi kartu tidak bergantung pada tetikus.

## Keputusan Teknis
Kode ditulis langsung dalam JavaScript, HTML, dan CSS tanpa dependensi runtime. app.js berukuran 8648 B, index.html 1639 B, style.css 4435 B, dan README.md 829 B. Seluruh state disimpan di localStorage. Interaksi papan ketik ditangani di lapisan kode yang sama, bukan sebagai lapisan tambahan.

## Bukti
QC menjalankan 3 lapis aktif: kode, pengguna, dan visual. Ketiganya lulus dalam 77,02 detik dengan 0 temuan. Rincian berkas: 1 berkas JS, 1 berkas JSON, 6 berkas lain.

## Batasan
Lingkup sengaja dibatasi: tiga kolom, tanpa penyuntingan kartu, tanpa sinkronisasi lintas perangkat. Data hanya hidup di localStorage peramban tempat kartu dibuat.