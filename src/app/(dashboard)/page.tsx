export const runtime = "edge";

const cards = [
  { label: "Pacientes", value: 0 },
  { label: "Consultas Hoy", value: 0 },
  { label: "Propuestas Pendientes", value: 0 },
  { label: "Controles Pendientes", value: 0 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Resumen general de la clínica</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Consultas de Hoy</h2>
          <p className="text-sm text-gray-500">Ninguna consulta programada.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Pendientes</h2>
          <p className="text-sm text-gray-500">Sin pendientes.</p>
        </div>
      </div>
    </div>
  );
}
