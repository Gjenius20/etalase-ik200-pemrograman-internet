# Keamanan — Etalase Karya IK200

## Model ancaman singkat

| Batas kepercayaan | Aset yang dilindungi | Ancaman utama | Kontrol |
|---|---|---|---|
| Form `/admin/login` | Akses admin | Brute-force password | Rate limit 5 gagal / 15 menit di Postgres, perbandingan `timingSafeEqual`, pesan error generik |
| Cookie sesi | Hak tulis admin | Pencurian/peniruan cookie | `httpOnly`, `secure` di produksi, `sameSite=lax`, HS256, umur 7 hari |
| Server Action admin | Data project | CSRF / akses tanpa sesi | `requireAdmin()` di setiap aksi + middleware `/admin` |
| Endpoint presign | Kredensial storage | Upload tanpa izin, file berbahaya | Cek sesi, allowlist MIME & ukuran, kunci acak, URL 5 menit, SVG ditolak |
| Media publik | Browser pengunjung | Konten aktif/XSS | Magic bytes diperiksa di server sebelum simpan, hanya PNG/JPG/WebP/PDF, `Content-Disposition: attachment` untuk PDF, CSP ketat, iframe YouTube di-allowlist |
| Link eksternal (website/GitHub/Drive/YouTube) | — | SSRF dari server | Tidak ada fetch server-side terhadap URL user; tautan hanya dirender di browser |

Keputusan desain: **satu akun admin** dengan `ADMIN_PASSWORD` dari environment.
Ini disepakati untuk kebutuhan kelas dan tidak akan diganti ke Neon Auth tanpa
persetujuan. Konsekuensinya: tidak ada identitas per-user dan audit trail
per-orang; gunakan `AUTH_SECRET` dan `ADMIN_PASSWORD` sebagai kredensial bersama
yang dijaga ketat.

## Rate limit login

- Penghitung disimpan di tabel `LoginAttempt` (Postgres), bukan di memori proses,
  sehingga tetap benar di Vercel serverless dengan banyak instance.
- Kunci = `login:<ip>` dari `x-forwarded-for` / `x-real-ip`, dibatasi 128 karakter.
- Hanya **kegagalan** yang dihitung. Gagal ke-6 dalam jendela 15 menit ditolak
  sampai jendela berakhir. Login berhasil menghapus barisnya.
- Verifikasi: `npm run verify:rate-limit` (memakai IP uji agar IP asli tidak terkunci).

## Rotasi `AUTH_SECRET`

`AUTH_SECRET` lebih kritis daripada `ADMIN_PASSWORD`: siapa pun yang memilikinya
dapat menandatangani JWT admin tanpa mengetahui password.

1. Buat secret baru:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Ganti `AUTH_SECRET` di `.env.local` **dan** di dashboard Vercel.
3. Restart/redeploy. Semua sesi lama otomatis tidak valid (JWT ditandatangani
   dengan secret lama), sehingga admin harus login ulang.
4. Hapus secret lama dari catatan/riwayat chat/terminal bila pernah tercatat.

Rotasi `ADMIN_PASSWORD` cukup mengganti env dan restart; sesi yang sudah aktif
tetap berlaku sampai kedaluwarsa. Jika ingin mencabut sesi langsung, lakukan rotasi
`AUTH_SECRET` juga.

## Flag produksi

- Jangan commit `.env*` (kecuali `.env.example`).
- `npm audit` harus di-triage sebelum rilis; lihat tabel penundaan di `progress.md`.
- CORS bucket hanya origin eksplisit (`localhost` + domain produksi), bukan `*`.
- Security headers aktif global (lihat `next.config.ts`).
- Log tidak boleh memuat password, token, atau connection string.
