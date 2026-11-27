"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#F8F7F3", color: "#111920" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Aplikasi tidak dapat dimuat</h1>
          <p style={{ maxWidth: 420, fontSize: 14, color: "#475569" }}>
            Terjadi kesalahan saat menyiapkan halaman. Silakan muat ulang.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ minHeight: 44, borderRadius: 12, border: 0, padding: "10px 20px", background: "#235334", color: "white", fontWeight: 700, cursor: "pointer" }}
          >
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
