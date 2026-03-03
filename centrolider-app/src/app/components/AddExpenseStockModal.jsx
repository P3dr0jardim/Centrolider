import { X, Search, Plus, Minus } from "lucide-react";
import { useState } from "react";

// Mock stock items
const stockItems = [
  { id: "STK-001", nome: "Pneu 205/55 R16 Michelin", quantidade: 48, categoria: "Pneus" },
  { id: "STK-004", nome: "Filtro de Óleo Mann W811/80", quantidade: 68, categoria: "Filtros" },
  { id: "STK-005", nome: "Filtro de Ar K&N 33-2070", quantidade: 42, categoria: "Filtros" },
  { id: "STK-006", nome: "Óleo Motor 5W30 Castrol - 5L", quantidade: 125, categoria: "Óleo" },
  { id: "STK-007", nome: "Óleo Motor 10W40 Mobil - 5L", quantidade: 98, categoria: "Óleo" },
  { id: "STK-008", nome: "Pastilhas de Travão - Dianteiras", quantidade: 25, categoria: "Travões" },
  { id: "STK-009", nome: "Pastilhas de Travão - Traseiras", quantidade: 12, categoria: "Travões" },
  { id: "STK-011", nome: "Bateria 12V 80Ah Varta", quantidade: 8, categoria: "Baterias" },
  { id: "STK-013", nome: "Lâmpada H7 Philips", quantidade: 95, categoria: "Lâmpadas" },
];

export function AddExpenseStockModal({ isOpen, onClose, onSave, vehicleId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      vehicleId,
      tipoDespesa: formData.get("tipoDespesa"),
      valor: formData.get("valor"),
      data: formData.get("data"),
      descricao: formData.get("descricao"),
      materiaisUsados: selectedItems,
    };
    onSave(data);
    onClose();
    setSelectedItems([]);
    setSearchTerm("");
  };

  const filteredStockItems = stockItems.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToSelected = (item) => {
    const exists = selectedItems.find(i => i.id === item.id);
    if (!exists) {
      setSelectedItems([...selectedItems, { id: item.id, nome: item.nome, quantidade: 1 }]);
    }
  };

  const updateItemQuantity = (id, quantidade) => {
    if (quantidade <= 0) {
      setSelectedItems(selectedItems.filter(i => i.id !== id));
    } else {
      setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, quantidade } : i));
    }
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(i => i.id !== id));
  };

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
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Registar Nova Despesa
            </h3>
            <p className="text-sm text-gray-500 mt-1">Viatura: {vehicleId}</p>
          </div>
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
            {/* Tipo de Despesa */}
            <div>
              <label
                htmlFor="tipoDespesa"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Despesa
              </label>
              <select
                id="tipoDespesa"
                name="tipoDespesa"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">Selecione o tipo</option>
                <option value="manutencao">Manutenção</option>
                <option value="reparacao">Reparação</option>
                <option value="combustivel">Combustível</option>
                <option value="portagem">Portagem</option>
                <option value="seguro">Seguro</option>
                <option value="inspecao">Inspeção</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {/* Valor e Data */}
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Ex: 250.00"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
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
                placeholder="Descrição da despesa ou manutenção"
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Seção de Consumir do Stock */}
            <div className="border-t border-gray-200 pt-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Consumir do Stock (Opcional)
              </h4>
              
              {/* Barra de pesquisa */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Pesquisar peças/materiais
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Resultados da pesquisa */}
              {searchTerm && (
                <div className="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredStockItems.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filteredStockItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addItemToSelected(item)}
                          className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                            <p className="text-xs text-gray-500">
                              {item.categoria} • Disponível: {item.quantidade}
                            </p>
                          </div>
                          <Plus className="w-4 h-4 text-blue-600" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-500 text-center">
                      Nenhum item encontrado
                    </p>
                  )}
                </div>
              )}

              {/* Itens selecionados */}
              {selectedItems.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materiais a consumir ({selectedItems.length})
                  </label>
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, item.quantidade - 1)}
                            className="p-1 text-gray-600 hover:bg-white rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-semibold text-gray-900 w-8 text-center">
                            {item.quantidade}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, item.quantidade + 1)}
                            className="p-1 text-gray-600 hover:bg-white rounded transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              className="px-5 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors shadow-sm"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
