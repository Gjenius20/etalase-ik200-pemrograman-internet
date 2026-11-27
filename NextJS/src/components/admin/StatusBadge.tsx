export default function StatusBadge({
  status,
}: {
  status: "DRAFT" | "PUBLISHED";
}) {
  const isPublished = status === "PUBLISHED";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-bold ${
        isPublished
          ? "border-brand/20 bg-brand-soft text-brand-dark"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPublished ? "bg-brand" : "bg-amber-500"
        }`}
        aria-hidden="true"
      />
      {isPublished ? "Terbit" : "Draft"}
    </span>
  );
}
