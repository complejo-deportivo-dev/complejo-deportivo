// Bloque gris que parpadea mientras carga la información
function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-surface ${className}`} />;
}

export default function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando dashboard" className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Block className="h-28" key={i} />
        ))}
      </div>
      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Block className="h-80" />
        <Block className="h-80" />
      </div>
      {/* Ocupación, tablas */}
      <Block className="h-48" />
      <Block className="h-64" />
      <Block className="h-64" />
    </div>
  );
}
