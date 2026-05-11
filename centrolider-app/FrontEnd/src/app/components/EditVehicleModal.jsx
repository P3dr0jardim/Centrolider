import { X } from "lucide-react";
import { useState } from "react";

const toDateInput = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date)) return "";
  return date.toISOString().split("T")[0];
};

export function EditVehicleModal({ isOpen, onClose, onSave, vehicle }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !vehicle) return null;

  const handleClose = () => {
    setSaving(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    for (const [k, v] of fd.entries()) {
      if (v !== "") data[k] = v;
    }
    for (const field of ["km", "intervaloRevisao", "kmsUltimaRevisao", "rentabilidade"]) {
      if (data[field] != null) data[field] = Number(data[field]);
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(data);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const field = (label, name, type = "text", extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={extra.defaultValue ?? (vehicle[name] ?? "")}
        {...extra}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Editar Viatura</h3>
            <p className="text-sm text-gray-500 mt-1">{vehicle.matricula}</p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {field("Modelo", "modelo", "text", { required: true })}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
                <select name="status" defaultValue={vehicle.status || "Operacional"}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="Operacional">Operacional</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              {field("Condutor", "condutor")}
              {field("KM Atual", "km", "number", { min: 0 })}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Combustível</label>
                <select name="combustivel" defaultValue={vehicle.combustivel || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">—</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Elétrico">Elétrico</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="GPL">GPL</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {field("Cor", "cor")}
              {field("Cilindrada", "cilindrada")}
              {field("Potência", "potencia")}
              {field("N.º de Quadro", "numeroQuadro")}

              {field("Próxima Revisão", "proximaRevisao", "date", { defaultValue: toDateInput(vehicle.proximaRevisao) })}
              {field("Validade Seguro", "seguro", "date", { defaultValue: toDateInput(vehicle.seguro) })}
              {field("Validade Contrato", "validadeContrato", "date", { defaultValue: toDateInput(vehicle.validadeContrato) })}

              {field("Intervalo Revisão (km)", "intervaloRevisao", "number", { min: 0 })}
              {field("KMs Última Revisão", "kmsUltimaRevisao", "number", { min: 0 })}
              {field("Tipo de Pneu", "tipoPneu")}
              {field("Pneu Original", "pneuOriginal")}
              {field("Pneu Atual", "pneuAtual")}
              {field("Rentabilidade (€/mês)", "rentabilidade", "number", { min: 0, step: "0.01" })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button type="button" onClick={handleClose}
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-60">
              {saving ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
