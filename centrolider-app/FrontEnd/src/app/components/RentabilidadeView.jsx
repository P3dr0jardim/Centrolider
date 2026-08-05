import { TrendingUp, TrendingDown, Euro, Calculator, BarChart2, PlusCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { api } from "../../services/api";
import { ContabilidadeTab } from "./ContabilidadeTab";
import { AddBulkRevenueModal } from "./AddBulkRevenueModal";

const fmtEuro = (v) =>
  `€${Number(v).toLocaleString("pt-PT", { minimumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.frota}</p>
      <div className="space-y-1">
        <p className="text-sm text-green-600">Receita: {fmtEuro(payload[0]?.value ?? 0)}</p>
        <p className="text-sm text-red-600">Despesa: {fmtEuro(payload[1]?.value ?? 0)}</p>
        <p className="text-sm text-blue-600 font-semibold">Lucro: {fmtEuro(payload[2]?.value ?? 0)}</p>
      </div>
    </div>
  );
};

const TABS = [
  { id: "contabilidade", label: "Contabilidade", icon: Calculator },
  { id: "rentabilidade", label: "Rentabilidade", icon: BarChart2 },
];

export function RentabilidadeView() {
  const [activeTab, setActiveTab] = useState("contabilidade");
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [isBulkRevenueOpen, setIsBulkRevenueOpen] = useState(false);

  const loadRentabilidade = () => {
    setLoading(true);
    api.getStatsRentabilidade()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRentabilidade();
  }, []);

  const totals = useMemo(() => {
    const totalReceita = data.reduce((s, d) => s + d.totalReceita, 0);
    const totalDespesa = data.reduce((s, d) => s + d.totalDespesa, 0);
    const totalLucro   = totalReceita - totalDespesa;
    const margem = totalReceita > 0 ? ((totalLucro / totalReceita) * 100).toFixed(1) : "0.0";
    return { totalReceita, totalDespesa, totalLucro, margem };
  }, [data]);

  const chartData = useMemo(() =>
    data
      .filter((d) => d.totalReceita > 0 || d.totalDespesa > 0)
      .map((d) => ({ frota: d.frota, receita: d.totalReceita, despesa: d.totalDespesa, lucro: d.totalLucro })),
    [data]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Financeiro</h2>
          <p className="text-gray-600 mt-1">Contabilidade e análise de rentabilidade</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "rentabilidade" && (
          <button
            onClick={() => setIsBulkRevenueOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Adicionar Ganho em Massa
          </button>
        )}
      </div>

      <AddBulkRevenueModal
        isOpen={isBulkRevenueOpen}
        onClose={() => setIsBulkRevenueOpen(false)}
        onSaved={loadRentabilidade}
      />

      {/* Tab content */}
      {activeTab === "contabilidade" && <ContabilidadeTab />}

      {activeTab === "rentabilidade" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4">
              Erro ao carregar dados: {error}
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Receita Total</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">{fmtEuro(totals.totalReceita)}</p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-700" />
                    </div>
                  </div>
                  <p className="text-xs text-green-700">Soma de todas as receitas registadas</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-red-700 font-medium">Despesa Total</p>
                      <p className="text-3xl font-bold text-red-900 mt-2">{fmtEuro(totals.totalDespesa)}</p>
                    </div>
                    <div className="p-3 bg-red-200 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-red-700" />
                    </div>
                  </div>
                  <p className="text-xs text-red-700">Soma de todas as despesas registadas</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Lucro Líquido</p>
                      <p className={`text-3xl font-bold mt-2 ${totals.totalLucro >= 0 ? "text-blue-900" : "text-red-700"}`}>
                        {fmtEuro(totals.totalLucro)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-lg">
                      <Euro className="w-6 h-6 text-blue-700" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                      {totals.margem}%
                    </span>
                    <span className="text-xs text-blue-700">margem de lucro</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Rentabilidade por Frota</h3>
                  <p className="text-sm text-gray-600 mt-1">Comparativo de receitas, despesas e lucros</p>
                </div>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="frota" tick={{ fill: "#6b7280", fontSize: 13 }} tickLine={false} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 13 }} tickLine={false}
                        tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                      <Bar dataKey="receita" fill="#10b981" radius={[8, 8, 0, 0]} name="Receita" />
                      <Bar dataKey="despesa" fill="#ef4444" radius={[8, 8, 0, 0]} name="Despesa" />
                      <Bar dataKey="lucro"   fill="#3b82f6" radius={[8, 8, 0, 0]} name="Lucro" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Euro className="w-12 h-12 mb-3 opacity-30" />
                    <p>Sem receitas ou despesas registadas.</p>
                    <p className="text-sm mt-1">Adicione receitas e despesas nas páginas de frotas para ver o gráfico.</p>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Detalhamento por Frota</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Frota</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Viaturas</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Receita</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Despesa</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Lucro</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Margem</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((fleet) => {
                        const margem = fleet.totalReceita > 0
                          ? ((fleet.totalLucro / fleet.totalReceita) * 100).toFixed(1)
                          : null;
                        const isGood = margem !== null && parseFloat(margem) > 35;
                        return (
                          <tr key={fleet.frotaId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">{fleet.frota}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">
                                {fleet.vehicleCount} <span className="text-gray-400">({fleet.operacionais} op.)</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-medium text-green-600">{fmtEuro(fleet.totalReceita)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-medium text-red-600">{fmtEuro(fleet.totalDespesa)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-sm font-semibold ${fleet.totalLucro >= 0 ? "text-blue-600" : "text-red-600"}`}>
                                {fmtEuro(fleet.totalLucro)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {margem !== null ? (
                                <span className={`text-sm font-semibold ${isGood ? "text-green-600" : "text-orange-600"}`}>
                                  {margem}%
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {margem !== null ? (
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                  isGood ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                }`}>
                                  {isGood ? "Excelente" : "Boa"}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">Sem dados</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {(totals.totalReceita > 0 || totals.totalDespesa > 0) && (
                      <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">TOTAL</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-700">
                              {data.reduce((s, d) => s + d.vehicleCount, 0)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-green-600">{fmtEuro(totals.totalReceita)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-red-600">{fmtEuro(totals.totalDespesa)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`text-sm font-bold ${totals.totalLucro >= 0 ? "text-blue-600" : "text-red-600"}`}>
                              {fmtEuro(totals.totalLucro)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-gray-900">{totals.margem}%</span>
                          </td>
                          <td className="px-6 py-4" />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
