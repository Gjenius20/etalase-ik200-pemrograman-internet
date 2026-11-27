# PRD — Etalase Karya IK200 (Next.js + Admin CRUD)

Status dokumen: **Final untuk implementasi**
Terakhir diperbarui: 2026-11-27
Referensi desain: `../etalase-ik200-pemrograman-internet` (React 19 + Vite + Tailwind v4)

---

## 1. Latar Belakang

Project Vite yang sudah ada adalah portal katalog satu halaman untuk memamerkan Tugas Besar
IK200 Pemrograman Internet kelas CTRL-B (Pendidikan Ilmu Komputer 2025, FPMIPA UPI).
Data project masih berupa file statis `src/data/projects.json`, sehingga setiap perubahan
harus mengedit kode dan build ulang.

Tujuan project ini:

1. **Porting** tampilan publik ke Next.js 15 (App Router + TypeScript + Tailwind v4) dengan
   hasil visual yang setara dengan desain Vite.
2. **Menambah admin panel** untuk CRUD project tanpa menyentuh kode.
3. Menyimpan data di **Neon Postgres** dan media di **Neon Object Storage** (S3-compatible),
   agar bisa dideploy ke Vercel.

---

## 2. Ruang Lingkup

### In scope

- Halaman publik katalog (hero, pencarian, grid kartu, footer).
- Halaman detail project `/proyek/[slug]` (pengganti modal).
- Login admin dengan satu password.
- Dashboard admin: daftar, cari, filter status, statistik.
- Form create/edit project satu halaman dengan section bertahap, preview, validasi,
  dan indikator kelengkapan.
- Hapus project + pembersihan media best-effort.
- Upload logo, screenshot, dan PDF ke Neon Object Storage; dokumen PDF juga bisa berupa
  link Google Drive.
- Status Draft/Terbit; publik hanya menampilkan yang terbit.
- Seed 4 project contoh dari `projects.json` lama.
- Dokumentasi setup Neon, env, migrasi, seed, dan deploy.

### Out of scope (untuk versi ini)

- Multi-user admin, role/permission, audit log.
- Upload video (video tetap YouTube embed).
- Rich text editor / markdown untuk deskripsi.
- Crop/resize gambar otomatis di server.
- Komentar, rating, atau fitur interaksi publik.
- Pencarian server-side / pagination (jumlah project kecil; filter di klien).
- Pembersihan otomatis orphan media terjadwal (hanya best-effort saat save/delete).
- i18n; seluruh UI berbahasa Indonesia.

---

## 3. Pengguna & Kebutuhan

| Pengguna | Kebutuhan |
|---|---|
| Dosen / publik | Melihat katalog, mencari, membuka detail, mengunduh artefak. |
| Admin kelas | Menambah/mengubah/menghapus project, mengunggah media, menerbitkan. |

Kebutuhan fungsional utama:

- FR-1 Publik dapat melihat daftar project terbit dan mencari berdasarkan nama aplikasi,
  kelompok, deskripsi, anggota, dan fitur.
- FR-2 Publik dapat membuka halaman detail tiap project beserta seluruh artefak wajib.
- FR-3 Admin dapat login/logout dengan password.
- FR-4 Admin dapat membuat project baru sebagai draft, lalu menerbitkannya saat lengkap.
- FR-5 Admin dapat mengedit, menerbitkan/menarik, dan menghapus project.
- FR-6 Admin dapat mengunggah logo, minimal 2 screenshot, dan 3 PDF; atau memakai link Drive
  untuk PDF.
- FR-7 Sistem memvalidasi URL (website, GitHub, YouTube, Drive) dan ukuran/jenis file.
- FR-8 Perubahan langsung tercermin di halaman publik (revalidate).

---

## 4. Stack & Konvensi

