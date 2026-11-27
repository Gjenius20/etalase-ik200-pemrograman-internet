# Etalase Karya IK200 — Kelas CTRL-B

Portal katalog karya mahasiswa **IK200 Pemrograman Internet**, Pendidikan Ilmu
Komputer 2025, FPMIPA Universitas Pendidikan Indonesia. Menampilkan media
pembelajaran Informatika, koding, dan kecerdasan artifisial untuk jenjang SD–SMK,
dilengkapi panel admin untuk mengelola project.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions) + TypeScript strict
- **Tailwind CSS v4** dengan token desain hijau/emas/krem yang sama seperti desain asli
- **Prisma 6** + **Neon Postgres**
- **Neon Object Storage** (S3-compatible) untuk logo, screenshot, dan PDF
- **Zod** untuk validasi, **jose** untuk sesi admin, **lucide-react** untuk ikon

## Menjalankan lokal

```bash
npm install
neon login                         # sekali; membuka browser untuk sign-in
neon link --org-id <org> --project-id <project> --branch production -y
neon deploy                        # terapkan neon.ts + tarik env ke .env.local
# isi ADMIN_PASSWORD & AUTH_SECRET di .env.local (tidak di-inject Neon)
# samakan NEON_STORAGE_BUCKET dengan `buckets` di neon.ts
npm run db:migrate
npm run db:seed
npm run dev
```

Project sudah terhubung ke branch Neon `production` lewat `.neon`. `neon.ts`
mendeklarasikan Postgres + bucket `uploads` (`public_read`). Untuk project baru,
jalankan `neon init -y --org-id <org> --project-id <project> --branch production
--services postgres,object-storage` sebagai ganti `neon link`.

`DATABASE_URL` (pooled) dipakai aplikasi; `DATABASE_URL_UNPOOLED` (direct) dipakai
Prisma Migrate lewat `directUrl` di `prisma/schema.prisma`.

Panduan lengkap (CLI, Console, CORS, deploy) ada di [`SETUP-NEON.md`](./SETUP-NEON.md).
Keamanan & rotasi secret: [`SECURITY.md`](./SECURITY.md). Rollback:
[`ROLLBACK.md`](./ROLLBACK.md). CI ada di `.github/workflows/ci.yml`; job E2E
aktif bila repository variable `RUN_E2E=true` dan secrets terisi.

## Rute

| Rute | Keterangan |
| --- | --- |
| `/` | Katalog publik: hero, pencarian, kartu project yang sudah terbit |
| `/proyek/[slug]` | Halaman detail project (screenshot + lightbox, video, PDF) |
| `/admin/login` | Login admin (satu password dari `ADMIN_PASSWORD`) |
| `/admin` | Dashboard: statistik, pencarian, filter status, tabel project |
| `/admin/projects/new` | Form tambah project (7 seksi + pratinjau langsung) |
| `/admin/projects/[id]` | Form edit project |
| `POST /api/admin/uploads/presign` | Presigned PUT ke Neon Object Storage (butuh sesi) |

Tidak ada tautan admin di situs publik. `/admin/*` dilindungi middleware; sesi
berupa cookie JWT `httpOnly` selama 7 hari.

## Alur pengelolaan project

1. Isi **identitas kelompok** (nomor + anggota) dan **informasi aplikasi**.
2. Lengkapi konteks pembelajaran, fitur, screenshot, tautan, dan tiga dokumen PDF.
3. Simpan sebagai **draft** kapan saja (boleh belum lengkap); perubahan juga
   dicadangkan otomatis di `localStorage`.
4. Tombol **Terbitkan** baru aktif setelah semua syarat kelengkapan terpenuhi.
5. Project terbit langsung tampil di katalog publik; menariknya kembali menjadi
   draft akan menyembunyikannya dari publik.

Media dapat diunggah ke Neon Object Storage atau, khusus PDF, ditautkan dari
Google Drive. Mengganti/menghapus media atau project akan membersihkan objek lama
secara best-effort.

## Perintah

```bash
npm run dev          # server pengembangan
npm run build        # build produksi
npm run typecheck    # cek TypeScript
npm run lint         # ESLint
npm run db:migrate   # migrasi Prisma (lokal)
npm run db:deploy    # migrasi Prisma (produksi)
npm run db:seed      # seed 4 project contoh
npm run db:studio    # Prisma Studio
npm run storage:cors # terapkan CORS bucket Neon
npm run verify:neon  # uji alur presign -> PUT -> GET -> hapus objek
npm run verify:media # uji file palsu ditolak di server
npm run verify:a11y # audit aksesibilitas (axe-core)
npm run verify:all  # jalankan semua verifikasi berurutan
npm run audit:check # audit dependency yang sadar triage (CI)
# GET /api/health   -> {"status":"ok","checks":{"database":"ok","storage":"ok"}}
npm run media:cleanup       # dry-run: tampilkan media yatim (default >24 jam)
npm run media:cleanup:apply # hapus media yatim yang ditampilkan

neon config plan     # pratinjau perubahan neon.ts
neon deploy          # terapkan neon.ts + tarik env
neon env pull        # tarik env branch ke .env.local
```

## Struktur singkat

```
neon.ts                    # infra Neon: Postgres + bucket public_read
scripts/
├─ configure-cors.mjs      # CORS bucket Neon
└─ verify-neon-e2e.mjs     # verifikasi upload end-to-end
src/
├─ app/
│  ├─ page.tsx                 # katalog publik
│  ├─ proyek/[slug]/page.tsx   # detail publik
│  ├─ admin/
│  │  ├─ login/                # login admin
│  │  └─ (protected)/          # dashboard + form (dijaga sesi)
│  └─ api/admin/uploads/presign/
├─ actions/                    # Server Actions (auth, project)
├─ components/
│  ├─ public/                  # Navbar, Hero, Catalog, Lightbox, dll.
│  └─ admin/                   # form, uploader, tabel, badge
├─ lib/                        # db, auth, s3, validasi, media, dll.
└─ middleware.ts               # proteksi /admin
prisma/
├─ schema.prisma
└─ seed.ts
```

## Catatan keamanan

- `ADMIN_PASSWORD` dan `AUTH_SECRET` hanya ada di environment; jangan commit
  `.env.local`.
- Login dibatasi 5 percobaan per 15 menit per IP (in-memory).
- Upload memakai presigned PUT berumur 5 menit dan validasi MIME/ukuran di server.
- SVG ditolak untuk mencegah konten aktif pada media publik.
- Response diberi security headers (CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- Akses admin memakai **satu password** dari `ADMIN_PASSWORD` (sesuai desain
  kelas). `AUTH_SECRET` adalah kunci penandatangan sesi — jangan dibagikan;
  siapa pun yang memilikinya bisa membuat JWT admin.
- Rate limit login (5 kegagalan/15 menit) disimpan di tabel Postgres, jadi
  dibagi antar instance serverless. Detail & rotasi secret: [`SECURITY.md`](./SECURITY.md).
