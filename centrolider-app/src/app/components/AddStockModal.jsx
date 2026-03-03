import { X } from "lucide-react";



export function AddStockModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      categoria: formData.get("categoria"),
      nome: formData.get("nome"),
      quantidade: formData.get("quantidade"),
      minimo: formData.get("minimo"),
      fornecedor: formData.get("fornecedor"),
      preco: formData.get("preco"),
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
            Adicionar Stock
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
            {/* Categoria */}
            <div>
              <label
                htmlFor="categoria"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Categoria
              </label>
              <select
                id="categoria"
                name="categoria"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">Selecione a categoria</option>
                <option value="pneus">Pneus</option>
                <option value="filtros">Filtros</option>
                <option value="oleo">Óleo</option>
                <option value="travoes">Travões</option>
                <option value="baterias">Baterias</option>
                <option value="lampadas">Lâmpadas</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {/* Nome do Item */}
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nome do Item
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                placeholder="Ex: Pneu 205/55 R16"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Quantidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="quantidade"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Quantidade
                </label>
                <input
                  type="number"
                  id="quantidade"
                  name="quantidade"
                  placeholder="Ex: 50"
                  min="0"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="minimo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  id="minimo"
                  name="minimo"
                  placeholder="Ex: 20"
                  min="0"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Fornecedor */}
            <div>
              <label
                htmlFor="fornecedor"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fornecedor
              </label>
              <input
                type="text"
                id="fornecedor"
                name="fornecedor"
                placeholder="Ex: AutoPeças SA"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Preço Unitário */}
            <div>
              <label
                htmlFor="preco"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Preço Unitário (€)
              </label>
              <input
                type="number"
                id="preco"
                name="preco"
                placeholder="Ex: 85.50"
                step="0.01"
                min="0"
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
