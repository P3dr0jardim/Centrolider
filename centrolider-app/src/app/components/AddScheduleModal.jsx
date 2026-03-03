import { X } from "lucide-react";



export function AddScheduleModal({ isOpen, onClose, onSave, selectedDate }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      viatura: formData.get("viatura"),
      tipoEvento: formData.get("tipoEvento"),
      dataInicio: formData.get("dataInicio"),
      horaInicio: formData.get("horaInicio"),
      dataFim: formData.get("dataFim"),
      horaFim: formData.get("horaFim"),
      notas: formData.get("notas"),
    };
    onSave(data);
    onClose();
  };

  const defaultDate = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Novo Agendamento
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
          <div className="px-6 py-5 space-y-5">
            {/* Viatura */}
            <div>
              <label
                htmlFor="viatura"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Viatura
              </label>
              <select
                id="viatura"
                name="viatura"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">Selecione a viatura</option>
                <option value="AA-01-BB">AA-01-BB - Mercedes Sprinter 316</option>
                <option value="AA-02-CC">AA-02-CC - Renault Master L3H2</option>
                <option value="AA-03-DD">AA-03-DD - Peugeot Boxer 435</option>
                <option value="BB-01-XX">BB-01-XX - Iveco Daily 35S</option>
                <option value="BB-02-YY">BB-02-YY - Mercedes Sprinter 316</option>
                <option value="CC-01-PP">CC-01-PP - Mercedes Sprinter 319</option>
              </select>
            </div>

            {/* Tipo de Evento */}
            <div>
              <label
                htmlFor="tipoEvento"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Evento
              </label>
              <select
                id="tipoEvento"
                name="tipoEvento"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">Selecione o tipo</option>
                <option value="inspecao">Inspeção (IPO)</option>
                <option value="revisao">Revisão Oficina</option>
                <option value="seguro">Renovação Seguro</option>
                <option value="reparacao">Reparação</option>
                <option value="manutencao">Manutenção Preventiva</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {/* Data e Hora Início */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="dataInicio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data de Início
                </label>
                <input
                  type="date"
                  id="dataInicio"
                  name="dataInicio"
                  defaultValue={defaultDate}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="horaInicio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Hora de Início
                </label>
                <input
                  type="time"
                  id="horaInicio"
                  name="horaInicio"
                  defaultValue="09:00"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Data e Hora Fim */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="dataFim"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data de Fim
                </label>
                <input
                  type="date"
                  id="dataFim"
                  name="dataFim"
                  defaultValue={defaultDate}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="horaFim"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Hora de Fim
                </label>
                <input
                  type="time"
                  id="horaFim"
                  name="horaFim"
                  defaultValue="17:00"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label
                htmlFor="notas"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notas da Oficina / Observações
              </label>
              <textarea
                id="notas"
                name="notas"
                placeholder="Descrição adicional, endereço da oficina, contacto, etc."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
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
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              Guardar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
