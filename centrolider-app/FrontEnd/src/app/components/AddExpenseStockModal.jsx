import { X, Search, Plus, Minus, PackagePlus, AlertTriangle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";

const MAINTENANCE_TYPES = ["manutencao", "reparacao"];

const CATEGORIAS = [
  { value: "pneus",    label: "Pneus" },
  { value: "filtros",  label: "Filtros" },
  { value: "oleo",     label: "Óleo" },
  { value: "travoes",  label: "Travões" },
  { value: "baterias", label: "Baterias" },
  { value: "lampadas", label: "Lâmpadas" },
  { value: "outros",   label: "Outros" },
];

// ── Tyre-size helpers ─────────────────────────────────────────────────────────

const TYRE_RE = /(\d{3}\/\d{2}\s*[Rr]\s*\d{2})/;

const extractTyreSize = (text) => {
  if (!text) return null;
  const m = text.match(TYRE_RE);
  return m ? m[1] : null;
};

const normSize = (s) => s.replace(/\s+/g, "").toUpperCase();

const sizesMatch = (a, b) => {
  const sa = extractTyreSize(a) || a;
  const sb = extractTyreSize(b) || b;
  return normSize(sa) === normSize(sb);
};

// ─────────────────────────────────────────────────────────────────────────────

export function AddExpenseStockModal({ isOpen, onClose, onSave, vehicleId, vehicle }) {
  const [tipo, setTipo] = useState("");
  const [valor, setValor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Custom item form
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customNome, setCustomNome] = useState("");
  const [customCategoria, setCustomCategoria] = useState("outros");
  const [customQty, setCustomQty] = useState(1);

  // Tyre-size mismatch warning: { item, vehicleSize, itemSize }
  const [tyreMismatch, setTyreMismatch] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    api.getStock().then(setStockItems).catch(() => setStockItems([]));
  }, [isOpen]);

  // The vehicle's current tyre size (try pneuAtual → pneuOriginal → tipoPneu)
  const vehicleTyreSize = useMemo(() => {
    if (!vehicle) return null;
    return (
      extractTyreSize(vehicle.pneuAtual) ||
      extractTyreSize(vehicle.pneuOriginal) ||
      extractTyreSize(vehicle.tipoPneu) ||
      vehicle.pneuAtual ||
      vehicle.pneuOriginal ||
      vehicle.tipoPneu ||
      null
    );
  }, [vehicle]);

  // Auto-price: sum of (qty × unit price) for stock items that have a price
  const stockTotal = useMemo(() => {
    return selectedItems.reduce((sum, sel) => {
      const full = stockItems.find((s) => s._id === sel._id);
      return sum + (full?.preco ? full.preco * sel.quantidade : 0);
    }, 0);
  }, [selectedItems, stockItems]);

  // Keep valor in sync with stock total whenever items change,
  // but only if every selected item has a price (so we don't silently zero out)
  useEffect(() => {
    if (selectedItems.length === 0 && customItems.length === 0) {
      setValor("");
      return;
    }
    const allHavePrice = selectedItems.every((sel) => {
      const full = stockItems.find((s) => s._id === sel._id);
      return full?.preco != null && full.preco > 0;
    });
    if (allHavePrice && selectedItems.length > 0) {
      setValor(stockTotal.toFixed(2));
    }
  }, [selectedItems, customItems, stockTotal, stockItems]);

  if (!isOpen) return null;

  const isMaintenance = MAINTENANCE_TYPES.includes(tipo);

  const handleClose = () => {
    setTipo(""); setValor(""); setSearchTerm(""); setSelectedItems([]); setCustomItems([]);
    setSaving(false); setError(null); setTyreMismatch(null);
    setShowCustomForm(false); setCustomNome(""); setCustomCategoria("outros"); setCustomQty(1);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      vehicleId,
      tipo,
      valor,
      data: fd.get("data"),
      descricao: fd.get("descricao") || undefined,
      kms: fd.get("kms") || undefined,
      oficina: fd.get("oficina") || undefined,
      materiaisUsados: [...selectedItems, ...customItems],
    };
    setSaving(true);
    setError(null);
    try {
      await onSave(data);
      handleClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  // ── Stock search ──────────────────────────────────────────────────────────

  const filteredStock = stockItems.filter(
    (item) =>
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const doAddStockItem = (item) => {
    if (!selectedItems.find((i) => i._id === item._id)) {
      setSelectedItems((prev) => [
        ...prev,
        { _id: item._id, nome: item.nome, categoria: item.categoria, quantidade: 1 },
      ]);
    }
    setSearchTerm("");
  };

  const addStockItem = (item) => {
    if (item.categoria === "pneus" && vehicleTyreSize) {
      const itemSize = extractTyreSize(item.nome);
      if (itemSize && !sizesMatch(vehicleTyreSize, itemSize)) {
        setTyreMismatch({ item, vehicleSize: vehicleTyreSize, itemSize });
        return;
      }
    }
    doAddStockItem(item);
  };

  const updateStockQty = (id, qty) => {
    if (qty <= 0) setSelectedItems((prev) => prev.filter((i) => i._id !== id));
    else setSelectedItems((prev) => prev.map((i) => (i._id === id ? { ...i, quantidade: qty } : i)));
  };

  // ── Custom items ──────────────────────────────────────────────────────────

  const addCustomItem = () => {
    if (!customNome.trim()) return;
    setCustomItems((prev) => [
      ...prev,
      { _isCustom: true, nome: customNome.trim(), categoria: customCategoria, quantidade: Number(customQty) || 1 },
    ]);
    setCustomNome(""); setCustomCategoria("outros"); setCustomQty(1);
    setShowCustomForm(false);
  };

  const updateCustomQty = (idx, qty) => {
    if (qty <= 0) setCustomItems((prev) => prev.filter((_, i) => i !== idx));
    else setCustomItems((prev) => prev.map((item, i) => (i === idx ? { ...item, quantidade: qty } : item)));
  };

  const totalItems = selectedItems.length + customItems.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Registar Nova Despesa</h3>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 py-5 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Despesa</label>
              <select name="tipo" required value={tipo} onChange={(e) => setTipo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                <option value="">Selecione o tipo</option>
                <option value="manutencao">Manutenção</option>
                <option value="reparacao">Reparação</option>
                <option value="combustivel">Combustível</option>
                <option value="portagem">Portagem</option>
                <option value="seguro">Seguro</option>
                <option value="inspecao">Inspeção</option>
                <option value="multa">Multa</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Valor (€)</label>
                  {stockTotal > 0 && (
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                      Auto: €{stockTotal.toFixed(2)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  name="valor"
                  placeholder="Ex: 250.00"
                  step="0.01"
                  min="0"
                  required
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input type="date" name="data" required defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>

            {isMaintenance && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">KMs no momento</label>
                  <input type="number" name="kms" placeholder="Ex: 85000" min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Oficina</label>
                  <input type="text" name="oficina" placeholder="Nome da oficina"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea name="descricao" placeholder="Descrição da despesa ou manutenção" rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            </div>

            {/* ── Materials section (maintenance only) ───────────────────── */}
            {isMaintenance && (
              <div className="border-t border-gray-200 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Materiais Utilizados{totalItems > 0 && <span className="text-blue-600 ml-1">({totalItems})</span>}
                  </h4>
                  {vehicleTyreSize && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Pneu viatura: <strong>{vehicleTyreSize}</strong>
                    </span>
                  )}
                </div>

                {/* Stock search */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Do Stock</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Pesquisar por nome ou categoria…" value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setTyreMismatch(null); }}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>

                  {searchTerm && (
                    <div className="mt-1 max-h-52 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                      {filteredStock.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {filteredStock.map((item) => {
                            const isTyre = item.categoria === "pneus";
                            const itemSize = isTyre ? extractTyreSize(item.nome) : null;
                            const mismatch = isTyre && vehicleTyreSize && itemSize &&
                              !sizesMatch(vehicleTyreSize, itemSize);

                            return (
                              <button key={item._id} type="button" onClick={() => addStockItem(item)}
                                className={`w-full px-4 py-3 transition-colors text-left flex items-center justify-between group ${
                                  mismatch ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-blue-50"
                                }`}>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                                  <p className="text-xs text-gray-500 capitalize mt-0.5">
                                    {item.categoria} · Disponível: {item.quantidade}
                                    {itemSize && <span className="ml-1 font-medium">· {itemSize}</span>}
                                  </p>
                                  {mismatch && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                                      <AlertTriangle className="w-3 h-3" />
                                      Dimensão diferente da viatura ({vehicleTyreSize})
                                    </p>
                                  )}
                                </div>
                                <Plus className={`w-4 h-4 flex-shrink-0 ml-3 ${mismatch ? "text-amber-500" : "text-blue-600"}`} />
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-400 text-center">Nenhum item encontrado no stock</p>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Tyre mismatch warning ────────────────────────────────── */}
                {tyreMismatch && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900">Dimensão diferente</p>
                        <p className="text-sm text-amber-800 mt-1">
                          O pneu selecionado tem dimensão{" "}
                          <strong>{tyreMismatch.itemSize}</strong>, mas a viatura usa{" "}
                          <strong>{tyreMismatch.vehicleSize}</strong>.
                        </p>
                        <p className="text-sm text-amber-700 mt-1">Deseja adicionar mesmo assim?</p>
                        <div className="flex gap-2 mt-3">
                          <button type="button" onClick={() => setTyreMismatch(null)}
                            className="px-3 py-1.5 text-sm font-medium text-amber-700 border border-amber-300 hover:bg-amber-100 rounded-lg transition-colors">
                            Cancelar
                          </button>
                          <button type="button"
                            onClick={() => { doAddStockItem(tyreMismatch.item); setTyreMismatch(null); }}
                            className="px-3 py-1.5 text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors">
                            Adicionar mesmo assim
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected stock items */}
                {selectedItems.map((item) => {
                  const full = stockItems.find((s) => s._id === item._id);
                  const lineTotal = full?.preco ? full.preco * item.quantidade : null;
                  return (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.nome}</p>
                      <p className="text-xs text-blue-600 capitalize">
                        {item.categoria}
                        {lineTotal != null && (
                          <span className="ml-1 text-green-700 font-semibold">
                            · €{full.preco.toFixed(2)}/un = €{lineTotal.toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => updateStockQty(item._id, item.quantidade - 1)}
                        className="p-1 text-gray-600 hover:bg-white rounded transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-center">{item.quantidade}</span>
                      <button type="button" onClick={() => updateStockQty(item._id, item.quantidade + 1)}
                        className="p-1 text-gray-600 hover:bg-white rounded transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => updateStockQty(item._id, 0)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors ml-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  );
                })}

                {/* Custom (off-stock) items */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Externo ao Stock</label>

                  {customItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.nome}</p>
                        <p className="text-xs text-orange-600 flex items-center gap-1">
                          <PackagePlus className="w-3 h-3" />
                          Novo no stock · <span className="capitalize">{item.categoria}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => updateCustomQty(idx, item.quantidade - 1)}
                          className="p-1 text-gray-600 hover:bg-white rounded transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-center">{item.quantidade}</span>
                        <button type="button" onClick={() => updateCustomQty(idx, item.quantidade + 1)}
                          className="p-1 text-gray-600 hover:bg-white rounded transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => updateCustomQty(idx, 0)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors ml-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {showCustomForm ? (
                    <div className="p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 space-y-3">
                      <input type="text" value={customNome} onChange={(e) => setCustomNome(e.target.value)}
                        placeholder="Nome do item (ex: Pneu Pirelli 205/55R16)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                      <div className="grid grid-cols-2 gap-3">
                        <select value={customCategoria} onChange={(e) => setCustomCategoria(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                          {CATEGORIAS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 whitespace-nowrap">Qtd:</label>
                          <input type="number" value={customQty} min="1" onChange={(e) => setCustomQty(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={addCustomItem}
                          className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
                          Adicionar
                        </button>
                        <button type="button" onClick={() => setShowCustomForm(false)}
                          className="px-3 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowCustomForm(true)}
                      className="w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                      <PackagePlus className="w-4 h-4" />
                      Adicionar item externo ao stock
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button type="button" onClick={handleClose}
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-60">
              {saving ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
