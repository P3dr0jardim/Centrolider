import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Save, Filter, X, Search, CheckCircle, Calendar } from "lucide-react";
import { api } from "../../services/api";
import { LeasingMensalModal } from "./LeasingMensalModal";

const FIELDS = ["leasing", "seguroValor", "iuc", "rentabilidade"];

const parseNum = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
};

const fmt = (v) =>
  v != null && v > 0
    ? `€${Number(v).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

const getFinancialStatus = (v) => {
  if (!v.valoresFinanceirosEm) return "never";
  const days = Math.floor((Date.now() - new Date(v.valoresFinanceirosEm)) / 86400000);
  if (days <= 30) return "ok";
  if (days <= 90) return "review";
  return "stale";
};

const STATUS = {
  ok:     { label: "Em dia",        cls: "bg-green-100 text-green-700 border-green-200" },
  review: { label: "Rever",         cls: "bg-amber-100 text-amber-700 border-amber-200" },
  stale:  { label: "Pendente",      cls: "bg-red-100 text-red-700 border-red-200" },
  never:  { label: "Por confirmar", cls: "bg-red-100 text-red-700 border-red-200" },
};

export function ContabilidadeTab() {
  const [vehicles, setVehicles]         = useState([]);
  const [fleets, setFleets]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [drafts, setDrafts]             = useState({});
  const [selected, setSelected]         = useState(new Set());
  const [bulkSeguro, setBulkSeguro]     = useState("");
  const [bulkIuc, setBulkIuc]           = useState("");
  const [bulkRentabilidade, setBulkRentabilidade] = useState("");
  const [bulkLeasingData, setBulkLeasingData]   = useState(new Date().toISOString().slice(0, 10));
  const [bulkLeasingValor, setBulkLeasingValor] = useState("");
  const [bulkLeasingDescricao, setBulkLeasingDescricao] = useState("");
  const [bulkLeasingSaving, setBulkLeasingSaving] = useState(false);
  const [frotaFilter, setFrotaFilter]   = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [onlyStale, setOnlyStale]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [confirming, setConfirming]     = useState(false);
  const [flashIds, setFlashIds]         = useState(new Set());
  const [leasingModalVehicle, setLeasingModalVehicle] = useState(null);

  const allCheckRef = useRef(null);

  useEffect(() => {
    Promise.all([api.getVehicles(), api.getFleets()])
      .then(([vs, fs]) => { setVehicles(vs); setFleets(fs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayVehicles = useMemo(() => {
    let list = vehicles;
    if (frotaFilter)
      list = list.filter((v) => String(v.frotaId?._id || v.frotaId) === frotaFilter);
    const q = searchFilter.trim().toLowerCase();
    if (q)
      list = list.filter(
        (v) => v.matricula.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q)
      );
    if (onlyStale)
      list = list.filter((v) => getFinancialStatus(v) !== "ok");
    return list;
  }, [vehicles, frotaFilter, searchFilter, onlyStale]);

  const getVal = useCallback(
    (vehicle, field) => {
      const d = drafts[vehicle._id];
      if (d && d[field] !== undefined) return d[field];
      return vehicle[field] ?? "";
    },
    [drafts]
  );

  const isDirtyCell = useCallback(
    (vehicle, field) => {
      const d = drafts[vehicle._id];
      if (!d || d[field] === undefined) return false;
      return parseNum(d[field]) !== (vehicle[field] ?? null);
    },
    [drafts]
  );

  const dirtyIds = useMemo(
    () => vehicles.filter((v) => FIELDS.some((f) => isDirtyCell(v, f))).map((v) => v._id),
    [vehicles, isDirtyCell]
  );

  const totals = useMemo(() => {
    let leasing = 0, seguro = 0, iuc = 0, rentabilidade = 0;
    for (const v of displayVehicles) {
      leasing       += parseNum(getVal(v, "leasing")) ?? 0;
      seguro        += parseNum(getVal(v, "seguroValor")) ?? 0;
      iuc           += parseNum(getVal(v, "iuc")) ?? 0;
      rentabilidade += parseNum(getVal(v, "rentabilidade")) ?? 0;
    }
    return { leasing, seguro, iuc, rentabilidade };
  }, [displayVehicles, getVal]);

  const setDraft = (id, field, value) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const allChecked  = displayVehicles.length > 0 && displayVehicles.every((v) => selected.has(v._id));
  const someChecked = displayVehicles.some((v) => selected.has(v._id));
  useEffect(() => {
    if (allCheckRef.current) allCheckRef.current.indeterminate = someChecked && !allChecked;
  }, [someChecked, allChecked]);

  const toggleAll = () => {
    if (allChecked) {
      setSelected((prev) => { const s = new Set(prev); displayVehicles.forEach((v) => s.delete(v._id)); return s; });
    } else {
      setSelected((prev) => { const s = new Set(prev); displayVehicles.forEach((v) => s.add(v._id)); return s; });
    }
  };

  const toggleOne = (id) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleBulkApply = () => {
    if (!someChecked || (bulkSeguro === "" && bulkIuc === "" && bulkRentabilidade === "")) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const id of selected) {
        next[id] = { ...next[id] };
        if (bulkSeguro        !== "") next[id].seguroValor   = bulkSeguro;
        if (bulkIuc           !== "") next[id].iuc           = bulkIuc;
        if (bulkRentabilidade !== "") next[id].rentabilidade = bulkRentabilidade;
      }
      return next;
    });
    setBulkSeguro(""); setBulkIuc(""); setBulkRentabilidade("");
    setSelected(new Set());
  };

  const handleBulkApplyLeasing = async () => {
    if (!someChecked || bulkLeasingValor === "" || bulkLeasingSaving) return;
    setBulkLeasingSaving(true);
    try {
      await api.bulkSetLeasingMensal({
        vehicleIds: [...selected],
        data: bulkLeasingData,
        valor: parseFloat(bulkLeasingValor),
        descricao: bulkLeasingDescricao || undefined,
      });
      setVehicles(await api.getVehicles());
      setFlashIds(new Set(selected));
      setTimeout(() => setFlashIds(new Set()), 1800);
      setBulkLeasingValor("");
      setBulkLeasingDescricao("");
      setSelected(new Set());
    } catch (err) {
      alert("Erro ao aplicar leasing: " + err.message);
    } finally {
      setBulkLeasingSaving(false);
    }
  };

  const handleConfirmSelected = async () => {
    if (!someChecked || confirming) return;
    setConfirming(true);
    try {
      const ids = [...selected];
      await api.bulkConfirmFinancial(ids);
      const now = new Date().toISOString();
      setVehicles((prev) =>
        prev.map((v) => selected.has(v._id) ? { ...v, valoresFinanceirosEm: now } : v)
      );
      setFlashIds(new Set(ids));
      setSelected(new Set());
      setTimeout(() => setFlashIds(new Set()), 1800);
    } catch (err) {
      alert("Erro ao confirmar: " + err.message);
    } finally {
      setConfirming(false);
    }
  };

  const handleSaveAll = async () => {
    if (!dirtyIds.length || saving) return;
    setSaving(true);
    try {
      const updates = vehicles
        .filter((v) => dirtyIds.includes(v._id))
        .map((v) => {
          const entry = { id: v._id };
          if (isDirtyCell(v, "leasing"))       entry.leasing       = parseNum(drafts[v._id]?.leasing);
          if (isDirtyCell(v, "seguroValor"))   entry.seguroValor   = parseNum(drafts[v._id]?.seguroValor);
          if (isDirtyCell(v, "iuc"))           entry.iuc           = parseNum(drafts[v._id]?.iuc);
          if (isDirtyCell(v, "rentabilidade")) entry.rentabilidade = parseNum(drafts[v._id]?.rentabilidade);
          return entry;
        });

      const saved = await api.bulkUpdateVehicleFields(updates);

      setVehicles((prev) =>
        prev.map((v) => {
          const upd = saved.find((u) => u._id === v._id);
          return upd ? { ...v, ...upd } : v;
        })
      );
      setFlashIds(new Set(dirtyIds));
      setDrafts({});
      setTimeout(() => setFlashIds(new Set()), 1800);
    } catch (err) {
      alert("Erro ao guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const staleCount = vehicles.filter((v) => getFinancialStatus(v) !== "ok").length;
  const isFiltered = frotaFilter || searchFilter.trim() || onlyStale;
  const filterLabel = frotaFilter
    ? fleets.find((f) => f._id === frotaFilter)?.name
    : searchFilter.trim() ? `"${searchFilter.trim()}"` : onlyStale ? "Por rever" : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
          <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide mb-1">Leasing / mês</p>
          <p className="text-2xl font-bold text-indigo-900">{fmt(totals.leasing)}</p>
          <p className="text-xs text-indigo-500 mt-1">
            {displayVehicles.filter((v) => parseNum(getVal(v, "leasing"))).length} viaturas
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <p className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-1">Seguro / mês</p>
          <p className="text-2xl font-bold text-purple-900">{fmt(totals.seguro)}</p>
          <p className="text-xs text-purple-500 mt-1">
            {displayVehicles.filter((v) => parseNum(getVal(v, "seguroValor"))).length} viaturas
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <p className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-1">IUC / ano</p>
          <p className="text-2xl font-bold text-amber-900">{fmt(totals.iuc)}</p>
          <p className="text-xs text-amber-500 mt-1">≈ {fmt(totals.iuc / 12)}/mês</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Rentabilidade / mês</p>
          <p className="text-2xl font-bold text-blue-900">{fmt(totals.rentabilidade)}</p>
          <p className="text-xs text-blue-500 mt-1">
            {displayVehicles.filter((v) => parseNum(getVal(v, "rentabilidade"))).length} viaturas
          </p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-5 border border-rose-200">
          <p className="text-xs text-rose-600 font-medium uppercase tracking-wide mb-1">Encargos / mês</p>
          <p className="text-2xl font-bold text-rose-900">{fmt(totals.leasing + totals.seguro + totals.iuc / 12)}</p>
          <p className="text-xs text-rose-500 mt-1">Leasing + Seguro + IUC/12</p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={frotaFilter}
                onChange={(e) => setFrotaFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Todas as frotas</option>
                {fleets.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Matrícula ou modelo…"
                className="pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
              />
              {searchFilter && (
                <button onClick={() => setSearchFilter("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* "Por rever" toggle */}
            <button
              onClick={() => setOnlyStale((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                onlyStale
                  ? "bg-amber-50 border-amber-300 text-amber-700 font-medium"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Por rever
              {staleCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  onlyStale ? "bg-amber-200 text-amber-800" : "bg-red-100 text-red-600"
                }`}>
                  {staleCount}
                </span>
              )}
            </button>

            {isFiltered && (
              <span className="text-xs text-gray-400">{displayVehicles.length} de {vehicles.length}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {dirtyIds.length > 0 && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                {dirtyIds.length} alteraç{dirtyIds.length === 1 ? "ão" : "ões"} por guardar
              </span>
            )}
            <button
              onClick={handleSaveAll}
              disabled={saving || !dirtyIds.length}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "A guardar…" : "Guardar tudo"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 w-10">
                  <input ref={allCheckRef} type="checkbox" checked={allChecked} onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Viatura</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Frota</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Condutor</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-indigo-600 uppercase tracking-wider">Leasing €/mês</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-purple-600 uppercase tracking-wider">Seguro €/mês</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-amber-600 uppercase tracking-wider">IUC €/ano</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-blue-600 uppercase tracking-wider">Rentab. €/mês</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayVehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                    {onlyStale ? "Todas as viaturas estão em dia." : "Nenhuma viatura encontrada."}
                  </td>
                </tr>
              ) : (
                displayVehicles.map((v) => {
                  const isSelected = selected.has(v._id);
                  const isFlash    = flashIds.has(v._id);
                  const lDirty     = isDirtyCell(v, "leasing");
                  const sDirty     = isDirtyCell(v, "seguroValor");
                  const iDirty     = isDirtyCell(v, "iuc");
                  const rDirty     = isDirtyCell(v, "rentabilidade");
                  const status     = isFlash ? "ok" : getFinancialStatus(v);
                  const st         = STATUS[status];

                  return (
                    <tr key={v._id} className={`transition-colors duration-300 ${
                      isFlash ? "bg-green-50" : isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}>
                      <td className="px-4 py-2.5">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleOne(v._id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-sm font-semibold text-gray-900">{v.matricula}</p>
                        <p className="text-xs text-gray-500">{v.modelo}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-sm text-gray-700">{v.frotaId?.name || "—"}</span>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <span className="text-sm text-gray-500">{v.condutor || "—"}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${st.cls}`}>
                          {st.label}
                        </span>
                        {v.valoresFinanceirosEm && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(v.valoresFinanceirosEm).toLocaleDateString("pt-PT")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button type="button" onClick={() => setLeasingModalVehicle(v)}
                            title="Leasing mensal"
                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <input type="number" min="0" step="0.01" value={getVal(v, "leasing")}
                            onChange={(e) => setDraft(v._id, "leasing", e.target.value)}
                            placeholder="0.00"
                            className={`w-28 text-right px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                              lDirty ? "border-indigo-400 bg-indigo-50 text-indigo-800 font-medium" :
                              isFlash ? "border-green-400 bg-green-50" : "border-gray-200 text-gray-700"
                            }`} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end">
                          <input type="number" min="0" step="0.01" value={getVal(v, "seguroValor")}
                            onChange={(e) => setDraft(v._id, "seguroValor", e.target.value)}
                            placeholder="0.00"
                            className={`w-28 text-right px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                              sDirty ? "border-purple-400 bg-purple-50 text-purple-800 font-medium" :
                              isFlash ? "border-green-400 bg-green-50" : "border-gray-200 text-gray-700"
                            }`} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end">
                          <input type="number" min="0" step="0.01" value={getVal(v, "iuc")}
                            onChange={(e) => setDraft(v._id, "iuc", e.target.value)}
                            placeholder="0.00"
                            className={`w-28 text-right px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                              iDirty ? "border-amber-400 bg-amber-50 text-amber-800 font-medium" :
                              isFlash ? "border-green-400 bg-green-50" : "border-gray-200 text-gray-700"
                            }`} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end">
                          <input type="number" min="0" step="0.01" value={getVal(v, "rentabilidade")}
                            onChange={(e) => setDraft(v._id, "rentabilidade", e.target.value)}
                            placeholder="0.00"
                            className={`w-28 text-right px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              rDirty ? "border-blue-400 bg-blue-50 text-blue-800 font-medium" :
                              isFlash ? "border-green-400 bg-green-50" : "border-gray-200 text-gray-700"
                            }`} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {displayVehicles.length > 0 && (totals.leasing > 0 || totals.seguro > 0 || totals.iuc > 0 || totals.rentabilidade > 0) && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3">
                    <span className="text-sm font-bold text-gray-700">
                      TOTAL {filterLabel ? `(${filterLabel})` : "GERAL"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-indigo-700">{fmt(totals.leasing)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-purple-700">{fmt(totals.seguro)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-amber-700">{fmt(totals.iuc)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-blue-700">{fmt(totals.rentabilidade)}</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Floating bulk bar */}
      {someChecked && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-gray-200 rounded-2xl shadow-2xl px-5 py-3 flex flex-col gap-2.5 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
              {selected.size} viatura{selected.size !== 1 ? "s" : ""}
            </span>
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-1.5 flex-wrap">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="text-xs font-medium text-indigo-600 whitespace-nowrap">Leasing</span>
              <input type="date" value={bulkLeasingData}
                onChange={(e) => setBulkLeasingData(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="number" min="0" step="0.01" value={bulkLeasingValor}
                onChange={(e) => setBulkLeasingValor(e.target.value)} placeholder="€/mês"
                className="w-24 text-right px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="text" value={bulkLeasingDescricao}
                onChange={(e) => setBulkLeasingDescricao(e.target.value)} placeholder="Descrição (opcional)"
                className="w-40 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={handleBulkApplyLeasing}
                disabled={bulkLeasingValor === "" || bulkLeasingSaving}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors whitespace-nowrap">
                {bulkLeasingSaving ? "A aplicar…" : "Aplicar Leasing"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-purple-600 whitespace-nowrap">Seguro</span>
              <input type="number" min="0" step="0.01" value={bulkSeguro}
                onChange={(e) => setBulkSeguro(e.target.value)} placeholder="€/mês"
                className="w-24 text-right px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-amber-600 whitespace-nowrap">IUC</span>
              <input type="number" min="0" step="0.01" value={bulkIuc}
                onChange={(e) => setBulkIuc(e.target.value)} placeholder="€/ano"
                className="w-24 text-right px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-blue-600 whitespace-nowrap">Rentabilidade</span>
              <input type="number" min="0" step="0.01" value={bulkRentabilidade}
                onChange={(e) => setBulkRentabilidade(e.target.value)} placeholder="€/mês"
                className="w-24 text-right px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button onClick={handleBulkApply}
              disabled={bulkSeguro === "" && bulkIuc === "" && bulkRentabilidade === ""}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors whitespace-nowrap">
              Aplicar
            </button>

            <div className="w-px h-6 bg-gray-200 hidden sm:block" />

            <button onClick={handleConfirmSelected} disabled={confirming}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap">
              <CheckCircle className="w-4 h-4" />
              {confirming ? "A confirmar…" : "Confirmar sem alterações"}
            </button>

            <button onClick={() => setSelected(new Set())}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <LeasingMensalModal
        isOpen={!!leasingModalVehicle}
        onClose={() => setLeasingModalVehicle(null)}
        vehicle={leasingModalVehicle}
        onSaved={(updated) => {
          setVehicles((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
          setLeasingModalVehicle(updated);
        }}
      />
    </div>
  );
}