- Next.js **15** App Router (runtime Node.js untuk Prisma/S3).
- **TypeScript** strict.
- **Tailwind CSS v4** (`@tailwindcss/postcss`) dengan token warna brand.
- **Prisma 6** + Neon Postgres (`DATABASE_URL` pooled).
- **Zod** untuk validasi klien & server.
- **jose** untuk JWT sesi admin.
- **@aws-sdk/client-s3** + **@aws-sdk/s3-request-presigner** untuk Neon Object Storage.
- **lucide-react** untuk ikon.
- Font **Plus Jakarta Sans** via `next/font/google`.
- Server Actions untuk mutasi; satu Route Handler untuk presign upload.
- Tanpa library UI berat; komponen form/UI dibuat sendiri agar konsisten dengan desain.

### Design tokens

| Token | Nilai | Pemakaian |
|---|---|---|
| brand | `#235334` | tombol utama, aksen |
| brand-dark | `#1A3F27` | hover |
| gold | `#C5A24D` | border aksen, CTA hero |
| gold-light | `#E2C675` | teks di latar gelap |
| cream | `#F8F7F3` | latar halaman |
| ink | `#111920` | teks utama, footer/hero |

Font, radius besar (rounded-2xl/3xl), dan spacing mengikuti desain Vite. `focus-visible`
outline `#235334`, target sentuh minimal 44px, dan `prefers-reduced-motion` dipertahankan.

---

## 5. Informasi Arsitektur

```
Browser ──► Next.js (Vercel)
              ├─ Prisma ──► Neon Postgres
              ├─ S3 SDK ──► Neon Object Storage (bucket public_read)
              └─ presigned PUT ◄── Browser upload langsung
```

- Semua operasi DB/storage di server (Server Component, Server Action, Route Handler).
- Halaman publik dan admin memakai `dynamic = 'force-dynamic'` agar tidak bergantung DB
  saat build; setelah mutasi panggil `revalidatePath('/')`, `revalidatePath('/proyek/[slug]')`,
  dan path admin terkait.

---

## 6. Skema Data

```prisma
enum ProjectStatus {
  DRAFT
  PUBLISHED
}

model Project {
  id                 String        @id @default(cuid())
  slug               String        @unique
  groupNumber        Int           @unique
  appName            String
  shortDescription   String        // maks 180 karakter
  fullDescription    String        // tujuan, fitur utama, alur penggunaan
  targetUser         String
  targetCompetency   String
  learningProblem    String
  learningSuccess    String
  features           String[]
  aiIntegration      String?       // null = tidak ada integrasi AI
  websiteUrl         String
  githubUrl          String
  youtubeId          String        // ID video, bukan URL penuh
  logoUrl            String        // URL final (Neon atau eksternal)
  logoKey            String?       // key S3 jika diunggah
  screenshots        Json          // Screenshot[]
  documents          Json          // DocumentSet
  status             ProjectStatus @default(DRAFT)
  members            Member[]
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
}

model Member {
  id        String  @id @default(cuid())
  name      String
  nim       String
  order     Int
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, nim])
  @@index([projectId])
}
```

Tipe JSON (divalidasi Zod):

```ts
type Screenshot = {
  url: string;
  key?: string;
  caption?: string;
};

type DocumentEntry = {
  source: 'upload' | 'link';
  url: string;
  key?: string;
};

type DocumentSet = {
  presentation: DocumentEntry;
  skpl: DocumentEntry;
  userGuide: DocumentEntry;
};
```

Catatan:

- `groupName` tidak disimpan; ditampilkan sebagai `Kelompok ${groupNumber}`.
- Slug dibuat otomatis dari `appName` saat create (contoh `algoblock-sd`), tetap stabil saat
  nama diubah, dan diberi sufiks angka bila bentrok.
- `features` memakai array Postgres agar urutan poin terjaga.

---

## 7. Rute

| Rute | Akses | Isi |
|---|---|---|
| `/` | publik | Hero + pencarian + katalog project terbit |
| `/proyek/[slug]` | publik | Detail lengkap; 404 jika draft/tidak ada |
| `/admin/login` | publik | Form password |
| `/admin` | admin | Statistik + tabel project |
| `/admin/projects/new` | admin | Form create |
| `/admin/projects/[id]` | admin | Form edit |
| `POST /api/admin/uploads/presign` | admin | Presigned PUT + public URL |
| `middleware.ts` | — | Redirect ke login jika cookie sesi tidak valid |

