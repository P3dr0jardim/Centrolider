import { X, TrendingUp, Euro, Car, PlusCircle } from "lucide-react";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { BulkSetRentabilidadeModal } from "./BulkSetRentabilidadeModal";

const fmtEuro = (v) => `€${Number(v).toLocaleString("pt-PT", { minimumFractionDigits: 0 })}`;

export function FleetRentabilidadeModal({ isOpen, onClose, fleet, vehicles, onVehiclesChanged }) {
  const [isBulkRentabilidadeOpen, setIsBulkRentabilidadeOpen] = useState(false);

  if (!isOpen) return null;

  const withRent = vehicles.filter((v) => v.rentabilidade > 0);
  const totalMensal = withRent.reduce((s, v) => s + (v.rentabilidade || 0), 0);
  const totalAnual = totalMensal * 12;
  const operacionais = vehicles.filter((v) => v.status === "Operacional").length;

  const chartData = [...vehicles]
    .filter((v) => v.rentabilidade > 0)
    .sort((a, b) => b.rentabilidade - a.rentabilidade)
    .map((v) => ({
      matricula: v.matricula,
      rentabilidade: v.rentabilidade,
      color: v.status === "Operacional" ? "#2563eb" : v.status === "Manutenção" ? "#f59e0b" : "#ef4444",
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-gray-900">{payload[0].payload.matricula}</p>
        <p className="text-blue-600">{fmtEuro(payload[0].value)}<span className="text-gray-500">/mês</span></p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Rentabilidade da Frota</h3>
            <p className="text-sm text-gray-500 mt-1">{fleet?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkRentabilidadeOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Atualizar Rentabilidade em Massa
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <BulkSetRentabilidadeModal
          isOpen={isBulkRentabilidadeOpen}
          onClose={() => setIsBulkRentabilidadeOpen(false)}
          vehicles={vehicles}
          fleetName={fleet?.name}
          onSaved={onVehiclesChanged}
        />

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Euro className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-blue-700">Receita Mensal</p>
              </div>
              <p className="text-3xl font-bold text-blue-900">{fmtEuro(totalMensal)}</p>
              <p className="text-xs text-blue-600 mt-1">{withRent.length} viaturas com rentabilidade definida</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-700">Receita Anual Estimada</p>
              </div>
              <p className="text-3xl font-bold text-green-900">{fmtEuro(totalAnual)}</p>
              <p className="text-xs text-green-600 mt-1">Baseado na rentabilidade mensal atual</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Car className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Viaturas Ativas</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{operacionais} / {vehicles.length}</p>
              <p className="text-xs text-gray-500 mt-1">Operacionais em serviço</p>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Rentabilidade por Viatura (€/mês)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="matricula"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(v) => `€${v.toLocaleString("pt-PT")}`}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    width={72}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rentabilidade" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-3 justify-center text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-600 inline-block" />Operacional</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />Manutenção</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 inline-block" />Inativo</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Sem dados de rentabilidade para esta frota.</p>
              <p className="text-sm mt-1">Edite as viaturas para definir a rentabilidade mensal.</p>
            </div>
          )}

          {/* Per-vehicle table */}
          {chartData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Matrícula</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Modelo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Rent. Mensal</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Rent. Anual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...vehicles].sort((a, b) => (b.rentabilidade || 0) - (a.rentabilidade || 0)).map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{v.matricula}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.modelo}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          v.status === "Operacional" ? "bg-green-100 text-green-700"
                          : v.status === "Manutenção" ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                        }`}>{v.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        {v.rentabilidade ? fmtEuro(v.rentabilidade) : <span className="text-gray-400 font-normal">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {v.rentabilidade ? fmtEuro(v.rentabilidade * 12) : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
