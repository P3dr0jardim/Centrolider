import { TrendingUp, Euro, Car, Wrench, Search, X, SlidersHorizontal } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../services/api";
import { VehicleDetailView } from "./VehicleDetailView";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280", "#06b6d4", "#ec4899"];

const fmtEuro = (v) => `€${Number(v).toLocaleString("pt-PT")}`;
const fmtNum  = (n) => (n != null ? Number(n).toLocaleString("pt-PT") : "—");

function extractBrand(modelo) {
  if (!modelo) return "Outro";
  const first = modelo.trim().split(/\s+/)[0];
  const cap = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  return cap;
}

// ── Tyre helpers ──────────────────────────────────────────────────────────────
const TYRE_RE = /(\d{3}\/\d{2}\s*[Rr]\s*\d{2})/;

function extractTyreSize(text) {
  if (!text) return null;
  const m = text.match(TYRE_RE);
  return m ? m[1].replace(/\s+/g, "").toUpperCase() : null;
}

function getVehicleTyreSize(v) {
  return (
    extractTyreSize(v.pneuAtual) ||
    extractTyreSize(v.pneuOriginal) ||
    extractTyreSize(v.tipoPneu) ||
    null
  );
}

export function FrotaGlobalView({ initialStatusFilter = "todas" }) {
  const [fleets, setFleets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [modelFilter, setModelFilter]   = useState("");
  const [tyreFilter, setTyreFilter]     = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    Promise.all([api.getFleets(), api.getVehicles()])
      .then(([f, v]) => { setFleets(f); setVehicles(v); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group vehicles by frotaId
  const vehiclesByFleet = useMemo(() => {
    const map = {};
    for (const v of vehicles) {
      const key = typeof v.frotaId === "object" ? v.frotaId._id : v.frotaId;
      if (!map[key]) map[key] = [];
      map[key].push(v);
    }
    return map;
  }, [vehicles]);

  const searchTerm = search.trim().toLowerCase();

  // Unique models (sorted) for the dropdown
  const uniqueModels = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.modelo).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [vehicles]);

  // Unique tyre sizes (sorted) extracted from vehicle tyre fields
  const uniqueTyreSizes = useMemo(() => {
    const set = new Set(vehicles.map(getVehicleTyreSize).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [vehicles]);

  const hasActiveFilters = searchTerm || statusFilter !== "todas" || modelFilter || tyreFilter;

  // Fleet list enriched with their vehicles, filtered by search + status + model + tyre
  const fleetsWithVehicles = useMemo(() =>
    fleets
      .map((f) => {
        const all = vehiclesByFleet[f._id] || [];
        const veiculos = all.filter((v) => {
          const matchSearch = !searchTerm ||
            v.matricula?.toLowerCase().includes(searchTerm) ||
            v.modelo?.toLowerCase().includes(searchTerm) ||
            v.condutor?.toLowerCase().includes(searchTerm);
          const matchStatus = statusFilter === "todas" || v.status === statusFilter;
          const matchModel  = !modelFilter || v.modelo === modelFilter;
          const matchTyre   = !tyreFilter  || getVehicleTyreSize(v) === tyreFilter;
          return matchSearch && matchStatus && matchModel && matchTyre;
        });
        return { ...f, veiculos, totalVeiculos: all.length };
      })
      .filter((f) => f.veiculos.length > 0),
    [fleets, vehiclesByFleet, searchTerm, statusFilter, modelFilter, tyreFilter]
  );

  // Global stats
  const totalVeiculos = vehicles.length;
  const operacionais = vehicles.filter((v) => v.status === "Operacional").length;
  const emManutencao = vehicles.filter((v) => v.status === "Manutenção").length;
  const totalRentMensal = vehicles.reduce((s, v) => s + (v.rentabilidade || 0), 0);
  const totalRentAnual = totalRentMensal * 12;

  // Brand distribution
  const brandCounts = useMemo(() => {
    const map = {};
    for (const v of vehicles) {
      const brand = extractBrand(v.modelo);
      map[brand] = (map[brand] || 0) + 1;
    }
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 7);
    const otherCount = sorted.slice(7).reduce((s, [, c]) => s + c, 0);
    const result = top.map(([nome, count]) => ({ nome, valor: Math.round((count / totalVeiculos) * 100), count }));
    if (otherCount > 0) result.push({ nome: "Outros", valor: Math.round((otherCount / totalVeiculos) * 100), count: otherCount });
    return result;
  }, [vehicles, totalVeiculos]);

  // Vehicles per fleet (bar chart data)
  const veiculosPorFrota = useMemo(() =>
    fleetsWithVehicles
      .sort((a, b) => b.veiculos.length - a.veiculos.length)
      .slice(0, 10)
      .map((f) => ({ frota: f.name, total: f.veiculos.length, operacionais: f.veiculos.filter((v) => v.status === "Operacional").length })),
    [fleetsWithVehicles]
  );

  if (selectedVehicle) {
    return (
      <VehicleDetailView
        vehicle={selectedVehicle}
        onBack={() => setSelectedVehicle(null)}
        onVehicleUpdated={(updated) => {
          setVehicles((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
          setSelectedVehicle(updated);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4">
        Erro ao carregar dados: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Frota Global e Estatísticas</h2>
        <p className="text-gray-600 mt-1">Visão consolidada de todas as frotas geridas</p>
      </div>

      {/* Listagens por Frota */}
      <div className="space-y-6">
        {/* Row 1: status filters + text search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-semibold text-gray-900 mr-2">Listagens de Frotas por Empresa</h3>
            {[
              { key: "todas",       label: "Todas",        count: vehicles.length, color: "bg-gray-600" },
              { key: "Operacional", label: "Operacionais", count: operacionais,    color: "bg-green-600" },
              { key: "Manutenção",  label: "Manutenção",   count: emManutencao,    color: "bg-orange-500" },
            ].map(({ key, label, count, color }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  statusFilter === key
                    ? `${color} text-white border-transparent`
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  statusFilter === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar matrícula, modelo, condutor…"
              className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: model + tyre size dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="font-medium">Filtrar por:</span>
          </div>

          {/* Model dropdown */}
          <div className="relative">
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className={`pl-3 pr-8 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer transition-colors ${
                modelFilter ? "border-blue-400 text-blue-700 bg-blue-50 font-medium" : "border-gray-200 text-gray-700"
              }`}
            >
              <option value="">Todos os modelos</option>
              {uniqueModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Tyre size dropdown */}
          <div className="relative">
            <select
              value={tyreFilter}
              onChange={(e) => setTyreFilter(e.target.value)}
              className={`pl-3 pr-8 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer transition-colors ${
                tyreFilter ? "border-blue-400 text-blue-700 bg-blue-50 font-medium" : "border-gray-200 text-gray-700"
              }`}
            >
              <option value="">Todas as dimensões de pneu</option>
              {uniqueTyreSizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Clear all filters */}
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(""); setStatusFilter("todas"); setModelFilter(""); setTyreFilter(""); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          )}

          {/* Active filter count badge */}
          {hasActiveFilters && (
            <span className="text-xs text-gray-500">
              {fleetsWithVehicles.reduce((s, f) => s + f.veiculos.length, 0)} viatura{fleetsWithVehicles.reduce((s, f) => s + f.veiculos.length, 0) !== 1 ? "s" : ""} encontrada{fleetsWithVehicles.reduce((s, f) => s + f.veiculos.length, 0) !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {fleetsWithVehicles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-gray-400">
            {hasActiveFilters ? "Nenhuma viatura encontrada com os filtros aplicados." : "Nenhuma frota com veículos encontrada."}
          </div>
        ) : (
          fleetsWithVehicles.map((fleet) => (
            <div key={fleet._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{fleet.name}</h4>
                  {fleet.description && <p className="text-sm text-gray-600 mt-0.5">{fleet.description}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm">
                    {hasActiveFilters
                      ? `${fleet.veiculos.length} / ${fleet.totalVeiculos} Viaturas`
                      : `${fleet.veiculos.length} Viaturas`}
                  </span>
                  <span className="text-sm text-gray-600">
                    {fleet.veiculos.filter((v) => v.status === "Operacional").length} operacionais
                  </span>
                </div>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Matrícula</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Modelo</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Condutor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pneu</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">KM</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Rentabilidade/mês</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fleet.veiculos.map((v) => (
                      <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedVehicle(v)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            {v.matricula}
                          </button>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">{v.modelo}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{v.condutor || "—"}</td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          {(() => {
                            const size = getVehicleTyreSize(v);
                            return size ? (
                              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                                tyreFilter && size === tyreFilter
                                  ? "bg-blue-100 text-blue-700 font-semibold"
                                  : "bg-gray-100 text-gray-600"
                              }`}>{size}</span>
                            ) : <span className="text-gray-300 text-sm">—</span>;
                          })()}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            v.status === "Operacional" ? "bg-green-100 text-green-700"
                            : v.status === "Manutenção" ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                          }`}>{v.status}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-right text-gray-700">
                          {v.km != null ? `${fmtNum(v.km)} km` : "—"}
                        </td>
                        <td className="px-6 py-3 text-sm text-right">
                          {v.rentabilidade ? (
                            <span className="font-semibold text-green-600 flex items-center justify-end gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              {fmtEuro(v.rentabilidade)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Estatísticas de Veículos</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Brand distribution donut */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Marca</h4>
            {brandCounts.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={brandCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={2} dataKey="count">
                      {brandCounts.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} veículos (${props.payload.valor}%)`, props.payload.nome]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {brandCounts.map((marca, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-600 truncate">{marca.nome} ({marca.count})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Sem dados</div>
            )}
          </div>

          {/* Vehicles per fleet bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Viaturas por Frota</h4>
            {veiculosPorFrota.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={veiculosPorFrota} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis dataKey="frota" type="category" width={52} tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip formatter={(v, n) => [v, n === "total" ? "Total" : "Operacionais"]} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Total" />
                  <Bar dataKey="operacionais" fill="#10b981" radius={[0, 4, 4, 0]} name="Operacionais" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Sem dados</div>
            )}
          </div>

          {/* KPI summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Euro className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Valor Total do Ativo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalRentAnual > 0 ? fmtEuro(totalRentAnual) : "—"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Rentabilidade anual estimada</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <Car className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Rentabilidade Mensal Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalRentMensal > 0 ? fmtEuro(totalRentMensal) : "—"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {vehicles.filter((v) => v.rentabilidade > 0).length} viaturas com valor definido
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <Wrench className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Ativos vs Oficina</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-green-600">{operacionais}</p>
                    <span className="text-gray-400 font-semibold">/</span>
                    <p className="text-2xl font-bold text-orange-600">{emManutencao}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalVeiculos > 0 ? `${Math.round((operacionais / totalVeiculos) * 100)}%` : "—"} operacionais
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
