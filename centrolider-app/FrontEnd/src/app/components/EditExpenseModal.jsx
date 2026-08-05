import { useState, useEffect } from "react";
import { X } from "lucide-react";

const TIPOS = [
  { value: "combustivel",  label: "Combustível" },
  { value: "manutencao",   label: "Manutenção" },
  { value: "reparacao",    label: "Reparação" },
  { value: "seguro",       label: "Seguro" },
  { value: "portagem",     label: "Portagem" },
  { value: "inspecao",     label: "Inspeção" },
  { value: "multa",        label: "Multa" },
  { value: "gps",          label: "GPS" },
  { value: "iuc",          label: "IUC" },
  { value: "outro",        label: "Outro" },
];

function toInputDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 10);
}

export function EditExpenseModal({ isOpen, onClose, onSave, expense }) {
  const [form, setForm] = useState({ tipo: "", valor: "", data: "", kms: "", descricao: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (expense) {
      setForm({
        tipo:     expense.tipo || "",
        valor:    expense.valor != null ? String(expense.valor) : "",
        data:     toInputDate(expense.data),
        kms:      expense.kms != null ? String(expense.kms) : "",
        descricao: expense.descricao || "",
      });
      setError(null);
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(expense._id, {
        tipo:     form.tipo,
        valor:    parseFloat(form.valor),
        data:     form.data,
        kms:      form.kms !== "" ? parseInt(form.kms) : undefined,
        descricao: form.descricao || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Editar Despesa</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Despesa</label>
              <select
                value={form.tipo}
                onChange={set("tipo")}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecione o tipo</option>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Valor (€)</label>
                <input
                  type="number"
                  value={form.valor}
                  onChange={set("valor")}
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">KMs</label>
                <input
                  type="number"
                  value={form.kms}
                  onChange={set("kms")}
                  min="0"
                  placeholder="—"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={set("data")}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
              <textarea
                value={form.descricao}
                onChange={set("descricao")}
                placeholder="Descrição adicional (opcional)"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
