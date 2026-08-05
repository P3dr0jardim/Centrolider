import { useState, useEffect, useMemo } from "react";
import {
  Wrench, Plus, ChevronDown, ChevronRight, Pencil, Trash2,
  Euro, Car, AlertTriangle, ClipboardList, CheckCircle, Search, Package,
} from "lucide-react";
import { api } from "../../services/api";
import { EditMaintenanceModal } from "./EditMaintenanceModal";
import { AddMaintenanceSearchModal } from "./AddMaintenanceSearchModal";
import { AddExpenseStockModal } from "./AddExpenseStockModal";
import { ConfirmOperacionalModal } from "./ConfirmOperacionalModal";
import { MaintenanceDetailModal } from "./MaintenanceDetailModal";
import { VehicleDetailView } from "./VehicleDetailView";

function matLabel(m) {
  if (!m) return "";
  if (typeof m === "string") return m;
  return m.quantidade && m.quantidade > 1 ? `${m.nome} x${m.quantidade}` : m.nome;
}

const MAINTENANCE_TYPES = ["manutencao", "reparacao"];

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("pt-PT") : "—");
const fmtEuro = (v) => `€${Number(v).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtNum  = (n) => (n != null ? Number(n).toLocaleString("pt-PT") : "—");

export function ManutencaoView() {
  const [vehicles, setVehicles]       = useState([]);
  const [fleets, setFleets]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [searchOpen, setSearchOpen]           = useState(false);
  const [addingTo, setAddingTo]               = useState(null);
  const [editingRecord, setEditingRecord]     = useState(null);    // { vehicleId, record }
  const [viewingVehicle, setViewingVehicle]   = useState(null);
  const [confirmVehicle, setConfirmVehicle]   = useState(null);
  const [detailRecord, setDetailRecord]       = useState(null);    // { record, vehicle }
  const [historySearch, setHistorySearch]     = useState("");

  useEffect(() => {
    Promise.all([api.getVehicles(), api.getFleets()])
      .then(([v, f]) => { setVehicles(v); setFleets(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateVehicle = (updated) =>
    setVehicles((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));

  // ── Derived data ─────────────────────────────────────────────────────────

  const fleetMap = useMemo(() => {
    const m = {};
    for (const f of fleets) m[f._id] = f.name;
    return m;
  }, [fleets]);

  const emManutencao = useMemo(
    () => vehicles.filter((v) => v.status === "Manutenção"),
    [vehicles]
  );

  const grouped = useMemo(() => {
    const m = {};
    for (const v of emManutencao) {
      const fid  = typeof v.frotaId === "object" ? v.frotaId?._id  : v.frotaId;
      const name = (typeof v.frotaId === "object" ? v.frotaId?.name : null) || fleetMap[fid] || "Frota Desconhecida";
      if (!m[fid]) m[fid] = { name, vehicles: [] };
      m[fid].vehicles.push(v);
    }
    return Object.values(m).sort((a, b) => a.name.localeCompare(b.name));
  }, [emManutencao, fleetMap]);

  const totalCusto = useMemo(
    () => vehicles.reduce((s, v) => s + (v.historicoManutencao || []).reduce((ss, r) => ss + (r.custo || 0), 0), 0),
    [vehicles]
  );

  const totalRegistos = useMemo(
    () => vehicles.reduce((s, v) => s + (v.historicoManutencao || []).length, 0),
    [vehicles]
  );

  const recentRecords = useMemo(() => {
    const all = [];
    for (const v of vehicles)
      for (const r of v.historicoManutencao || [])
        all.push({ ...r, _vehicle: v });
    const sorted = all.sort((a, b) => new Date(b.data) - new Date(a.data));
    if (!historySearch.trim()) return sorted.slice(0, 20);
    const q = historySearch.toLowerCase();
    return sorted.filter(
      (r) =>
        r.descricao?.toLowerCase().includes(q) ||
        r.oficina?.toLowerCase().includes(q) ||
        r._vehicle.matricula?.toLowerCase().includes(q) ||
        r._vehicle.modelo?.toLowerCase().includes(q)
    );
  }, [vehicles, historySearch]);

  const topVehicles = useMemo(
    () =>
      [...vehicles]
        .filter((v) => (v.historicoManutencao || []).length > 0)
        .sort((a, b) => (b.historicoManutencao?.length || 0) - (a.historicoManutencao?.length || 0))
        .slice(0, 6),
    [vehicles]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleExpand = (id) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleMarkOperacional = (vehicle) => {
    setConfirmVehicle(vehicle);
  };

  const doConfirmOperacional = async () => {
    const vehicle = confirmVehicle;
    setConfirmVehicle(null);
    const updated = await api.updateVehicle(String(vehicle._id), { status: "Operacional" });
    updateVehicle(updated);
  };

  // Called from AddExpenseStockModal after vehicle is picked from search
  const handleSaveFromSearch = async (data) => {
    const vehicle = addingTo;
    const valor = parseFloat(data.valor);
    await api.createExpense({
      vehicleId: vehicle._id,
      tipo: data.tipo,
      valor,
      data: data.data,
      descricao: data.descricao,
      kms: data.kms ? parseInt(data.kms) : undefined,
    });
    let maintenanceRecordId = null;
    if (MAINTENANCE_TYPES.includes(data.tipo)) {
      const updated = await api.addMaintenance(vehicle._id, {
        data: data.data,
        descricao: data.descricao || data.tipo,
        custo: valor,
        kms: data.kms ? parseInt(data.kms) : undefined,
        oficina: data.oficina || undefined,
        materiaisUsados: data.materiaisUsados || [],
        custoAdicional: data.custoAdicional || [],
      });
      updateVehicle(updated);
      maintenanceRecordId = updated.historicoManutencao[updated.historicoManutencao.length - 1]?._id;
    }
    if (data.materiaisUsados?.length > 0) {
      api.consumeStock({
        vehicleId: vehicle._id,
        matricula: vehicle.matricula,
        modelo: vehicle.modelo,
        data: data.data,
        descricao: data.descricao || data.tipo,
        items: data.materiaisUsados.map((m) => ({
          stockItemId: m._isCustom ? null : m._id,
          nome: m.nome,
          categoria: m.categoria,
          quantidade: m.quantidade,
        })),
      }).catch(console.error);
    }
    if (data.attachmentFile) {
      const attachFd = new FormData();
      attachFd.append("file", data.attachmentFile);
      if (maintenanceRecordId) attachFd.append("manutencaoId", String(maintenanceRecordId));
      attachFd.append("data", data.data);
      const updatedWithAtt = await api.addAttachment(vehicle._id, attachFd);
      updateVehicle(updatedWithAtt);
    }
    if (data.markAsManutencao && vehicle.status !== "Manutenção") {
      const v2 = await api.updateVehicle(vehicle._id, { status: "Manutenção" });
      updateVehicle(v2);
    }
  };

  // Called from inline edit modal
  const handleUpdateRecord = async (recordId, data) => {
    const { attachmentFile, ...rest } = data;
    let updated = await api.updateMaintenance(editingRecord.vehicleId, recordId, rest);
    if (attachmentFile) {
      const attachFd = new FormData();
      attachFd.append("file", attachmentFile);
      attachFd.append("manutencaoId", String(recordId));
      attachFd.append("data", rest.data);
      updated = await api.addAttachment(editingRecord.vehicleId, attachFd);
    }
    updateVehicle(updated);
    setEditingRecord(null);
  };

  const handleDeleteRecord = async (vehicle, recordId) => {
    if (!window.confirm("Eliminar este registo de manutenção?")) return;
    const updated = await api.deleteMaintenance(vehicle._id, recordId);
    updateVehicle(updated);
  };

  // ── VehicleDetailView overlay ─────────────────────────────────────────────

  if (viewingVehicle) {
    return (
      <VehicleDetailView
        vehicle={viewingVehicle}
        onBack={() => setViewingVehicle(null)}
        onVehicleUpdated={(updated) => { updateVehicle(updated); setViewingVehicle(updated); }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 rounded-xl">
            <Wrench className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manutenção</h1>
            <p className="text-sm text-gray-500">Controlo de viaturas em oficina e histórico de manutenções</p>
          </div>
        </div>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Manutenção
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Em Oficina</p>
            <p className="text-2xl font-bold text-orange-600">{emManutencao.length}</p>
            <p className="text-xs text-gray-400">
              {vehicles.length > 0 ? `${Math.round((emManutencao.length / vehicles.length) * 100)}% da frota` : "—"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
            <Car className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Frotas Afectadas</p>
            <p className="text-2xl font-bold text-gray-900">{grouped.length}</p>
            <p className="text-xs text-gray-400">de {fleets.length} frotas</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
            <Euro className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Custo Total Manutenções</p>
            <p className="text-xl font-bold text-gray-900">{fmtEuro(totalCusto)}</p>
            <p className="text-xs text-gray-400">todos os registos</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total de Registos</p>
            <p className="text-2xl font-bold text-gray-900">{totalRegistos}</p>
            <p className="text-xs text-gray-400">intervenções registadas</p>
          </div>
        </div>
      </div>

      {/* Vehicles in maintenance */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
          Viaturas em Oficina
          {emManutencao.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
              {emManutencao.length}
            </span>
          )}
        </h2>

        {grouped.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-14 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-60" />
            <p className="text-gray-500 font-medium">Nenhuma viatura em manutenção</p>
            <p className="text-gray-400 text-sm mt-1">Todas as viaturas estão operacionais.</p>
          </div>
        ) : (
          grouped.map((fleet) => (
            <div key={fleet.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">{fleet.name}</h3>
                </div>
                <span className="text-sm text-orange-700 font-medium">
                  {fleet.vehicles.length} {fleet.vehicles.length === 1 ? "viatura" : "viaturas"}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {fleet.vehicles.map((vehicle) => {
                  const isExpanded = expandedIds.has(vehicle._id);
                  const sortedRecords = [...(vehicle.historicoManutencao || [])].sort(
                    (a, b) => new Date(b.data) - new Date(a.data)
                  );
                  const latestRecord = sortedRecords[0] || null;

                  return (
                    <div key={vehicle._id}>
                      {/* Vehicle summary row */}
                      <div className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <button
                          onClick={() => toggleExpand(vehicle._id)}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />}
                        </button>

                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                          <button
                            onClick={() => setViewingVehicle(vehicle)}
                            className="text-base font-bold text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {vehicle.matricula}
                          </button>
                          <span className="text-sm text-gray-700">{vehicle.modelo}</span>
                          <span className="text-sm text-gray-500">{vehicle.condutor || "—"}</span>
                          <div className="text-sm text-gray-500">
                            {latestRecord ? (
                              <span title={latestRecord.descricao}>
                                {fmtDate(latestRecord.data)} — <span className="truncate">{latestRecord.descricao}</span>
                              </span>
                            ) : (
                              <span className="text-gray-300">Sem registos</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Edit latest record */}
                          {latestRecord && (
                            <button
                              onClick={() => setEditingRecord({ vehicleId: String(vehicle._id), record: latestRecord })}
                              title="Editar último registo"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Editar
                            </button>
                          )}

                          {/* Mark as operational */}
                          <button
                            onClick={() => handleMarkOperacional(vehicle)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Operacional
                          </button>
                        </div>
                      </div>

                      {/* Expanded maintenance history */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Histórico de Manutenção
                          </p>
                          {sortedRecords.length === 0 ? (
                            <p className="text-sm text-gray-400 py-2">Sem registos de manutenção.</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left text-xs text-gray-500 uppercase">
                                    <th className="pb-2 pr-4 font-semibold">Data</th>
                                    <th className="pb-2 pr-4 font-semibold">KMs</th>
                                    <th className="pb-2 pr-4 font-semibold">Descrição</th>
                                    <th className="pb-2 pr-4 font-semibold">Oficina</th>
                                    <th className="pb-2 pr-4 font-semibold">Materiais</th>
                                    <th className="pb-2 pr-4 font-semibold text-right">Custo</th>
                                    <th className="pb-2"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {sortedRecords.map((rec, i) => (
                                    <tr key={rec._id || i} className="group hover:bg-white transition-colors">
                                      <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{fmtDate(rec.data)}</td>
                                      <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">
                                        {rec.kms ? `${fmtNum(rec.kms)} km` : "—"}
                                      </td>
                                      <td className="py-2 pr-4 text-gray-700 max-w-xs truncate">{rec.descricao}</td>
                                      <td className="py-2 pr-4 text-gray-500">{rec.oficina || "—"}</td>
                                      <td className="py-2 pr-4">
                                        {rec.materiaisUsados?.length > 0 ? (
                                          <div className="flex flex-wrap gap-1">
                                            {rec.materiaisUsados.map((m, j) => (
                                              <span key={j} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                <Package className="w-2.5 h-2.5" />{matLabel(m)}
                                              </span>
                                            ))}
                                          </div>
                                        ) : <span className="text-gray-300 text-xs">—</span>}
                                      </td>
                                      <td className="py-2 pr-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                                        {rec.custo > 0 ? fmtEuro(rec.custo) : "—"}
                                      </td>
                                      <td className="py-2">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => setEditingRecord({ vehicleId: String(vehicle._id), record: rec })}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar"
                                          >
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteRecord(vehicle, rec._id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Intervenções Recentes</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {historySearch ? `${recentRecords.length} resultado(s)` : "Últimas manutenções em toda a frota"}
              </p>
            </div>
            <div className="relative flex-shrink-0 w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrar por descrição…"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
          {recentRecords.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">Sem registos.</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {recentRecords.map((rec, i) => (
                <div key={i} className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Wrench className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setViewingVehicle(rec._vehicle)}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      {rec._vehicle.matricula}
                    </button>
                    <span className="text-xs text-gray-500 ml-1">{rec._vehicle.modelo}</span>
                    <p className="text-sm text-gray-700 truncate mt-0.5">{rec.descricao}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="text-xs text-gray-400">{fmtDate(rec.data)}</p>
                    {rec.custo > 0 && <p className="text-xs font-semibold text-gray-700">{fmtEuro(rec.custo)}</p>}
                    <button
                      onClick={() => setDetailRecord({ record: rec, vehicle: rec._vehicle })}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Viaturas com Mais Intervenções</h3>
            <p className="text-xs text-gray-400 mt-0.5">Viaturas com maior número de manutenções registadas</p>
          </div>
          {topVehicles.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">Sem registos.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {topVehicles.map((v, i) => {
                const totalCustoV = (v.historicoManutencao || []).reduce((s, r) => s + (r.custo || 0), 0);
                const maxCount    = topVehicles[0].historicoManutencao?.length || 1;
                const pct         = Math.round(((v.historicoManutencao?.length || 0) / maxCount) * 100);
                return (
                  <div key={v._id} className="px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                        <button
                          onClick={() => setViewingVehicle(v)}
                          className="text-sm font-semibold text-blue-600 hover:underline"
                        >
                          {v.matricula}
                        </button>
                        <span className="text-xs text-gray-500">{v.modelo}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-700">{v.historicoManutencao?.length} intervenções</span>
                        <span className="text-xs text-gray-400 ml-2">{fmtEuro(totalCustoV)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}

      {/* Step 1 — pick a vehicle */}
      <AddMaintenanceSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        vehicles={vehicles}
        onSelect={(v) => setAddingTo(v)}
      />

      {/* Step 2 — full expense + stock form (same as vehicle page) */}
      <AddExpenseStockModal
        isOpen={!!addingTo}
        onClose={() => setAddingTo(null)}
        onSave={handleSaveFromSearch}
        vehicleId={addingTo?._id}
        vehicle={addingTo}
        markMaintToggle={true}
      />

      <EditMaintenanceModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={handleUpdateRecord}
        record={editingRecord?.record}
      />

      <ConfirmOperacionalModal
        isOpen={!!confirmVehicle}
        onClose={() => setConfirmVehicle(null)}
        onConfirm={doConfirmOperacional}
        vehicle={confirmVehicle}
      />

      <MaintenanceDetailModal
        isOpen={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        record={detailRecord?.record}
        vehicle={detailRecord?.vehicle}
        attachments={detailRecord?.vehicle?.attachments || []}
      />
    </div>
  );
}
