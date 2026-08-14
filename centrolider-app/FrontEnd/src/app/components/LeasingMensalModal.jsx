import { useState, useEffect } from "react";
import { X, Trash2, Calendar } from "lucide-react";
import { api } from "../../services/api";

const fmtEuro = (v) =>
  `€${Number(v).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}`;

const fmtData = (entry) =>
  entry.data
    ? new Date(entry.data).toLocaleDateString("pt-PT")
    : `01/${entry.mes.split("-")[1]}/${entry.mes.split("-")[0]}`;

const todayStr = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);

export function LeasingMensalModal({ isOpen, onClose, vehicle, onSaved }) {
  const [data, setData]       = useState(todayStr());
  const [valor, setValor]     = useState("");
  const [descricao, setDescricao] = useState("");
  const [saving, setSaving]   = useState(false);
  const [deletingMes, setDeletingMes] = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setData(todayStr());
    setValor("");
    setDescricao("");
    setError(null);
  }, [isOpen, vehicle?._id]);

  if (!isOpen || !vehicle) return null;

  const entries = [...(vehicle.leasingMensal || [])].sort((a, b) => b.mes.localeCompare(a.mes));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.setLeasingMensal(vehicle._id, {
        data, valor: parseFloat(valor), descricao: descricao || undefined,
      });
      setValor("");
      setDescricao("");
      onSaved?.(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (targetMes) => {
    setDeletingMes(targetMes);
    setError(null);
    try {
      const updated = await api.deleteLeasingMensal(vehicle._id, targetMes);
      onSaved?.(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingMes(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Leasing Mensal</h3>
            <p className="text-sm text-gray-500 mt-1">{vehicle.matricula} · {vehicle.modelo}</p>
            <p className="text-xs text-gray-400 mt-1">Cada mês guardado cria/atualiza uma despesa de Leasing na viatura.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Data</label>
                <input type="date" value={data} onChange={(e) => setData(e.target.value)} required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Valor (€)</label>
                <input type="number" value={valor} onChange={(e) => setValor(e.target.value)}
                  step="0.01" min="0" required placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {saving ? "…" : "Guardar"}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Descrição (opcional)</label>
              <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Renovação de contrato"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </form>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Histórico</p>
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-sm gap-2">
                <Calendar className="w-8 h-8 opacity-30" />
                Sem valores mensais registados.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                {entries.map((entry) => (
                  <div key={entry.mes} className={`flex items-center justify-between px-3 py-2 ${entry.mes === currentMonth() ? "bg-indigo-50" : ""}`}>
                    <div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">{fmtData(entry)}</span>
                        {entry.mes === currentMonth() && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">atual</span>
                        )}
                      </div>
                      {entry.descricao && (
                        <p className="text-xs text-gray-400 mt-0.5">{entry.descricao}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-indigo-700">{fmtEuro(entry.valor)}</span>
                      <button type="button" onClick={() => handleDelete(entry.mes)} disabled={deletingMes === entry.mes}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
          <button onClick={onClose}
            className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