Halaman admin memakai layout terpisah (header gelap, tombol "Lihat situs", "Keluar").
Tidak ada tautan admin di situs publik.

---

## 8. Halaman Publik

### 8.1 `/`

- Navbar sticky: logo kelas, "Portal Karya CTRL-B", "Pendidikan Ilmu Komputer 2025, UPI",
  tautan Katalog (jumlah project) dan Tentang.
- Hero gelap dengan border emas, judul, deskripsi, CTA "Jelajahi Katalog" dan "Tentang Portal",
  kartu logo kelas + 3 logo institusi.
- Section katalog: heading "Etalase Aplikasi Pembelajaran", deskripsi, search bar,
  counter "Menampilkan X dari Y proyek".
- Grid responsif 1/2/3 kolom kartu: logo (fallback inisial), badge kelompok, nama aplikasi,
  jumlah anggota, deskripsi singkat 2 baris, tombol "Lihat Detail" (ke halaman detail) dan
  ikon tautan website.
- Empty state dengan tombol reset pencarian.
- Footer dengan logo institusi, tagline, dan tautan kembali ke katalog/atas.
- Pencarian mencakup: `appName`, `groupNumber`, `shortDescription`, `fullDescription`,
  nama anggota, dan fitur. Case-insensitive, trim.

### 8.2 `/proyek/[slug]`

Urutan konten:

1. Breadcrumb "Katalog / Kelompok N / Nama Aplikasi".
2. Header: logo, kelompok, nama aplikasi, deskripsi singkat, tombol "Buka Website Aktif" dan
   "Source Code GitHub".
3. Anggota: daftar chip `Nama (NIM)`.
4. Galeri screenshot (min 2): grid/scroll snap, klik membuka lightbox dengan navigasi
   keyboard (Esc, ←, →), fallback bila gambar gagal dimuat.
5. Deskripsi lengkap.
6. Konteks pembelajaran dalam 4 kartu: pengguna utama, kompetensi, masalah belajar,
   indikator keberhasilan.
7. Fitur utama (checklist) + kartu gelap integrasi AI; jika `aiIntegration` null tampilkan
   "Belum ada integrasi AI".
8. Video demo YouTube embed 16:9.
9. Pusat unduhan: 3 kartu PDF (Slide Presentasi, SKPL, Panduan Pengguna). Link eksternal atau
   file Neon; file upload dibuka dengan `Content-Disposition: attachment`.
10. Footer.

Tambahan: `generateMetadata` (title/description/OG image logo), tombol "Kembali ke katalog",
dan CTA share/copy URL (opsional sederhana).

---

## 9. Admin

### 9.1 Autentikasi

- ENV: `ADMIN_PASSWORD`, `AUTH_SECRET` (min 32 karakter).
- Login: input password dengan show/hide, status pending, pesan error generik.
- Sesi: JWT HS256 (`jose`), disimpan di cookie `ik200_admin`; httpOnly, sameSite `lax`,
  secure di produksi, maxAge 7 hari, path `/`.
- Rate limit: maks 5 percobaan gagal per 15 menit (in-memory per instance; cukup untuk
  kebutuhan kelas, dicatat sebagai batasan).
- `middleware.ts` melindungi semua `/admin` kecuali `/admin/login`; Server Action tetap
  memanggil `requireAdmin()`.
- Logout: Server Action menghapus cookie lalu redirect ke login.

### 9.2 Dashboard `/admin`

- Stat cards: Total project, Terbit, Draft, Belum lengkap.
- Pencarian (nama/kelompok/slug) + filter status (Semua/Terbit/Draft).
- Tabel desktop + kartu ringkas di mobile:
  logo, nama + slug, kelompok, jumlah anggota, status badge, kelengkapan %, `updatedAt`,
  aksi Edit / Lihat / Terbitkan-Tarik / Hapus.
