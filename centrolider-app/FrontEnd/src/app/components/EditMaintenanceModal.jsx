import { useState, useEffect, useRef } from "react";
import { X, Paperclip } from "lucide-react";

const OFICINAS = [
  "Autocrescente Ribeira Brava",
  "Autocrescente Canhas",
  "Maturifuel",
  "Eurorepar",
  "Opel",
  "Peugeot",
  "Mendes e Gomes",
  "CSantos",
  "CIAM",
  "Autozarco",
  "Vulcanizadora 25 abril",
  "Autobraga",
  "Extrapneu",
];

function toInputDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 10);
}

export function EditMaintenanceModal({ isOpen, onClose, onSave, record }) {
  const [form, setForm] = useState({
    data: "",
    kms: "",
    descricao: "",
    oficina: "",
    custo: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showOficinaSugg, setShowOficinaSugg] = useState(false);
  const oficinaSuggRef = useRef(null);
  const [attachmentFile, setAttachmentFile] = useState(null);

  useEffect(() => {
    if (record) {
      setForm({
        data: toInputDate(record.data),
        kms: record.kms != null ? String(record.kms) : "",
        descricao: record.descricao || "",
        oficina: record.oficina || "",
        custo: record.custo != null ? String(record.custo) : "",
      });
      setError(null);
      setShowOficinaSugg(false);
      setAttachmentFile(null);
    }
  }, [record]);

  useEffect(() => {
    const handler = (e) => {
      if (oficinaSuggRef.current && !oficinaSuggRef.current.contains(e.target))
        setShowOficinaSugg(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isOpen || !record) return null;

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const oficinaSuggestions = OFICINAS.filter(
    (o) =>
      o.toLowerCase().includes(form.oficina.toLowerCase()) &&
      o.toLowerCase() !== form.oficina.toLowerCase(),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(record._id, {
        data: form.data,
        kms: form.kms !== "" ? parseInt(form.kms) : undefined,
        descricao: form.descricao,
        oficina: form.oficina,
        custo: form.custo !== "" ? parseFloat(form.custo) : 0,
        attachmentFile: attachmentFile || undefined,
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
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Editar Registo de Manutenção
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Descrição *
              </label>
              <input
                type="text"
                value={form.descricao}
                onChange={set("descricao")}
                required
                placeholder="Ex: Troca de óleo"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Oficina — combobox with suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Oficina *
              </label>
              <div className="relative" ref={oficinaSuggRef}>
                <input
                  type="text"
                  value={form.oficina}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, oficina: e.target.value }));
                    setShowOficinaSugg(true);
                  }}
                  onFocus={() => setShowOficinaSugg(true)}
                  required
                  placeholder="Selecionar ou digitar oficina"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showOficinaSugg && oficinaSuggestions.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {oficinaSuggestions.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, oficina: o }));
                            setShowOficinaSugg(false);
                          }}
                          className="w-full px-4 py-2.5 text-sm text-left text-gray-800 hover:bg-blue-50 transition-colors"
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Data *
                </label>
                <input
                  type="date"
                  value={form.data}
                  onChange={set("data")}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  KMs
                </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Custo (€)
              </label>
              <input
                type="number"
                value={form.custo}
                onChange={set("custo")}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Documento Anexo (opcional)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors flex-1 min-w-0">
                  <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500 truncate">
                    {attachmentFile ? attachmentFile.name : "Selecionar ficheiro…"}
                  </span>
                  <input type="file" className="hidden" onChange={(e) => setAttachmentFile(e.target.files[0] || null)} />
                </label>
                {attachmentFile && (
                  <button type="button" onClick={() => setAttachmentFile(null)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
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
