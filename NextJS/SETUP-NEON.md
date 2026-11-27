# Setup Neon (Postgres + Object Storage)

Panduan ini menyiapkan database dan media untuk Etalase IK200, lalu menjalankan
aplikasi secara lokal. Semua langkah memakai dashboard Neon dan CLI; tidak perlu
Supabase.

> Catatan versi: langkah mengikuti dokumentasi Neon per November 2026
> (<https://neon.com/docs/storage/get-started>). Jika UI Console berubah, istilah
> intinya tetap sama: **project → branch → Object storage → bucket + credential**.

---

## 0. Prasyarat

- Node.js 20.6+ (proyek ini dikembangkan dengan Node 24).
- Akun Neon.
- Project Neon berada di region yang mendukung Object Storage:
  `aws-us-east-1`, `aws-us-east-2`, `aws-eu-central-1`, atau `aws-ap-southeast-1`.
  **Region tidak bisa diubah setelah project dibuat** — buat project baru bila salah.

---

## 0a. Setup via Neon CLI (dipakai project ini)

Cara tercepat dan sumber kebenaran untuk branch `production`:

```bash
neon login                       # browser sign-in, sekali per mesin
neon init -y \
  --org-id org-solitary-river-35497588 \
  --project-id nameless-hat-59444998 \
  --branch production \
  --services postgres,object-storage
neon deploy                      # apply neon.ts + tarik env ke .env.local
```

`neon.ts` di root mendeklarasikan bucket `uploads` dengan `access: "public_read"`.
Ubah declaration di sana bila nama/akses bucket berubah, lalu:

```bash
neon config plan                 # dry-run
neon deploy                      # reconcile + env pull
```

Apabila `neon init` terputus setelah skill agent terpasang (mis. harness restart),
pakai jalur manual yang setara:

```bash
neon link --org-id <org> --project-id <project> --branch production -y --no-config
neon config init --services postgres,object-storage
# edit neon.ts: uploads -> { access: "public_read" }
neon deploy
```

Variabel yang di-inject Neon ke `.env.local`: `DATABASE_URL` (pooled),
`DATABASE_URL_UNPOOLED` (direct), `AWS_REGION`, `AWS_ENDPOINT_URL_S3`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `NEON_BRANCH`, `NEON_BRANCH_ID`,
`NEON_FUNCTION_HOST_SUFFIX`.

Yang **tidak** di-inject dan harus diisi manual:

- `ADMIN_PASSWORD` dan `AUTH_SECRET` (minimal 32 karakter).
- `NEON_STORAGE_BUCKET="uploads"` — samakan dengan kunci `buckets` di `neon.ts`.

Next.js memprioritaskan `.env.local` daripada `.env`. Idealnya hanya ada satu
file env lokal; hapus `.env` bila kosong/tidak konsisten agar `neon env pull` tidak
menulis ke file lain.

---

## 1. Database Postgres

Jika memakai alur CLI di bagian 0a, connection string sudah ada di `.env.local`
(`DATABASE_URL` + `DATABASE_URL_UNPOOLED`) — langkah salin manual di bawah hanya
dibutuhkan untuk setup lewat Console.

1. Buat project di <https://console.neon.tech> pada salah satu region di atas.
2. Buka **Dashboard → Connect** dan salin connection string.
3. Ada dua bentuk host:
   - **Pooled** (disarankan untuk runtime/deploy): `ep-xxx-pooler.<region>.aws.neon.tech`
   - **Direct** (disarankan untuk migrasi lokal): `ep-xxx.<region>.aws.neon.tech`

Tambahkan parameter berikut pada URL:

```
?sslmode=require&pgbouncer=true&connect_timeout=15
```

`pgbouncer=true` hanya untuk host pooled. Untuk migrasi lokal, pakai host direct
tanpa `pgbouncer=true`.

---

## 2. Object Storage

### 2a. Buat bucket `public_read`

Lewat Console:

1. Pilih project → branch (biasanya `main`).
2. Buka tab **Object storage** → **New bucket**.
3. Nama: `etalase-media` (bebas, samakan dengan `NEON_STORAGE_BUCKET`).
4. Access level: **public_read** (agar gambar/PDF bisa dibuka tanpa credential).
5. **Create**.

Lewat CLI:

```bash
npx neon buckets create etalase-media --access-level public_read
```

Access level **tidak bisa diubah** setelah bucket dibuat. Kalau salah, buat bucket
baru lalu pindahkan objeknya.

### 2b. Buat credential storage

Lewat CLI:

```bash
npx neon credentials create --scope storage:read --scope storage:write
```

Atau lewat API:

```bash
curl -X POST "https://console.neon.tech/api/v2/projects/{project_id}/branches/{branch_id}/credentials" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scopes": ["storage:read", "storage:write"], "principal_type": "user"}'
```

Respons berisi nilai yang **hanya ditampilkan sekali**:

| Respons Neon | Variabel lingkungan |
| --- | --- |
| `token_id` (`nak_live_…`) | `AWS_ACCESS_KEY_ID` |
| `s3_secret_access_key` (`nsk_live_…`) | `AWS_SECRET_ACCESS_KEY` |

### 2c. Ambil endpoint dan region

```bash
curl "https://console.neon.tech/api/v2/projects/{project_id}/branches/{branch_id}/storage" \
  -H "Authorization: Bearer $NEON_API_KEY"
```

Contoh respons:

```json
{
  "enabled": true,
  "s3_endpoint": "https://br-winter-pond-aptw82ef.storage.c-2.us-east-2.aws.neon.tech",
  "region": "us-east-2",
  "force_path_style": true
}
```

- `s3_endpoint` → `AWS_ENDPOINT_URL_S3`
- `region` → `AWS_REGION`

Alternatif: `npx neon env pull` akan menulis `AWS_*` ke `.env.local` secara
otomatis bila project sudah di-link (`npx neon link`).

---

## 3. Isi `.env.local`

```powershell
Copy-Item .env.example .env.local
```

Isi minimal:

```dotenv
DATABASE_URL="postgresql://…direct…?sslmode=require&connect_timeout=15"
ADMIN_PASSWORD="password-pilihan-anda"
AUTH_SECRET="hasil-random-32-byte"

AWS_REGION="us-east-2"
AWS_ENDPOINT_URL_S3="https://br-xxxx.storage.c-2.us-east-2.aws.neon.tech"
AWS_ACCESS_KEY_ID="nak_live_…"
AWS_SECRET_ACCESS_KEY="nsk_live_…"
NEON_STORAGE_BUCKET="etalase-media"
NEON_STORAGE_PUBLIC_BASE_URL=""
CORS_ORIGINS=""
```

Buat `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`NEON_STORAGE_PUBLIC_BASE_URL` boleh kosong; default-nya
`${AWS_ENDPOINT_URL_S3}/${NEON_STORAGE_BUCKET}`.

`prisma.config.ts` memuat `.env.local` (lalu `.env`) secara otomatis, sehingga
`npm run db:migrate`, `db:seed`, dan `db:studio` memakai file env yang sama
dengan Next.js.

---

## 4. Migrasi dan seed

`DATABASE_URL` (pooled) dipakai aplikasi saat runtime. Untuk migrasi, Prisma
memakai `DATABASE_URL_UNPOOLED` (direct) melalui `directUrl` di
`prisma/schema.prisma` dan `prisma.config.ts` — jadi tidak perlu menukar nilai
`DATABASE_URL` secara manual.

```bash
npm run db:migrate   # menerapkan migration, lalu generate client
npm run db:seed      # 4 project contoh, berstatus terbit
```

Catatan Windows: hentikan `next dev` sebelum `prisma generate` bila muncul
`EPERM: operation not permitted, rename ... query_engine-windows.dll.node`.

Migrasi awal sudah tersedia di `prisma/migrations/20261127000000_init`, jadi
`db:migrate` langsung menerapkannya tanpa perlu membuat nama migrasi baru.

Alternatif cepat tanpa file migrasi (hanya untuk eksperimen lokal):

```bash
npm run db:push
npm run db:seed
```

Untuk database produksi yang sudah punya migrasi:

```bash
npm run db:deploy
```

Jika migrasi gagal karena PgBouncer, ganti sementara `DATABASE_URL` ke host
**direct**, jalankan migrasi, lalu kembalikan ke host **pooled** untuk runtime.

---

## 5. Aktifkan CORS bucket

Browser mengunggah langsung ke Neon (presigned PUT), jadi bucket harus mengizinkan
origin aplikasi.

```bash
# default sudah mencakup http://localhost:3000 dan http://127.0.0.1:3000
npm run storage:cors

# tambahkan domain produksi
$env:CORS_ORIGINS="https://etalase-kelas.vercel.app"; npm run storage:cors
```

Script memanggil `PutBucketCors` dengan metode `PUT, GET, HEAD`. Untuk mengubah
aturan, edit `scripts/configure-cors.mjs`.

---

## 6. Jalankan aplikasi

```bash
npm run dev
```

- Publik: <http://localhost:3000>
- Admin: <http://localhost:3000/admin/login> (password = `ADMIN_PASSWORD`)

Uji cepat:

1. Login → dashboard menampilkan 4 project seed.
2. Tambah project → isi form → unggah logo/screenshot/PDF → simpan draft.
3. Terbitkan → buka `/proyek/<slug>` di jendela incognito.
4. Ganti logo → cek objek lama terhapus di bucket (best-effort).
5. Hapus project → data + media ikut dibersihkan.

---

## 7. Deploy ke Vercel

1. Import repo ke Vercel (root directory: `NextJS`).
2. Tambahkan environment variables yang sama seperti `.env.local`, tetapi
   `DATABASE_URL` memakai host **pooled** + `pgbouncer=true`.
3. Jalankan migrasi produksi sekali dari lokal:

   ```bash
   $env:DATABASE_URL="postgresql://…direct…"; npm run db:deploy
   ```

   Atau jalankan dari CI dengan secret `DATABASE_URL` direct.
4. Deploy. Build otomatis menjalankan `prisma generate` lewat `postinstall`.
5. Setelah domain produksi diketahui, jalankan ulang CORS:

   ```bash
   $env:CORS_ORIGINS="https://domain-anda.vercel.app"; npm run storage:cors
   ```

Catatan: Object Storage Neon tidak memakai CDN dan dilayani dari region project.
Untuk audiens Indonesia, region Singapura (`aws-ap-southeast-1`) memberi latensi
terbaik.

---

## 8. Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| `AUTH_SECRET belum diatur` | env kosong / < 32 karakter | isi `AUTH_SECRET`, restart dev server |
| Login selalu "Password salah" | `ADMIN_PASSWORD` berbeda / server belum restart | samakan env, restart |
| Upload gagal `403`/CORS | origin belum diizinkan | jalankan `npm run storage:cors` dengan origin yang benar |
| Upload gagal `400` saat PUT | `requestChecksumCalculation` tidak diset | sudah ditangani di `src/lib/s3.ts`; jangan hapus opsi tersebut |
| `P1001` / koneksi DB gagal | URL salah atau butuh direct | cek host/region, coba connection string direct |
| Migrasi gagal via pooled | PgBouncer membatasi DDL | pakai host direct untuk migrasi |
| Gambar publik 404 | bucket bukan `public_read`, atau `NEON_STORAGE_PUBLIC_BASE_URL` salah | cek bucket + URL publik |
| `prisma generate` saat build | client belum dibuat | `postinstall` sudah menjalankan generate; pastikan `prisma/schema.prisma` ikut ter-deploy |

---

## 9. Perintah berguna

```bash
npm run typecheck        # TypeScript strict
npm run lint             # ESLint
npm run build            # build produksi
npm run db:studio        # Prisma Studio
npm run db:seed          # seed idempotent (upsert berdasarkan slug)
npm run storage:cors     # terapkan CORS bucket
npm run verify:neon      # uji presign -> PUT -> GET -> hapus objek

neon config plan         # pratinjau perubahan infra
neon deploy              # terapkan neon.ts + tarik env
```