- Aksi hapus memakai dialog konfirmasi; setelah sukses hapus baris + toast.
- Empty state bila belum ada project.
- Tombol utama "Tambah Project" → `/admin/projects/new`.

### 9.3 Form create/edit

Tata letak desktop 2 kolom; mobile 1 kolom.

- **Kolom kiri**: 7 kartu section bernomor, dapat dilipat, ikon centang bila lengkap.
- **Kolom kanan (sticky)**: preview kartu katalog (logo, badge, nama, deskripsi 2 baris)
  + meter kelengkapan + daftar field yang belum lengkap (bisa diklik untuk scroll ke field).
- **Bar aksi sticky** bawah: "Simpan Draft" dan "Simpan & Terbitkan" (atau "Perbarui"
  untuk project terbit). Tombol terbit disabled sampai semua field wajib valid; tooltip
  menjelaskan kekurangan.
- Draft recovery: simpan state form ke `localStorage` tiap 1 detik; saat membuka form
  kosong tawarkan pemulihan; hapus draft setelah simpan sukses.
- Guard `beforeunload` jika ada perubahan belum disimpan.
- Validasi dua lapis: Zod di klien untuk umpan balik instan, Zod di server sebagai sumber
  kebenaran. Error inline (aria-invalid, aria-describedby) + ringkasan error di atas form.
- Setelah simpan: redirect ke dashboard dengan toast sukses; slug baru ditampilkan.

#### Section 1 — Identitas Kelompok & Anggota

| Field | Kontrol | Validasi |
|---|---|---|
| Nomor kelompok | number | wajib, bilangan bulat 1–99, unik |
| Anggota | repeater baris (Nama, NIM) | min 1, maks 10; nama 3–80 char; NIM 6–20 digit; NIM unik dalam project; urutan bisa naik/turun, bisa hapus/tambah |

#### Section 2 — Nama & Deskripsi Aplikasi

| Field | Kontrol | Validasi |
|---|---|---|
| Nama aplikasi | text | wajib, 3–80 char |
| Deskripsi singkat | textarea 2 baris | wajib, 20–180 char, counter karakter, preview clamp 2 baris |
| Deskripsi lengkap | textarea | wajib, 100–3000 char; placeholder template "Tujuan / Fitur utama / Alur penggunaan"; checklist pengingat di helper text |
| Logo aplikasi | dropzone + preview | wajib untuk terbit; PNG/JPG/WebP; maks 2 MB; disarankan persegi; tombol ganti/hapus |

#### Section 3 — Konteks Pembelajaran

Empat textarea wajib (masing-masing 10–300 char): target pengguna, target kompetensi,
masalah belajar yang diselesaikan, indikator keberhasilan belajar. Masing-masing punya
contoh placeholder dan helper.

#### Section 4 — Fitur Utama & Integrasi AI

| Field | Kontrol | Validasi |
|---|---|---|
| Fitur utama | repeater poin | 1–8 poin; tiap poin 5–200 char; urut bisa diubah |
| Integrasi AI | toggle | jika ON: textarea wajib 10–1000 char; jika OFF: nilai `null` dan publik menampilkan "Belum ada integrasi AI" |

#### Section 5 — Screenshot Aplikasi

- Upload multi-file (drag & drop atau pilih).
- Min 2 gambar untuk terbit, maks 8.
- PNG/JPG/WebP, maks 3 MB per file; tampilkan peringatan halus bila bukan PNG
  (ketentuan tugas menyarankan `.png`).
- Grid thumbnail dengan caption opsional, urutan naik/turun, hapus, progress upload per file.
- Fallback tampilan bila gambar gagal dimuat (sama seperti desain lama).

#### Section 6 — Tautan

| Field | Validasi |
|---|---|
| Website aplikasi | wajib, URL `https`, host bebas |
| Repositori GitHub | wajib, URL `https`, host `github.com` |
| Video YouTube | wajib; menerima `watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`; dinormalisasi menjadi `youtubeId`; preview embed |

