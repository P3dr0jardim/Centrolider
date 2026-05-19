import { X, Plus, Pencil, Trash2, MapPin } from "lucide-react";

export const TIPO_CONFIG = {
  inspecao:   { label: "Inspeção (IPO)",        color: "bg-red-100 text-red-700 border-red-300" },
  revisao:    { label: "Revisão",               color: "bg-blue-100 text-blue-700 border-blue-300" },
  seguro:     { label: "Seguro",                color: "bg-purple-100 text-purple-700 border-purple-300" },
  contrato:   { label: "Fim de Contrato",       color: "bg-orange-100 text-orange-700 border-orange-300" },
  reparacao:  { label: "Reparação",             color: "bg-amber-100 text-amber-700 border-amber-300" },
  manutencao: { label: "Manutenção",            color: "bg-teal-100 text-teal-700 border-teal-300" },
  outro:      { label: "Outro",                 color: "bg-gray-100 text-gray-700 border-gray-300" },
};

const fmtDateKey = (key) => {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-PT", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
};

export function DayEventsModal({ dateKey, events, onClose, onAdd, onEdit, onDelete }) {
  const autoEvents = events.filter((e) => e._auto);
  const manualEvents = events.filter((e) => !e._auto);

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar este agendamento?")) return;
    await onDelete(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">{fmtDateKey(dateKey)}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {events.length} evento{events.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Events list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {events.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Nenhum evento neste dia.
            </div>
          )}

          {/* Auto-events (read-only — derived from vehicle data) */}
          {autoEvents.map((ev, i) => {
            const cfg = TIPO_CONFIG[ev.tipo] || TIPO_CONFIG.outro;
            return (
              <div
                key={`auto-${i}`}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border flex-shrink-0 ${cfg.color}`}>
                  {cfg.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {ev.matricula}{" "}
                    <span className="font-normal text-gray-500">– {ev.modelo}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Data automática do veículo</p>
                </div>
              </div>
            );
          })}

          {/* Manual schedules (editable) */}
          {manualEvents.map((ev) => {
            const cfg = TIPO_CONFIG[ev.tipoEvento] || TIPO_CONFIG.outro;
            const matricula = ev.viaturaId?.matricula || "";
            const modelo = ev.viaturaId?.modelo || "";
            return (
              <div
                key={ev._id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors"
              >
                <span className={`mt-0.5 px-2 py-0.5 text-xs font-medium rounded-full border flex-shrink-0 ${cfg.color}`}>
                  {cfg.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {matricula}{modelo && <span className="font-normal text-gray-500"> – {modelo}</span>}
                  </p>
                  {(ev.horaInicio || ev.horaFim) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ev.horaInicio}{ev.horaFim ? ` – ${ev.horaFim}` : ""}
                    </p>
                  )}
                  {ev.oficina && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {ev.oficina}
                    </p>
                  )}
                  {ev.notas && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ev.notas}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEdit(ev)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ev._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onAdd}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar Serviço
          </button>
        </div>
      </div>
    </div>
  );
}
