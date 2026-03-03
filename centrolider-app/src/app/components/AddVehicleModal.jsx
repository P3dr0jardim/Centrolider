import { X } from "lucide-react";

export function AddVehicleModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      matricula: formData.get("matricula"),
      modelo: formData.get("modelo"),
      ano: formData.get("ano"),
      condutor: formData.get("condutor"),
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
          <h3 className="text-xl font-semibold text-gray-900">
            Adicionar Viatura
          </h3>
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
            {/* Matrícula */}
            <div>
              <label
                htmlFor="matricula"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Matrícula
              </label>
              <input
                type="text"
                id="matricula"
                name="matricula"
                placeholder="Ex: AB-12-CD"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Modelo */}
            <div>
              <label
                htmlFor="modelo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Modelo
              </label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                placeholder="Ex: Mercedes Sprinter 316"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Ano */}
            <div>
              <label
                htmlFor="ano"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ano
              </label>
              <input
                type="number"
                id="ano"
                name="ano"
                placeholder="Ex: 2023"
                min="1990"
                max="2030"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Condutor */}
            <div>
              <label
                htmlFor="condutor"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Condutor
              </label>
              <input
                type="text"
                id="condutor"
                name="condutor"
                placeholder="Ex: João Silva"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