#### Section 7 — Dokumen PDF

Tiga kartu terpisah: Slide Presentasi, Dokumen SKPL, Panduan Pengguna. Setiap kartu punya
segmented control **Upload PDF** / **Link Drive**.

- Upload: hanya `application/pdf`, maks 20 MB, tampilkan nama + ukuran, bisa hapus.
- Link: URL `https` valid (disarankan Drive), tombol "Buka" untuk mengetes.
- Ketiganya wajib untuk terbit; boleh kosong saat draft.

---

## 10. Kelengkapan & Publikasi

`completeness` dihitung dari field wajib (identitas, aplikasi, konteks, fitur, AI bila
diaktifkan, logo, ≥2 screenshot, 3 tautan, 3 dokumen). Dipakai di dashboard dan form.

- `Simpan Draft` selalu boleh, walau belum lengkap.
- `Terbitkan` hanya jika 100% lengkap dan valid.
- Project `DRAFT` tidak muncul di publik dan `/proyek/[slug]` mengembalikan 404.
- Menarik project (`PUBLISHED → DRAFT`) langsung menghilangkannya dari publik.

---

## 11. Upload Media

### 11.1 Konfigurasi S3 (Neon)

```ts
new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
});
```

### 11.2 Alur presigned upload

1. Klien `POST /api/admin/uploads/presign` dengan `{ filename, contentType, size, kind }`.
2. Server: cek sesi admin; validasi `kind` (`logo` | `screenshot` | `pdf`), tipe MIME, dan
   ukuran (logo 2 MB, screenshot 3 MB, PDF 20 MB).
3. Buat key `projects/<uuid>/<kind>/<uuid>.<ext>` dan presigned `PutObject` (5 menit).
4. Response `{ uploadUrl, key, publicUrl, contentType }`.
5. Browser `PUT` file langsung ke Neon dengan header `Content-Type` yang sama, progress via
   `XMLHttpRequest`.
6. Simpan `url` + `key` ke state form; DB menyimpan keduanya.

Catatan:

- Bucket harus `public_read`; URL publik dihitung dari `AWS_ENDPOINT_URL_S3` + bucket,
  dapat dioverride `NEON_STORAGE_PUBLIC_BASE_URL`.
- CORS bucket diatur (`PutBucketCors`) untuk origin lokal dan domain produksi.
- Jika file diganti/dihapus atau project dihapus, server menghapus objek lama secara
  best-effort (`DeleteObjects`), kegagalan tidak menggagalkan penyimpanan.
- Upload terjadi sebelum form disimpan; objek yang ditinggalkan (user batal) menjadi orphan.
  Dicatat sebagai batasan; pembersihan terjadwal di luar scope.

### 11.3 Batasan

- Maksimum body Server Action bukan jalur upload (memakai presigned URL), sehingga file besar
  tidak terkena limit 4,5 MB Vercel.
- SVG ditolak untuk mencegah konten aktif di media publik.

---

## 12. ENV

```env
DATABASE_URL=                  # Neon pooled connection string
DIRECT_URL=                    # opsional, untuk migrasi
ADMIN_PASSWORD=
AUTH_SECRET=                   # min 32 karakter acak
AWS_REGION=                    # contoh us-east-2
AWS_ENDPOINT_URL_S3=           # https://<branch>.storage.<...>.neon.tech
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
NEON_STORAGE_BUCKET=
NEON_STORAGE_PUBLIC_BASE_URL=  # opsional
```

`.env.example` disertakan tanpa nilai rahasia; `.env*` masuk `.gitignore`.

---

## 13. Seed

`prisma/seed.ts` mengisi 4 project dari `projects.json` lama:

| Kelompok | Nama | Slug |
|---|---|---|
| 1 | AlgoBlock SD | `algoblock-sd` |
| 2 | PyStep SMP | `pystep-smp` |
| 3 | NeuroLab SMA | `neurolab-sma` |
| 4 | CodeCraft SMK | `codecraft-smk` |

