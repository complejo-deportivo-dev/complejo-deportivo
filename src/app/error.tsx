"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Algo salió mal</h1>
      <p>No pudimos cargar esta página. Inténtalo de nuevo.</p>
      <button
        className="rounded-md border px-4 py-2"
        onClick={() => reset()}
        type="button"
      >
        Reintentar
      </button>
    </main>
  );
}
