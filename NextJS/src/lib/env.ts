/** Pemeriksaan konfigurasi yang aman dipakai server maupun klien. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
