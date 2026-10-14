import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p>La página que buscas no existe o ya no está disponible.</p>
      <Link className="rounded-md border px-4 py-2" href="/">
        Volver al inicio
      </Link>
    </main>
  );
}
