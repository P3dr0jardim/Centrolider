import { X } from "lucide-react";
import { useState, useEffect } from "react";

const CATEGORIAS = [
  { value: "pneus",    label: "Pneus" },
  { value: "filtros",  label: "Filtros" },
  { value: "oleo",     label: "Óleo" },
  { value: "travoes",  label: "Travões" },
  { value: "baterias", label: "Baterias" },
  { value: "lampadas", label: "Lâmpadas" },
  { value: "outros",   label: "Outros" },
];

export function AddStockModal({ isOpen, onClose, onSave, item }) {
  const [categoria, setCategoria] = useState("");
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [minimo, setMinimo] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [preco, setPreco] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!item;

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false);
    setError(null);
    if (isEdit) {
      setCategoria(item.categoria || "");
      setNome(item.nome || "");
      setQuantidade(item.quantidade ?? "");
      setMinimo(item.minimo ?? "");
      setFornecedor(item.fornecedor || "");
      setPreco(item.preco ?? "");
    } else {
      setCategoria("");
      setNome("");
      setQuantidade("");
      setMinimo("");
      setFornecedor("");
      setPreco("");
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        categoria,
        nome,
        quantidade: Number(quantidade),
        minimo: Number(minimo),
        fornecedor: fornecedor || undefined,
        preco: preco !== "" ? Number(preco) : undefined,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Editar Item de Stock" : "Adicionar Stock"}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione a categoria</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Item *</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Pneu 205/55 R16 Michelin" required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade *</label>
                <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="Ex: 50" min="0" required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo *</label>
                <input type="number" value={minimo} onChange={(e) => setMinimo(e.target.value)}
                  placeholder="Ex: 20" min="0" required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
              <input type="text" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Ex: AutoPeças SA"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preço Unitário (€)</label>
              <input type="number" value={preco} onChange={(e) => setPreco(e.target.value)}
                placeholder="Ex: 85.50" step="0.01" min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {saving ? "A guardar…" : isEdit ? "Guardar Alterações" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
