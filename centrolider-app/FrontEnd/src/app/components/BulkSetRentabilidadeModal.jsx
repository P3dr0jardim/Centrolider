import { useState, useEffect, useMemo, useRef } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";

export function BulkSetRentabilidadeModal({ isOpen, onClose, onSaved, vehicles, fleetName }) {
  const [searchFilter, setSearchFilter] = useState("");
  const [selected, setSelected]       = useState(new Set());
  const [valor, setValor]             = useState("");
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);
  const [done, setDone]               = useState(null);

  const allCheckRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setSearchFilter(""); setSelected(new Set()); setValor("");
    setError(null); setDone(null); setSaving(false);
  }, [isOpen]);

  const handleClose = () => {
    setSearchFilter(""); setSelected(new Set()); setValor("");
    setError(null); setDone(null); setSaving(false);
    onClose();
  };

  const displayVehicles = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) => v.matricula.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q)
    );
  }, [vehicles, searchFilter]);

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
      const num = parseFloat(valor);
      const updates = [...selected].map((id) => ({ id, rentabilidade: num }));
      await api.bulkUpdateVehicleFields(updates);
      setDone(selected.size);
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

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Atualizar Rentabilidade em Massa</h3>
            <p className="text-sm text-gray-500 mt-1">
              Defina a rentabilidade mensal de várias viaturas da frota {fleetName || ""} de uma só vez.
            </p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done !== null ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <CheckCircle2 className="w-12 h-12 text-blue-600" />
            <p className="text-lg font-semibold text-gray-900">
              Rentabilidade atualizada em {done} viatura{done === 1 ? "" : "s"}
            </p>
            <button onClick={handleClose}
              className="mt-2 px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors">
              Concluir
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Matrícula ou modelo…"
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
              />
              <span className="text-xs text-gray-400 ml-auto">{selected.size} selecionada{selected.size === 1 ? "" : "s"}</span>
            </div>

            <div className="overflow-y-auto flex-1" style={{ maxHeight: "40vh" }}>
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2.5 w-10">
                      <input ref={allCheckRef} type="checkbox" checked={allChecked} onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Viatura</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Rent. Atual</th>
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
                        <tr key={v._id} className={`transition-colors cursor-pointer ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                          onClick={() => toggleOne(v._id)}>
                          <td className="px-4 py-2">
                            <input type="checkbox" checked={isSelected} onChange={() => toggleOne(v._id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                          </td>
                          <td className="px-4 py-2">
                            <p className="text-sm font-semibold text-gray-900">{v.matricula}</p>
                            <p className="text-xs text-gray-500">{v.modelo}</p>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="text-sm text-gray-700">
                              {v.rentabilidade ? `€${Number(v.rentabilidade).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}` : "—"}
                            </span>
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
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Rentabilidade (€/mês)</label>
                <input type="number" value={valor} onChange={(e) => setValor(e.target.value)}
                  step="0.01" min="0" required placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={handleClose}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving || selected.size === 0}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-40">
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