- Anggota placeholder dipecah menjadi nama + NIM dummy valid (mis. `2300001` dst).
- Logo/screenshot memakai URL placeholder eksternal; 3 dokumen memakai link contoh.
- `videoEmbedUrl` dikonversi menjadi `youtubeId` (`dQw4w9WgXcQ`).
- Semua seed berstatus `PUBLISHED`.
- Seed idempotent (`upsert` berdasarkan slug) agar aman dijalankan ulang.

---

## 14. Setup & Deploy (ringkas; detail di `SETUP-NEON.md`)

1. Buat project Neon di region yang mendukung Object Storage
   (us-east-1, us-east-2, eu-central-1, ap-southeast-1).
2. Buat bucket `public_read` lewat Console/CLI (`neon buckets create ... --access-level public_read`).
3. Buat credential `storage:read` + `storage:write`; salin `AWS_*` ke `.env`.
4. Salin connection string ke `DATABASE_URL`.
5. Atur CORS bucket untuk `http://localhost:3000` dan domain Vercel.
6. `npm install`, `npx prisma migrate dev`, `npm run db:seed`.
7. `npm run dev`; login di `/admin/login`.
8. Deploy Vercel: isi env yang sama, jalankan `prisma migrate deploy`, seed sekali.

---

## 15. Kriteria Penerimaan

- [ ] Tampilan publik setara desain Vite pada desktop dan mobile (warna, tipografi, layout,
      hero, kartu, footer), tanpa horizontal overflow.
- [ ] Pencarian publik menemukan project berdasarkan nama, kelompok, anggota, dan fitur.
- [ ] `/proyek/[slug]` menampilkan seluruh artefak dan 404 untuk draft.
- [ ] Login salah ditolak; `/admin` tanpa sesi redirect ke login; logout menghapus sesi.
- [ ] Admin dapat create, edit, publish/unpublish, dan delete project.
- [ ] Form memblokir data tidak valid; error tampil di field terkait.
- [ ] Terbit hanya bisa saat semua field wajib lengkap.
- [ ] Upload logo/screenshot/PDF berhasil ke Neon Storage dan tampil di publik.
- [ ] PDF link Drive dan PDF upload sama-sama bisa dibuka.
- [ ] Perubahan di admin langsung terlihat di publik setelah revalidate.
- [ ] `npm run lint`, `tsc --noEmit`, dan `npm run build` lolos.
- [ ] Seed berjalan idempotent dan menghasilkan 4 project terbit.
- [ ] Tidak ada kredensial yang ter-commit; `.env.example` lengkap.

---

## 16. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Region Neon tidak mendukung Object Storage | Dokumentasikan pilihan region; validasi endpoint saat setup |
| CORS bucket belum diset → upload gagal | Sertakan langkah `PutBucketCors` di panduan + pesan error jelas |
| Kredensial storage bocor ke klien | Hanya presign di server; tidak ada `NEXT_PUBLIC` untuk S3 |
| File besar gagal upload | Presigned URL langsung ke storage; batas ukuran per jenis |
| Kehilangan data form | Draft recovery `localStorage` + konfirmasi sebelum keluar |
| Gambar eksternal mati | Fallback logo inisial & placeholder screenshot (seperti desain lama) |
| Build gagal karena DB tidak tersedia | Halaman data memakai `force-dynamic`; env contoh disertakan |

---

## 17. Struktur Folder Target

Lihat bagian 1 rencana (sudah disetujui). Ringkasnya:

```
NextJS/
├─ PRD.md
├─ progress.md
├─ prisma/{schema.prisma, seed.ts}
├─ .env.example
├─ SETUP-NEON.md
├─ public/images/
└─ src/
   ├─ middleware.ts
   ├─ app/{layout.tsx, globals.css, page.tsx, proyek/[slug], admin/**, api/admin/uploads/presign}
   ├─ components/{public,admin,form}/
   ├─ actions/{auth.ts, projects.ts}
   └─ lib/{db,auth,s3,validation,completeness,media,slug,rate-limit}.ts
```
