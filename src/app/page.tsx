import Header from "@/components/shared/Header";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header
        role="client"
        userName="Juan Pérez"
        userInitials="JP"
      />

      <section className="px-6 py-12 lg:px-16">
        <h1 className="text-3xl font-bold text-text-primary">
          Bienvenido a Otium
        </h1>

        <p className="mt-2 text-text-secondary">
          Gestiona tus reservas y disfruta de nuestras instalaciones.
        </p>
      </section>
    </main>
  );
}

