# Rencana Rollback

Alur deploy diatur oleh pemilik project (Vercel + Neon). Dokumen ini hanya
menjadi panduan saat rilis, bukan prosedur yang dijalankan otomatis.

## Pemicu rollback

- Error rate naik > 2x baseline, atau halaman publik/detail gagal dimuat.
- Upload presign/PUT gagal massal.
- Data project hilang/berubah setelah deploy atau migrasi.
- Kerentanan keamanan ditemukan pada rilis tersebut.

## Langkah cepat

1. **Kode**: di Vercel, pilih deployment sebelumnya → **Promote to Production**.
   Atau revert commit lalu push. Verifikasi `GET /api/health` → 200 dan alur
   katalog publik normal.
2. **Konfigurasi**: kembalikan environment variable ke nilai rilis sebelumnya
   (terutama `DATABASE_URL`, `AWS_*`, `AUTH_SECRET`). Perubahan `AUTH_SECRET`
   mencabut semua sesi — admin harus login ulang.
3. **Database**: Prisma Migrate tidak otomatis membatalkan migrasi.
   - Migrasi `20261127070900_login_rate_limit` hanya menambah tabel
     `LoginAttempt`; aman dibiarkan walau kode di-rollback.
   - Untuk perubahan destruktif di masa depan, siapkan migrasi kebalikan dan
     uji di branch Neon sebelum diterapkan ke `production`.
   - Alternatif cepat: restore branch Neon dari snapshot sebelum rilis, lalu
     perbarui `DATABASE_URL` bila endpoint berubah.
4. **Storage**: objek yang terhapus tidak bisa dikembalikan dari bucket. Hindari
   `media:cleanup:apply` bersamaan dengan deploy; jalankan di luar jendela rilis.

## Verifikasi setelah rollback

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://<domain>/api/health   # 200
curl -sS -o /dev/null -w '%{http_code}\n' https://<domain>/             # 200
```

Lalu cek manual: login admin, satu project terbit tampil, dan satu upload
small file berhasil.

## Catatan

- Simpan durasi rollback target: kode < 5 menit, DB < 15 menit.
- Setiap rilis harus menyebut commit/manifest yang dipakai supaya rollback
  tidak menebak.
