# Progress — Etalase Karya IK200 (Next.js + Admin)

Terakhir diperbarui: 2026-11-27
Status keseluruhan: **Fase 0–5 + P0–P5 selesai; Neon production terhubung, seluruh verifikasi (login, rate limit, CRUD, upload, media, a11y, health) lolos. Yang tersisa murni operasional milik user: deploy Vercel, env produksi, CORS domain, dan monitoring eksternal (~100% kode)**
Dokumen acuan: `PRD.md` (di folder ini), panduan setup: `SETUP-NEON.md`

> Cara pakai file ini: setiap sesi baru, baca `PRD.md` lalu `progress.md`. Kerjakan item
> pertama yang belum dicentang pada fase berjalan, perbarui centang + catatan, dan isi
> bagian "Log Sesi". Jangan mengubah keputusan di bagian "Keputusan Final" tanpa konfirmasi.

---

## Kondisi Saat Ini

- Kode Fase 0–5 lengkap: publik, detail, auth, CRUD admin, form 7 seksi,
  upload presigned, pembersihan media best-effort.
- Neon **production** tertaut via `.neon`; `neon.ts` mendeklarasikan Postgres +
  bucket `uploads` (`public_read`). `neon deploy` sudah dijalankan.
- `.env.local` berisi `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct),
  `AWS_*`, `NEON_BRANCH*`, `ADMIN_PASSWORD`, `AUTH_SECRET`, dan
  `NEON_STORAGE_BUCKET="uploads"`. File `.env` kosong sudah dihapus.
- Migrasi diterapkan; seed 4 project berhasil. Ada 1 project tambahan
  (`mathquest`, kelompok 8) dari sesi sebelumnya — **bukan** hasil test, jangan
  dihapus tanpa konfirmasi.
- CORS bucket aktif untuk localhost. Verifikasi lolos: `typecheck`, `lint`,
  `build`, `npm run verify:neon` (presign→PUT→GET→hapus), `npm run verify:ui`
  (login salah/benar, create/edit/unpublish/publish/delete via browser Edge,
  logout) — tanpa page error.
- Security headers aktif di semua route (CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- Dependensi: `playwright-core` (dev) untuk test UI; `@neon/config` + `@neon/env`
  dari `neon config init`. `npm audit`: 7 temuan (1 moderate, 6 high), semua
  butuh major upgrade — ditunda dengan alasan di bawah.
- Belum: P1–P5 (lihat "Rencana Production Readiness"), deploy Vercel (user yang
  mengatur), dan perbandingan visual vs desain Vite.
- Folder referensi desain (jangan diubah): `../etalase-ik200-pemrograman-internet`.

---

## Keputusan Final (jangan diubah tanpa tanya user)

1. Stack: Next.js 15 App Router + TypeScript + Tailwind v4 + Prisma + Zod.
2. Database: Neon Postgres.
3. Media: Neon Object Storage (S3-compatible), bucket `public_read`, upload via presigned PUT.
4. Autentikasi: satu password dari ENV + sesi JWT cookie httpOnly (`jose`), bukan tabel user.
5. Halaman detail publik: halaman tersendiri `/proyek/[slug]`, **tanpa modal**.
6. Form admin: satu halaman, 7 section bertahap, preview live, draft recovery `localStorage`.
7. PDF: bisa upload ke Neon **atau** tempel link Drive (pilihan per dokumen).
8. Logo & screenshot: upload file (bukan link Drive).
9. Seed 4 project contoh, berstatus terbit.
10. Kelengkapan wajib sebelum terbit; draft boleh belum lengkap.
11. Deskripsi singkat dibatasi 180 karakter (± 2 baris).
12. Screenshot menerima PNG/JPG/WebP (peringatan halus jika bukan PNG), SVG ditolak.
13. Slug otomatis dari nama aplikasi, stabil setelah dibuat.
14. Tidak ada link admin di situs publik.

---

## Fase 0 — Scaffold & Fondasi

- [x] `create-next-app` di `NextJS/` (TypeScript, App Router, Tailwind, ESLint, src dir,
      import alias `@/*`) — Next 15.5.29
- [x] Pasang dependency: `prisma @prisma/client zod jose @aws-sdk/client-s3
      @aws-sdk/s3-request-presigner lucide-react` + dev: `tsx`
- [x] Set `next.config.ts` (jika perlu), `tsconfig` strict, script `db:seed`
- [x] Token warna brand + font Plus Jakarta Sans di `globals.css` / `layout.tsx`
- [x] Salin `public/images/*` dari project Vite (4 logo)
- [x] Buat `.env.example` dan pastikan `.env*` masuk `.gitignore`
- [x] Pastikan `npm run lint` + `npm run build` awal lolos

---

## Fase 1 — Database, Auth, Middleware

- [x] `prisma/schema.prisma` sesuai PRD bagian 6 (Project, Member, enum ProjectStatus)
- [x] `prisma/seed.ts` (4 project, idempotent, konversi data `projects.json`) — belum dijalankan
- [x] `src/lib/db.ts` (Prisma singleton)
- [x] `src/lib/auth.ts` (sign/verify JWT, cookie, `requireAdmin`, rate limit login)
- [x] `src/middleware.ts` (proteksi `/admin`, kecuali `/admin/login`)
- [x] `src/app/admin/login/page.tsx` + Server Action login/logout
- [x] `src/app/admin/layout.tsx` (shell admin + guard)
- [x] Halaman `/admin` dasar (placeholder) agar redirect login bisa diuji

Catatan Fase 1:
- `src/lib/session.ts` dipisah dari `auth.ts` agar aman di Edge (middleware).
- Login memakai `crypto.timingSafeEqual` + rate limit 5 percobaan/15 menit.
- `npx prisma generate` sudah dijalankan; migrasi & seed menunggu `DATABASE_URL`.
- Smoke test: `/admin` tanpa sesi → 307 ke `/admin/login?next=…`; cookie palsu
  ditolak; cookie JWT valid (ditandatangani manual) → dashboard render.

---

## Fase 2 — Halaman Publik

- [x] `src/app/layout.tsx` (metadata, font, body class)
- [x] Komponen publik: `Navbar`, `HeroSection`, `Footer`, `AppLogo`
- [x] `FilterBar` + `Catalog` (client search: app, kelompok, deskripsi, anggota, fitur)
- [x] `AppCard` (sekarang `<Link>` ke detail + ikon website)
- [x] `src/app/page.tsx` (fetch project terbit, urut nomor kelompok, empty state)
- [x] `src/app/proyek/[slug]/page.tsx` (seluruh section detail, 404 untuk draft)
- [x] `ScreenshotGallery` + `Lightbox` (keyboard Esc/←/→, fallback gambar rusak)
- [x] `generateMetadata` halaman detail
- [ ] Cek visual desktop & mobile vs desain Vite (belum dibandingkan di browser)

---

## Fase 3 — Admin CRUD Inti

- [x] `src/lib/validation/project.ts` (schema Zod create/update + tipe + kelengkapan)
- [x] `src/lib/slug.ts` (generate unique slug)
- [x] Kelengkapan ada di `src/lib/validation/project.ts` (`getPublishProblems`,
      `computeCompleteness`) — dipakai form, dashboard, dan Server Action
- [x] `src/actions/projects.ts` (`saveProject` draft/terbit, `deleteProject`,
      `setProjectStatus`, revalidatePath, pembersihan media)
- [x] Dashboard: stat cards, pencarian, filter status, tabel responsif, empty state
- [x] `ProjectManager` + `StatusBadge` + `CompletenessMeter`
- [x] Dialog hapus + toast
- [x] Halaman `/admin/projects/new` dan `/admin/projects/[id]` (load data + guard 404)

---

## Fase 4 — Form Lengkap

- [x] `SectionCard` (collapsible, nomor, badge error) + pratinjau kartu sticky
- [x] Field dasar via `FormField` + input/textarea dengan counter karakter
- [x] Anggota (1–10, nama + NIM, naik/turun, hapus) dan fitur (1–8, naik/turun)
- [x] `LogoUploader` (validasi tipe/ukuran, preview, ganti/hapus, progress)
- [x] `ScreenshotEditor` (multi, progress, caption, urutan, hapus, URL manual,
      peringatan halus bila bukan PNG)
- [x] `DocumentUploader` (segmented upload/link, validasi, ganti/hapus)
- [x] Normalisasi URL YouTube → `youtubeId` + pratinjau thumbnail
- [x] Kelengkapan: tombol terbit memvalidasi dulu, daftar kekurangan bisa diklik
      untuk scroll ke seksi terkait
- [x] Draft `localStorage` + banner pemulihan + guard `beforeunload`
- [x] Error mapping server → field (`aria-invalid`, badge per seksi, scroll otomatis)
- [x] Toast sukses + redirect ke halaman edit setelah project baru dibuat

---

## Fase 5 — Media / Neon Object Storage

- [x] `src/lib/s3.ts` (S3Client, `forcePathStyle`, checksum saat diperlukan,
      public URL, presigned PUT 5 menit, delete best-effort)
- [x] `src/app/api/admin/uploads/presign/route.ts` (auth, kind/MIME/size, key acak)
- [x] Helper upload klien (`XMLHttpRequest` + progress) dipakai logo/screenshot/PDF
- [x] Simpan `url` + `key` ke DB; hapus objek lama saat diganti/dihapus (best-effort)
- [x] Panduan CORS + script `npm run storage:cors`
- [ ] Uji upload nyata setelah `.env` tersedia

---

## Fase 6 — Seed, Dokumentasi, Verifikasi

- [x] `prisma generate` + migrasi awal `prisma/migrations/20261127000000_init`
- [x] Jalankan `migrate dev` (via `DATABASE_URL_UNPOOLED`); `db:deploy` production
      tetap menjadi tanggung jawab user saat deploy
- [x] Jalankan seed: 4 project contoh tampil di publik (plus 1 project lama)
- [x] `SETUP-NEON.md`: project/branch, bucket public_read, credential, CORS, env,
      migrate/seed, deploy Vercel
- [x] `README.md`: stack, cara jalan, rute, perintah, catatan keamanan
- [x] Uji alur end-to-end via browser: login (salah/benar) → tambah draft → edit →
      tarik → terbit → hapus → logout; upload via `verify:neon` (lihat Log Sesi)
- [x] `npm run lint`, `npm run typecheck`, `npm run build`
- [x] `.env.example` lengkap; `.env.local` masuk `.gitignore` (tidak ada secret
      yang ikut ter-commit)

---

## Batasan Diketahui (disengaja)

- Media yang diunggah lalu form ditinggalkan tanpa disimpan akan menjadi objek
  yatim. Pembersihan hanya best-effort saat ganti/hapus media atau hapus project;
  belum ada pembersihan terjadwal (sesuai PRD).
- Rate limit login sekarang disimpan di tabel `LoginAttempt` (Postgres), bukan
  memori proses. Perlu migrasi `20261127070900_login_rate_limit` terpasang.
- Screenshot tidak melalui `next/image` (domain storage dinamis), jadi tidak ada
  optimasi/resize otomatis.
- Satu akun admin berbasis `ADMIN_PASSWORD`; tidak ada manajemen pengguna/audit
  log perubahan.
- Bucket Neon Object Storage tidak memakai CDN; latensi bergantung region project.
- SVG sengaja ditolak untuk media publik agar tidak ada konten aktif.
- Belum ada pagination katalog; diasumsikan jumlah project satu kelas masih kecil.

---

## Blocker / Butuh dari User

- [x] Project Neon region `aws-us-east-2` + bucket `uploads` (`public_read`)
- [x] `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct), kredensial storage
- [x] `ADMIN_PASSWORD` dan `AUTH_SECRET`
- [ ] Deploy Vercel + env produksi + CORS domain produksi (**user yang mengatur**)
- [ ] Keputusan P1: rate limit shared store & monitoring error (boleh/tidak)
- [ ] Keputusan: admin tetap satu password dari env (sudah disepakati — jangan
      diubah ke Neon Auth tanpa konfirmasi)

Tidak ada blocker teknis untuk pengembangan lokal.

---

## Audit Dependensi (2026-11-27)

`npm audit`: 7 temuan (1 moderate, 6 high). **Tidak ada perbaikan non-breaking.**
Tidak menjalankan `npm audit fix --force` karena akan menaikkan Prisma 7, Next 16,
dan Zod 4 (breaking). Triage:

| Paket | Kerentanan | Reachability | Keputusan |
|---|---|---|---|
| `deepmerge-ts`, `effect` via `@prisma/config` | stack exhaustion / ReDoS | Build & migrasi (CLI), bukan runtime aplikasi | Tunda; tinjau saat upgrade Prisma 7 |
| `postcss` via `next` | XSS / path traversal sourceMappingURL | Build-time; CSS project sendiri, bukan input user | Tunda; tinjau saat upgrade Next 16 |
| `zod` | memory exhaustion pada koleksi terikat besar | Form admin; input dibatasi (≤10 anggota, ≤8 fitur) & butuh sesi | Tunda; tinjau saat migrasi Zod 4 |

Review date: 2026-12-27 (atau lebih awal jika ada major upgrade yang direncanakan).

## Rencana Production Readiness

- **P0 (selesai)**: rapikan env & docs, triage audit, security headers, uji login
  form asli + CRUD via browser.
- **P1 (selesai)**: threat model + runbook di `SECURITY.md`, rate limit dipindah
  ke tabel Postgres `LoginAttempt` (migrasi `20261127070900_login_rate_limit`),
  verifikasi `npm run verify:rate-limit`. Admin tetap satu password dari env.
- **P2 (selesai)**: `findMismatchedMedia` di `s3.ts` dipanggil `saveProjectAction`
  sebelum menulis DB; header `Content-Disposition`/`Cache-Control` ikut ditandatangani
  & dikirim klien; `npm run media:cleanup` (dry-run) + `:apply`; tidak ada SSRF
  (tidak ada fetch server-side ke URL user).
- **P3 (selesai)**: `/api/health` (DB + storage, 200/503), request ID di semua
  response via middleware, logger JSON dengan redaksi secret, `error.tsx` +
  `global-error.tsx`, rencana rollback di `ROLLBACK.md`. Error reporting eksternal
  belum dipasang (butuh akun/sink dari user).
- **P4 (selesai)**: audit axe-core di 5 halaman → 0 temuan serius/kritis
  (iframe YouTube pihak ketiga dikecualikan). Kontras `text-slate-500`→`-600`,
  label input file, dan nama aksesibel galeri diperbaiki. First Load JS 127–159 kB.
- **P5 (selesai)**: `.github/workflows/ci.yml` (quality + E2E opsional),
  `npm run audit:check` dengan allowlist, `npm run verify:all`, launcher browser
  portabel. Uji branch-first `neon checkout dev-e2e-p0 --create --no-env-pull`
  berhasil (TTL + bucket public_read), branch dihapus, konteks kembali production.
  Deploy Vercel & env produksi tetap **diatur user**.

Tidak dilakukan tanpa persetujuan: ganti ORM/driver, ganti model auth, ubah CORS
atau rate limit, tambah layanan eksternal, `audit fix --force`.

## Log Sesi

### 2026-11-27 — P5: CI & branch-first
- `.github/workflows/ci.yml`: job `quality` (lint, typecheck, build, audit) dan
  job `e2e` yang hanya jalan bila repository variable `RUN_E2E=true` dan secrets
  Neon/DB terisi. E2E meng-install Chromium versi 1.65.1 yang cocok dengan
  `playwright-core`.
- `security-audit-allowlist.json` + `npm run audit:check`: CI gagal hanya bila
  muncul advisory baru/level lebih tinggi dari triage. Bug Windows `spawnSync npm
  ENOENT` diperbaiki dengan `execSync("npm audit --json")` (shell-aware).
- `scripts/browser.mjs` menyatukan launcher browser: Edge di Windows,
  `CHROME_PATH`/`PLAYWRIGHT_CHANNEL` untuk override/CI.
- `npm run verify:all` menjalankan kelima verifikasi berurutan.
- Branch-first: `neon checkout dev-e2e-p0 --create --no-env-pull` → TTL 7 hari
  dari `neon.ts`, bucket `uploads` `public_read` diwarisi; `neon checkout
  production --no-env-pull`; `neon branches delete dev-e2e-p0 -y`. `.env.local`
  tidak berubah sama sekali.

### 2026-11-27 — P4: aksesibilitas
- `@axe-core/playwright` + `npm run verify:a11y` memeriksa `/`,
  `/proyek/algoblock-sd`, `/admin/login`, `/admin`, `/admin/projects/new`.
- Temuan awal (7 serius/kritis): kontras `text-slate-500` di latar cream (4.44:1),
  tiga tombol galeri `label-content-name-mismatch`, dua input file tanpa label,
  plus isu internal iframe YouTube (pihak ketiga, dikecualikan dari audit).
- Perbaikan: `text-slate-500` → `text-slate-600` di seluruh `.tsx`, placeholder
  pratinjau `text-slate-600`, `aria-label` pada tiga input file, dan `aria-label`
  galeri dihapus agar nama aksesibel terbentuk dari teks terlihat (alt + caption).
- Hasil akhir: 0 temuan serius/kritis di kelima halaman. `typecheck`, `lint`,
  `build` lolos. Bundle: First Load JS 127–159 kB.

### 2026-11-27 — P3: health check & observability
- `src/middleware.ts` sekarang berlaku untuk semua route kecuali aset statis dan
  menyisipkan `x-request-id` (dari header atau `crypto.randomUUID()`) ke request
  dan response. Proteksi `/admin` tidak berubah.
- `src/lib/logger.ts`: `logEvent(level, event, fields)` menghasilkan satu baris
  JSON; kunci yang mengandung password/secret/token/cookie/credentials dibuang
  dan string dipotong 300 karakter. Dipakai di `projects.ts`, `presign/route.ts`,
  dan `s3.ts` menggantikan `console.error` ad-hoc.
- `GET /api/health`: `SELECT 1` ke DB + `HeadBucket` ke storage; 200 bila keduanya
  ok, 503 bila tidak. Tidak membocorkan URL/kredensial.
- `error.tsx` & `global-error.tsx`: pesan generik + tombol reset; error boundary
  hanya mencatat `digest`, bukan pesan internal.
- `ROLLBACK.md`: pemicu, langkah kode/env/DB/storage, verifikasi pasca-rollback.
- Verifikasi: health 200 dengan `database: ok, storage: ok` dan `x-request-id`
  hadir; `verify:ui`, `verify:rate-limit`, `verify:neon`, `verify:media` semua
  lolos. `typecheck`/`lint`/`build` lolos (route `/api/health` terdaftar).

### 2026-11-27 — P2: hardening media
- `src/lib/s3.ts`: `createPresignedUpload` kini menandatangani `ContentDisposition`
  (`attachment` untuk PDF, `inline` untuk gambar) dan `CacheControl`
  (`public, max-age=31536000, immutable`). `upload-client.ts` mengirim header yang
  sama persis; `verify-neon` memeriksa hasil HEAD.
- `findMismatchedMedia(keys)` membaca 16 byte awal tiap objek via `GetObject`
  `Range` dan mencocokkannya dengan ekstensi kunci. `saveProjectAction` menolak
  simpan bila ada yang tidak cocok (fail-closed, termasuk error baca storage).
- `scripts/cleanup-orphan-media.mjs`: dry-run by default, `ORPHAN_MAX_AGE_HOURS`
  (default 24), filter `--prefix`, hapus batch via `--apply`.
- Verifikasi: `verify:media` — objek `.png` berisi teks ditolak saat simpan & DB
  tidak berubah; `verify:neon` — HEAD disposition `inline`, cache sesuai; cleanup
  pada prefix uji: 1 kandidat → apply → 0 kandidat. `typecheck`/`lint`/`build` lolos.

### 2026-11-27 — P1: rate limit login berbasis Postgres
- `src/lib/rate-limit.ts` tidak lagi memakai `Map` dalam memori. `loginAction`
  kini `await` fungsi yang membaca/menulis tabel `LoginAttempt`.
- Migrasi `20261127070900_login_rate_limit` dibuat & diterapkan via direct URL;
  Prisma Client ter-generate ulang.
- `ON CONFLICT DO UPDATE` dengan `CASE` pada `windowEnd`: jendela baru dimulai
  hanya bila jendela lama sudah lewat; login sukses menghapus baris.
- `SECURITY.md` baru: threat model, perilaku rate limit, dan runbook rotasi
  `AUTH_SECRET`. `README.md` + `progress.md` diselaraskan.
- `npm run verify:rate-limit` (IP uji via `x-forwarded-for`): 5 kegagalan pertama
  pesan normal, ke-6 diblokir, `count=5` tersimpan di DB. `typecheck`, `lint`,
  `build` lolos; `verify:ui` tetap hijau.

### 2026-11-27 — Sidebar form: pratinjau ikut menempel
- Masalah: hanya kartu "Status Project" yang `xl:sticky`; kartu "Pratinjau Kartu
  Katalog" di bawahnya ikut scroll saat form panjang digulir.
- Solusi: `<aside>` yang jadi satu unit sticky (`xl:sticky xl:top-24 xl:self-start`,
  plus `xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto` bila tinggi keduanya
  melebihi viewport), dan atribut sticky pada kartu status dihapus.
- Verifikasi di Edge viewport 1440×900: scroll 900→1600px, posisi **status dan
  pratinjau tetap y=96 (delta 0)**, kolom form bergerak 700px; pratinjau tetap
  di bawah status. `npm run verify:ui` masih lolos tanpa page error.

### 2026-11-27 — P0: hardening dasar + verifikasi UI
- Hapus `.env` kosong; `.env.local` jadi satu-satunya sumber env lokal.
- `next.config.ts`: security headers global (CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy). CSP mengizinkan
  inline script Next.js, iframe YouTube, dan origin storage Neon.
- `README.md`, `SETUP-NEON.md`, `progress.md`, `.env.example` diperbarui ke alur
  `neon login/link/config init/deploy` + `directUrl` Prisma.
- `npm audit` di-triage (lihat bagian Audit Dependensi); tidak ada forced fix.
- Tambah `scripts/verify-admin-ui.mjs` + `npm run verify:ui` (playwright-core,
  Edge headless). Hasil: login salah ditolak, login benar masuk dashboard,
  create/edit draft, unpublish/publish, delete, logout — **page errors: none**.
- `npm run verify:neon` diulang setelah rebuild: presign→PUT→GET(byte-identik)→hapus.
- `typecheck`, `lint`, `build` lolos; security headers terlihat di response HTTP.
- Catatan: project `mathquest` (kelompok 8) sudah ada sebelumnya, dibiyarkan.
- Server produksi lokal berjalan di port 3000.

### 2026-11-27 — Perbaikan env Prisma + migrasi awal
- Masalah: Prisma CLI tidak membaca `.env.local` (hanya Next.js), sehingga
  `db:migrate`/`db:seed`/`db:studio` akan gagal walau aplikasi bisa connect.
- Solusi: `prisma.config.ts` memuat `.env.local` lalu `.env`. `datasource.url`
  hanya diisi bila `DATABASE_URL` ada, agar `prisma generate` (postinstall)
  tetap jalan tanpa kredensial.
- `package.json#prisma` dihapus (deprecated di Prisma 7); seed didaftarkan lewat
  `migrations.seed` di `prisma.config.ts`, script `db:seed` memakai
  `prisma db seed`.
- Migrasi awal `prisma/migrations/20261127000000_init` dibuat dari schema
  (CREATE TABLE Project/Member, enum, index, FK cascade) agar `db:deploy` siap.
- Script `storage:cors` kini memuat env sendiri, tanpa flag
  `--env-file-if-exists`.
- Verifikasi: `prisma generate` lolos tanpa `.env`; `prisma validate` lolos
  dengan `DATABASE_URL`; `typecheck`, `lint`, `build` lolos. Smoke test ulang di
  port 3100: `/` 200, `/admin/login` 200, `/admin` 307, detail tidak ada 200
  (notice DB), presign tanpa sesi 401.

### 2026-11-27 — Fase 2–5 selesai + dokumentasi
- Halaman publik di-port: hero, katalog dengan pencarian, kartu, footer, halaman
  detail `/proyek/[slug]` dengan galeri + lightbox dan `generateMetadata`.
- Admin: dashboard statistik/filter/tabel responsif, dialog hapus, aksi
  terbit/tarik, form 7 seksi dengan pratinjau langsung, kelengkapan, draft
  recovery `localStorage`, guard `beforeunload`, dan toast.
- Upload: presign route + helper XHR, logo/screenshot/PDF, peringatan non-PNG,
  serta pembersihan media lama best-effort saat update/hapus.
- Penting: `projectToDraft` mempertahankan `key` screenshot lewat
  `parseScreenshotDrafts`, agar menyimpan ulang tidak menghapus media yang masih
  dipakai.
- Dokumen: `SETUP-NEON.md`, `README.md`, script `npm run storage:cors`,
  `.env.example` diperbarui (termasuk catatan pooled vs direct).
- Verifikasi: `typecheck`, `lint`, `build` lolos. Smoke test HTTP dengan server
  produksi lokal: `/` & `/admin/login` 200, `/admin` 307 ke login, presign 401,
  cookie JWT valid diterima, cookie palsu ditolak.
- `.env.local` sementara dibuat untuk smoke test (DB/storage kosong) dan
  diabaikan git.
- Belum: migrasi/seed, login lewat form, upload nyata, dan perbandingan visual
  di browser.

### 2026-11-27 — Fase 0 & 1 selesai
- Scaffold Next.js 15.5.29 (TS strict, Tailwind v4, ESLint, src dir, alias `@/*`).
- Dependency terpasang: Prisma 6.19.3, Zod 3, jose, AWS SDK v3, lucide-react, tsx.
- Token desain (`brand`, `gold`, `cream`, `ink`, dll) + Plus Jakarta Sans via `next/font`.
- 4 logo institusi disalin ke `public/images/`.
- `.env.example` dibuat; `.gitignore` dikecualikan untuk `.env.example`.
- Schema Prisma + seed 4 project + Prisma Client ter-generate.
- Auth: JWT cookie httpOnly, login page, middleware, rate limit, guard layout admin.
- Dashboard admin masih placeholder (Fase 3).
- Verifikasi: `npm run typecheck`, `npm run lint`, `npm run build` **lolos**.

### 2026-11-27 — Perencanaan
- Mempelajari desain Vite: satu halaman katalog + modal detail; palet hijau/emas/krem;
  Tailwind v4; lucide; data `projects.json`.
- Memverifikasi Neon Object Storage (S3-compatible, `public_read`, presigned PUT, CORS).
- Menyusun rencana arsitektur, skema data, aturan validasi, UX form, dan alur upload.
- Membuat `PRD.md` dan `progress.md`.
- Belum ada kode ditulis.

---

## Catatan Teknis (temuan yang berguna saat implementasi)

- Desain asli memakai arbitrary value Tailwind (`bg-[#235334]`); di Next.js akan dipetakan
  ke token `@theme` (`--color-brand`, dll) dengan nilai hex sama.
- `overflow-x: clip` di `body` + `min-w-0` pada elemen flex penting untuk mencegah overflow
  horizontal (terutama Navbar dan kartu).
- Screenshot di desain memakai `<img>` biasa (bukan `next/image`) karena URL dinamis;
  pertahankan agar tidak perlu allowlist `remotePatterns`.
- `AppLogo` punya fallback inisial saat gambar gagal; `Lightbox` menangani gambar rusak.
- Prisma: gunakan `DATABASE_URL` pooled Neon; set `dynamic = 'force-dynamic'` pada halaman
  yang membaca DB agar build tidak butuh koneksi database.
- Migrasi lokal lebih aman memakai host **direct** (tanpa `-pooler`/`pgbouncer=true`);
  runtime memakai pooled.
- Presigned PUT Neon: `forcePathStyle: true` dan
  `requestChecksumCalculation: 'WHEN_REQUIRED'` (wajib, jika tidak upload dengan body nyata
  ditolak).
- Bucket harus `public_read`; access level tidak bisa diubah setelah dibuat.
- Jangan mengubah folder `etalase-ik200-pemrograman-internet`; hanya baca sebagai referensi.
