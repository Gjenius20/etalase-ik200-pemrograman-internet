import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Portal Karya CTRL-B | IK200 Pendidikan Ilmu Komputer 2025 - UPI",
    template: "%s | Portal Karya CTRL-B",
  },
  description:
    "Etalase produk pembelajaran berbasis web untuk membantu belajar Informatika, coding, dan kecerdasan artifisial pada jenjang SD, SMP, SMA, dan SMK. Karya mahasiswa IK200 Pemrograman Internet, Kelas CTRL-B, FPMIPA UPI.",
  applicationName: "Portal Karya CTRL-B",
  authors: [
    {
      name: "Kelas CTRL-B, Pendidikan Ilmu Komputer 2025, FPMIPA UPI",
    },
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Portal Karya CTRL-B",
    title: "Portal Karya Media Pembelajaran Informatika, Koding & AI",
    description:
      "Etalase produk pembelajaran berbasis web karya mahasiswa IK200 Pemrograman Internet, Kelas CTRL-B, Pendidikan Ilmu Komputer UPI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${plusJakarta.variable} bg-cream text-ink antialiased selection:bg-brand selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
