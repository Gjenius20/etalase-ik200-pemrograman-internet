/**
 * Seed 4 project contoh dari data lama `src/data/projects.json` (project Vite).
 * Idempotent: aman dijalankan berulang kali (upsert berdasarkan slug).
 *
 * Jalankan: npm run db:seed
 */
import { PrismaClient, ProjectStatus } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProject = {
  slug: string;
  groupNumber: number;
  appName: string;
  shortDescription: string;
  fullDescription: string;
  targetUser: string;
  targetCompetency: string;
  learningProblem: string;
  learningSuccess: string;
  features: string[];
  aiIntegration: string | null;
  websiteUrl: string;
  githubUrl: string;
  youtubeId: string;
  logoUrl: string;
  screenshots: { url: string; caption: string }[];
  documents: {
    presentation: { source: "link"; url: string };
    skpl: { source: "link"; url: string };
    userGuide: { source: "link"; url: string };
  };
  members: { name: string; nim: string; order: number }[];
};

const projects: SeedProject[] = [
  {
    slug: "algoblock-sd",
    groupNumber: 1,
    appName: "AlgoBlock SD",
    shortDescription:
      "Media pembelajaran berpikir komputasional, pengenalan pola, dan coding visual berbasis blok untuk siswa SD dengan asisten AI Tutor.",
    fullDescription:
      "AlgoBlock SD dirancang untuk membantu siswa sekolah dasar memahami logika dasar, urutan instruksi, dan pengenalan pola melalui tantangan coding blok interaktif. Dilengkapi alur belajar terstruktur mulai dari materi pengantar, latihan bertahap, hingga evaluasi mandiri.",
    targetUser: "Siswa SD Kelas 4-6 dan Guru Informatika SD",
    targetCompetency:
      "Mampu menyusun algoritma urutan dan pengenalan pola sederhana menggunakan blok visual.",
    learningProblem:
      "Kesulitan siswa SD memahami konsep logika pemrograman abstrak tanpa visualisasi interaktif dan bimbingan langsung.",
    learningSuccess:
      "Siswa mampu menyelesaikan minimal 80% tantangan logika blok serta memahami perbaikan ketika terjadi kesalahan urutan.",
    features: [
      "Materi Terstruktur (Tujuan belajar, penjelasan visual, contoh, dan rangkuman)",
      "Latihan Interaktif & Gamifikasi Coding Blok Bertahap",
      "Umpan Balik Otomatis pada Setiap Langkah Kode",
      "Indikator Progres Belajar & Pencapaian Kompetensi",
    ],
    aiIntegration:
      "AI Tutor interaktif yang memberikan petunjuk bertahap dan penjelasan ramah anak saat siswa mengalami kesalahan susunan blok kode.",
    websiteUrl: "https://algoblock-sd.vercel.app",
    githubUrl: "https://github.com/username/algoblock-sd",
    youtubeId: "dQw4w9WgXcQ",
    logoUrl: "https://placehold.co/200x200/01875f/ffffff?text=AlgoBlock",
    screenshots: [
      {
        url: "https://placehold.co/1280x720/1e293b/ffffff?text=Halaman+Utama+dan+Materi",
        caption: "Halaman Utama dan Materi",
      },
      {
        url: "https://placehold.co/1280x720/0f172a/ffffff?text=Arena+Coding+Blok+Interaktif",
        caption: "Arena Coding Blok Interaktif",
      },
      {
        url: "https://placehold.co/1280x720/01875f/ffffff?text=Fitur+AI+Tutor+dan+Progres",
        caption: "Fitur AI Tutor dan Progres",
      },
    ],
    documents: {
      presentation: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_SLIDE_1/view",
      },
      skpl: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_SKPL_1/view",
      },
      userGuide: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_PANDUAN_1/view",
      },
    },
    members: [
      { name: "Nama Anggota 1", nim: "2301001", order: 0 },
      { name: "Nama Anggota 2", nim: "2301002", order: 1 },
      { name: "Nama Anggota 3", nim: "2301003", order: 2 },
    ],
  },
  {
    slug: "pystep-smp",
    groupNumber: 2,
    appName: "PyStep SMP",
    shortDescription:
      "Platform belajar transisi dari logika flowchart ke pemrograman Python dasar bagi siswa SMP dilengkapi evaluator kode berbasis AI.",
    fullDescription:
      "PyStep SMP menjembatani siswa sekolah menengah pertama dari pemahaman algoritma visual menuju penulisan sintaks Python nyata. Siswa mengikuti alur belajar mulai dari modul konsep percabangan dan perulangan, latihan kode langsung di peramban, hingga kuis diagnostik.",
    targetUser: "Siswa SMP Kelas 7-9 dan Guru Mata Pelajaran Informatika",
    targetCompetency:
      "Mampu menerjemahkan algoritma percabangan dan perulangan ke dalam program Python sederhana.",
    learningProblem:
      "Siswa SMP kerap mengalami kebingungan saat beralih dari pemrograman blok ke sintaks teks karena pesan error yang sulit dipahami.",
    learningSuccess:
      "Siswa dapat menulis dan memperbaiki skrip Python dasar secara mandiri dengan tingkat ketuntasan latihan di atas 75%.",
    features: [
      "Modul Konsep Flowchart ke Python secara Bertahap",
      "Editor Kode Langsung di Browser dengan Eksekusi Instan",
      "Penerjemah Pesan Error ke Bahasa Indonesia Sederhana",
      "Pelacakan Progres Latihan per Topik Algoritma",
    ],
    aiIntegration:
      "Evaluator kode berbasis AI yang menganalisis kesalahan logika maupun sintaks siswa dan menyajikan petunjuk perbaikan tanpa langsung membocorkan jawaban.",
    websiteUrl: "https://pystep-smp.vercel.app",
    githubUrl: "https://github.com/username/pystep-smp",
    youtubeId: "dQw4w9WgXcQ",
    logoUrl: "https://placehold.co/200x200/1e3a5f/ffffff?text=PyStep",
    screenshots: [
      {
        url: "https://placehold.co/1280x720/1e3a5f/ffffff?text=Dasbor+Belajar+PyStep+SMP",
        caption: "Dasbor Belajar PyStep SMP",
      },
      {
        url: "https://placehold.co/1280x720/0f172a/ffffff?text=Editor+Python+dan+Simulasi",
        caption: "Editor Python dan Simulasi",
      },
      {
        url: "https://placehold.co/1280x720/334155/ffffff?text=Umpan+Balik+AI+Evaluator",
        caption: "Umpan Balik AI Evaluator",
      },
    ],
    documents: {
      presentation: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_SLIDE_2/view",
      },
      skpl: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_SKPL_2/view",
      },
      userGuide: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_PANDUAN_2/view",
      },
    },
    members: [
      { name: "Nama Anggota 1", nim: "2302001", order: 0 },
      { name: "Nama Anggota 2", nim: "2302002", order: 1 },
      { name: "Nama Anggota 3", nim: "2302003", order: 2 },
    ],
  },
  {
    slug: "neurolab-sma",
    groupNumber: 3,
    appName: "NeuroLab SMA",
    shortDescription:
      "Laboratorium virtual konsep Kecerdasan Artifisial dan klasifikasi data interaktif untuk siswa SMA lengkap dengan simulator model.",
    fullDescription:
      "NeuroLab SMA memvisualisasikan cara kerja model klasifikasi dan pengenalan pola pada Kecerdasan Artifisial tanpa memerlukan perangkat keras khusus. Siswa dapat mengunggah dataset latihan sederhana, mengamati proses pelatihan model, dan menguji prediksi secara langsung.",
    targetUser: "Siswa SMA Kelas 10-12 dan Guru Informatika SMA",
    targetCompetency:
      "Memahami konsep dasar machine learning, fitur data, pelatihan model, dan evaluasi akurasi klasifikasi.",
    learningProblem:
      "Konsep kecerdasan artifisial sering diajarkan hanya secara teori karena keterbatasan perangkat dan kompleksitas kode matematika.",
    learningSuccess:
      "Siswa mampu menjelaskan pengaruh kualitas data latih terhadap akurasi prediksi model melalui eksperimen langsung.",
    features: [
      "Simulasi Visual Proses Pelatihan Model Klasifikasi",
      "Eksperimen Dataset Mini dengan Grafik Akurasi Real-Time",
      "Studi Kasus Etika & Bias Kecerdasan Artifisial",
      "Lembar Kerja Evaluasi Konsep Terintegrasi",
    ],
    aiIntegration:
      "Asisten analisis eksperimen berbasis AI yang membantu siswa menafsirkan hasil akurasi model serta menyarankan perbaikan komposisi data latih.",
    websiteUrl: "https://neurolab-sma.vercel.app",
    githubUrl: "https://github.com/username/neurolab-sma",
    youtubeId: "dQw4w9WgXcQ",
    logoUrl: "https://placehold.co/200x200/0f766e/ffffff?text=NeuroLab",
    screenshots: [
      {
        url: "https://placehold.co/1280x720/0f766e/ffffff?text=Eksplorasi+Dataset+NeuroLab",
        caption: "Eksplorasi Dataset NeuroLab",
      },
      {
        url: "https://placehold.co/1280x720/1e293b/ffffff?text=Visualisasi+Klasifikasi+Model",
        caption: "Visualisasi Klasifikasi Model",
      },
      {
        url: "https://placehold.co/1280x720/0f172a/ffffff?text=Laporan+Evaluasi+Akurasi",
        caption: "Laporan Evaluasi Akurasi",
      },
    ],
    documents: {
      presentation: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_SLIDE_3/view",
      },
      skpl: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_SKPL_3/view",
      },
      userGuide: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_PANDUAN_3/view",
      },
    },
    members: [
      { name: "Nama Anggota 1", nim: "2303001", order: 0 },
      { name: "Nama Anggota 2", nim: "2303002", order: 1 },
      { name: "Nama Anggota 3", nim: "2303003", order: 2 },
    ],
  },
  {
    slug: "codecraft-smk",
    groupNumber: 4,
    appName: "CodeCraft SMK",
    shortDescription:
      "Media pembelajaran praktik pengembangan web dan API RESTful untuk siswa SMK RPL dengan fitur review kode otomatis berbasis AI.",
    fullDescription:
      "CodeCraft SMK membantu siswa kompetensi keahlian Rekayasa Perangkat Lunak berlatih membangun antarmuka web dan mengonsumsi API secara bertahap. Setiap modul proyek kecil dilengkapi studi kasus industri, checklist kualitas kode, dan evaluasi otomatis.",
    targetUser: "Siswa SMK Jurusan PPLG/RPL Kelas 10-12 dan Guru Produktif",
    targetCompetency:
      "Mampu membangun komponen web responsif dan mengintegrasikan data API RESTful sesuai standar praktik industri.",
    learningProblem:
      "Siswa SMK membutuhkan umpan balik cepat mengenai struktur kode dan keamanan dasar saat mengerjakan tugas praktik mandiri.",
    learningSuccess:
      "Siswa mampu menyelesaikan proyek mini web terhubung API dengan skor review struktur kode minimal 80%.",
    features: [
      "Tantangan Proyek Mini Berbasis Studi Kasus Industri",
      "Sandbox Pengujian Endpoint API & Respon JSON",
      "Checklist Keamanan & Responsivitas Otomatis",
      "Rekap Portofolio Proyek Praktik Siswa",
    ],
    aiIntegration:
      "AI Code Reviewer yang memeriksa keterbacaan kode, penanganan error fetch API, serta memberi rekomendasi perbaikan terstruktur.",
    websiteUrl: "https://codecraft-smk.vercel.app",
    githubUrl: "https://github.com/username/codecraft-smk",
    youtubeId: "dQw4w9WgXcQ",
    logoUrl: "https://placehold.co/200x200/334155/ffffff?text=CodeCraft",
    screenshots: [
      {
        url: "https://placehold.co/1280x720/334155/ffffff?text=Katalog+Tantangan+CodeCraft+SMK",
        caption: "Katalog Tantangan CodeCraft SMK",
      },
      {
        url: "https://placehold.co/1280x720/0f172a/ffffff?text=Sandbox+API+dan+Pratinjau",
        caption: "Sandbox API dan Pratinjau",
      },
      {
        url: "https://placehold.co/1280x720/1e3a5f/ffffff?text=Hasil+Review+Kode+AI",
        caption: "Hasil Review Kode AI",
      },
    ],
    documents: {
      presentation: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_SLIDE_4/view",
      },
      skpl: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_SKPL_4/view",
      },
      userGuide: {
        source: "link",
        url: "https://drive.google.com/file/d/CONTOH_ID_PANDUAN_4/view",
      },
    },
    members: [
      { name: "Nama Anggota 1", nim: "2304001", order: 0 },
      { name: "Nama Anggota 2", nim: "2304002", order: 1 },
      { name: "Nama Anggota 3", nim: "2304003", order: 2 },
    ],
  },
];

async function main() {
  for (const { members, ...project } of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        ...project,
        status: ProjectStatus.PUBLISHED,
        members: {
          deleteMany: {},
          create: members,
        },
      },
      create: {
        ...project,
        status: ProjectStatus.PUBLISHED,
        members: {
          create: members,
        },
      },
    });

    console.log(`✓ ${project.appName} (${project.slug})`);
  }
}

main()
  .then(async () => {
    console.log("\nSeed selesai: 4 project siap.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed gagal:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
