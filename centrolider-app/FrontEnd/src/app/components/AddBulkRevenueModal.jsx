import { useState, useEffect, useMemo, useRef } from "react";
import { X, Search, Filter, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";

export function AddBulkRevenueModal({ isOpen, onClose, onSaved }) {
  const [vehicles, setVehicles]       = useState([]);
  const [fleets, setFleets]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [frotaFilter, setFrotaFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [selected, setSelected]       = useState(new Set());
  const [tipo, setTipo]               = useState("renda");
  const [valor, setValor]             = useState("");
  const [data, setData]               = useState("");
  const [descricao, setDescricao]     = useState("");
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);
  const [done, setDone]               = useState(null);

  const allCheckRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setDone(null);
    Promise.all([api.getVehicles(), api.getFleets()])
      .then(([vs, fs]) => { setVehicles(vs); setFleets(fs); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleClose = () => {
    setFrotaFilter(""); setSearchFilter(""); setSelected(new Set());
    setTipo("renda"); setValor(""); setData(""); setDescricao("");
    setError(null); setDone(null); setSaving(false);
    onClose();
  };

  const displayVehicles = useMemo(() => {
    let list = vehicles;
    if (frotaFilter)
      list = list.filter((v) => String(v.frotaId?._id || v.frotaId) === frotaFilter);
    const q = searchFilter.trim().toLowerCase();
    if (q)
      list = list.filter(
        (v) => v.matricula.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q)
      );
    return list;
  }, [vehicles, frotaFilter, searchFilter]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected.size === 0 || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.bulkCreateRevenue({
        vehicleIds: [...selected],
        tipo,
        valor: parseFloat(valor),
        data,
        descricao: descricao || undefined,
      });
      setDone(res.created);
      setSelected(new Set());
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Adicionar Ganho em Massa</h3>
            <p className="text-sm text-gray-500 mt-1">Registe um ganho (ex: Renda) em várias viaturas de uma só vez.</p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : done !== null ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
            <p className="text-lg font-semibold text-gray-900">
              Ganho registado em {done} viatura{done === 1 ? "" : "s"}
            </p>
            <button onClick={handleClose}
              className="mt-2 px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg transition-colors">
              Concluir
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={frotaFilter}
                  onChange={(e) => setFrotaFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
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
                  className="pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-44"
                />
                {searchFilter && (
                  <button type="button" onClick={() => setSearchFilter("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <span className="text-xs text-gray-400 ml-auto">{selected.size} selecionada{selected.size === 1 ? "" : "s"}</span>
            </div>

            <div className="overflow-y-auto flex-1" style={{ maxHeight: "40vh" }}>
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2.5 w-10">
                      <input ref={allCheckRef} type="checkbox" checked={allChecked} onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Viatura</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Frota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-sm text-gray-400">Nenhuma viatura encontrada.</td>
                    </tr>
                  ) : (
                    displayVehicles.map((v) => {
                      const isSelected = selected.has(v._id);
                      return (
                        <tr key={v._id} className={`transition-colors cursor-pointer ${isSelected ? "bg-green-50" : "hover:bg-gray-50"}`}
                          onClick={() => toggleOne(v._id)}>
                          <td className="px-4 py-2">
                            <input type="checkbox" checked={isSelected} onChange={() => toggleOne(v._id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                          </td>
                          <td className="px-4 py-2">
                            <p className="text-sm font-semibold text-gray-900">{v.matricula}</p>
                            <p className="text-xs text-gray-500">{v.modelo}</p>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-sm text-gray-700">{v.frotaId?.name || "—"}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-5 border-t border-gray-200 space-y-4 bg-gray-50">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Tipo de Ganho</label>
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                    <option value="servico">Serviço de Transporte</option>
                    <option value="aluguer">Aluguer</option>
                    <option value="renda">Renda</option>
                    <option value="entrega">Entrega</option>
                    <option value="bonus">Bónus</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Valor (€)</label>
                  <input type="number" value={valor} onChange={(e) => setValor(e.target.value)}
                    step="0.01" min="0" required placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Data</label>
                  <input type="date" value={data} onChange={(e) => setData(e.target.value)} required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Descrição</label>
                  <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={handleClose}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving || selected.size === 0}
                  className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-40">
                  {saving ? "A guardar…" : `Aplicar a ${selected.size} viatura${selected.size === 1 ? "" : "s"}`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
