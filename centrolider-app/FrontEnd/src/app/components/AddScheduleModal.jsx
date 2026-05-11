import { X } from "lucide-react";
import { useState, useEffect } from "react";

const TIPOS = [
  { value: "inspecao",   label: "Inspeção (IPO)" },
  { value: "revisao",    label: "Revisão Oficina" },
  { value: "seguro",     label: "Renovação Seguro" },
  { value: "contrato",   label: "Fim de Contrato" },
  { value: "reparacao",  label: "Reparação" },
  { value: "manutencao", label: "Manutenção Preventiva" },
  { value: "outro",      label: "Outro" },
];

export function AddScheduleModal({
  isOpen, onClose, onSave,
  selectedDate,
  schedule,
  prefill,
  vehicles = [],
}) {
  const [viaturaId, setViaturaId] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [dataFim, setDataFim] = useState("");
  const [horaFim, setHoraFim] = useState("17:00");
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!schedule;

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false);
    setError(null);

    if (isEdit) {
      const v = schedule.viaturaId;
      setViaturaId(typeof v === "object" ? v._id : v || "");
      setTipoEvento(schedule.tipoEvento || "");
      setDataInicio(schedule.dataInicio ? schedule.dataInicio.slice(0, 10) : "");
      setHoraInicio(schedule.horaInicio || "09:00");
      setDataFim(schedule.dataFim ? schedule.dataFim.slice(0, 10) : "");
      setHoraFim(schedule.horaFim || "17:00");
      setNotas(schedule.notas || "");
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setViaturaId(prefill?.viaturaId || "");
      setTipoEvento(prefill?.tipoEvento || "");
      setDataInicio(selectedDate || today);
      setHoraInicio("09:00");
      setDataFim(selectedDate || today);
      setHoraFim("17:00");
      setNotas("");
    }
  }, [isOpen, schedule, selectedDate, prefill]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        viaturaId,
        tipoEvento,
        dataInicio,
        horaInicio,
        dataFim: dataFim || dataInicio,
        horaFim,
        notas,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Editar Agendamento" : "Novo Agendamento"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Viatura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Viatura *</label>
              <select
                value={viaturaId}
                onChange={(e) => setViaturaId(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecione a viatura</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.matricula} – {v.modelo}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Evento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento *</label>
              <select
                value={tipoEvento}
                onChange={(e) => setTipoEvento(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecione o tipo</option>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Data e Hora Início */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início *</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Data e Hora Fim */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Fim</label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas / Observações
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Descrição adicional, endereço da oficina, contacto, etc."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
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
              {saving ? "A guardar…" : isEdit ? "Guardar Alterações" : "Criar Agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
