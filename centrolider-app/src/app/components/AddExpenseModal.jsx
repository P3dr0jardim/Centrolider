import { X } from "lucide-react";

export function AddExpenseModal({ isOpen, onClose, onSave, vehicleId }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      vehicleId,
      tipo: formData.get("tipo"),
      valor: formData.get("valor"),
      data: formData.get("data"),
      descricao: formData.get("descricao"),
    };
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Adicionar Despesa
            </h3>
            {vehicleId && (
              <p className="text-sm text-gray-500 mt-1">Viatura: {vehicleId}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {/* Tipo de Despesa */}
            <div>
              <label
                htmlFor="tipo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Despesa
              </label>
              <select
                id="tipo"
                name="tipo"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">Selecione o tipo</option>
                <option value="combustivel">Combustível</option>
                <option value="manutencao">Manutenção</option>
                <option value="seguro">Seguro</option>
                <option value="portagem">Portagem</option>
                <option value="multa">Multa</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {/* Valor */}
            <div>
              <label
                htmlFor="valor"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Valor (€)
              </label>
              <input
                type="number"
                id="valor"
                name="valor"
                placeholder="Ex: 45.50"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Data */}
            <div>
              <label
                htmlFor="data"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Data
              </label>
              <input
                type="date"
                id="data"
                name="data"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Descrição */}
            <div>
              <label
                htmlFor="descricao"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                placeholder="Descrição adicional (opcional)"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer */}
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
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
