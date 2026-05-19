import { X } from "lucide-react";
import { useState } from "react";

export function AddVehicleModal({ isOpen, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSaving(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const kmVal = formData.get("km");
    const data = {
      matricula:     formData.get("matricula"),
      modelo:        formData.get("modelo"),
      ano:           formData.get("ano") ? Number(formData.get("ano")) : undefined,
      condutor:      formData.get("condutor") || undefined,
      km:            kmVal ? Number(kmVal) : 0,
      status:        "Operacional",
      tipoPneu:      formData.get("tipoPneu") || undefined,
      pneuOriginal:  formData.get("pneuOriginal") || undefined,
    };
    setSaving(true);
    setError(null);
    try {
      await onSave(data);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Adicionar Viatura</h3>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matrícula</label>
              <input type="text" name="matricula" placeholder="Ex: AB-12-CD" required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
              <input type="text" name="modelo" placeholder="Ex: Mercedes Sprinter 316" required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
              <input type="number" name="ano" placeholder="Ex: 2023" min="1990" max="2030"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condutor (opcional)</label>
              <input type="text" name="condutor" placeholder="Ex: João Silva"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">KMs Iniciais</label>
              <input type="number" name="km" placeholder="Ex: 150000" min="0" defaultValue="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-400 mt-1">Quilometragem actual da viatura ao ser registada.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pneu *</label>
                <input type="text" name="tipoPneu" placeholder="Ex: All-Season, 4x4, Verão" required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input type="text" name="pneuOriginal" placeholder="Ex: 205/55 R16"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <button type="button" onClick={handleClose}
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-60">
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
