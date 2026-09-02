import { X, AlertTriangle, ChevronDown, Paperclip, FileText, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { openStockAttachment } from "../utils/openAttachment";
import { api } from "../../services/api";

const CATEGORIAS = [
  { value: "pneus",    label: "Pneus" },
  { value: "filtros",  label: "Filtros" },
  { value: "oleo",     label: "Óleo" },
  { value: "travoes",  label: "Travões" },
  { value: "baterias", label: "Baterias" },
  { value: "lampadas", label: "Lâmpadas" },
  { value: "outros",   label: "Outros" },
];

export function AddStockModal({ isOpen, onClose, onSave, item, existingItems = [], fleets = [] }) {
  const [categoria, setCategoria] = useState("");
  const [nome, setNome]           = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [minimo, setMinimo]       = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [preco, setPreco]         = useState("");
  const [tamanhoPneu, setTamanhoPneu] = useState("");
  const [frotaIds, setFrotaIds]   = useState([]);
  const [numeroFatura, setNumeroFatura] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [deletingAttId, setDeletingAttId] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [showSugg, setShowSugg]   = useState(false);

  const suggRef = useRef(null);
  const isEdit  = !!item;

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false); setError(null); setShowSugg(false);
    setAttachmentFile(null);
    if (isEdit) {
      setCategoria(item.categoria || "");
      setNome(item.nome || "");
      setQuantidade(item.quantidade ?? "");
      setMinimo(item.minimo ?? "");
      setFornecedor(item.fornecedor || "");
      setPreco(item.preco ?? "");
      setTamanhoPneu(item.tamanhoPneu || "");
      setFrotaIds((item.frotaIds || []).map(String));
      setNumeroFatura(item.numeroFatura || "");
      setAttachments(item.attachments || []);
    } else {
      setCategoria(""); setNome(""); setQuantidade(""); setMinimo("");
      setFornecedor(""); setPreco(""); setNumeroFatura(""); setTamanhoPneu("");
      setAttachments([]);
      setFrotaIds(fleets.length === 1 ? [String(fleets[0]._id)] : []);
    }
  }, [isOpen, item, fleets]);

  const toggleFrota = (id) => {
    setFrotaIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (suggRef.current && !suggRef.current.contains(e.target)) setShowSugg(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter suggestions — exclude current item if editing
  const suggestions = useMemo(() => {
    const q = nome.trim().toLowerCase();
    if (!q) return [];
    return existingItems
      .filter((i) => (!isEdit || i._id !== item._id) && i.nome.toLowerCase().includes(q))
      .slice(0, 8);
  }, [nome, existingItems, isEdit, item]);

  // Exact duplicate check (case-insensitive)
  const isDuplicate = useMemo(() => {
    if (!nome.trim()) return false;
    const q = nome.trim().toLowerCase();
    return existingItems.some(
      (i) => i.nome.toLowerCase() === q && (!isEdit || i._id !== item?._id)
    );
  }, [nome, existingItems, isEdit, item]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (frotaIds.length === 0) {
      setError("Selecione pelo menos uma frota.");
      return;
    }
    setSaving(true); setError(null);
    try {
      await onSave({
        categoria,
        nome,
        quantidade: Number(quantidade),
        minimo:     Number(minimo),
        fornecedor: fornecedor || undefined,
        preco:      preco !== "" ? Number(preco) : undefined,
        frotaIds,
        numeroFatura: numeroFatura || undefined,
        tamanhoPneu: categoria === "pneus" ? (tamanhoPneu || undefined) : undefined,
        attachmentFile: attachmentFile || undefined,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleDeleteAttachment = async (attId) => {
    if (!item || !window.confirm("Eliminar este anexo?")) return;
    setDeletingAttId(attId);
    try {
      const updated = await api.deleteStockAttachment(item._id, attId);
      setAttachments(updated.attachments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingAttId(null);
    }
  };

  const pickSuggestion = (s) => {
    setNome(s.nome);
    setCategoria(s.categoria || categoria);
    setFornecedor(s.fornecedor || fornecedor);
    setPreco(s.preco != null ? String(s.preco) : preco);
    setMinimo(s.minimo != null ? String(s.minimo) : minimo);
    setTamanhoPneu(s.tamanhoPneu || tamanhoPneu);
    setShowSugg(false);
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

            {categoria === "pneus" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho do Pneu</label>
                <input type="text" value={tamanhoPneu} onChange={(e) => setTamanhoPneu(e.target.value)}
                  placeholder="Ex: 205/55 R16"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frota{fleets.length > 1 ? "s" : ""} * {fleets.length > 1 && <span className="font-normal text-gray-400">(selecione uma ou mais — item partilhado entre as selecionadas)</span>}
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {fleets.length === 0 && (
                  <span className="text-sm text-gray-400">Sem frotas disponíveis</span>
                )}
                {fleets.map((f) => {
                  const id = String(f._id);
                  const active = frotaIds.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleFrota(id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
                      }`}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nome — with suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Item *</label>
              <div className="relative" ref={suggRef}>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => { setNome(e.target.value); setShowSugg(true); }}
                  onFocus={() => nome.trim() && setShowSugg(true)}
                  placeholder="Ex: Pneu 205/55 R16 Michelin"
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                    isDuplicate
                      ? "border-amber-400 focus:ring-amber-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />

                {/* Suggestion dropdown */}
                {showSugg && suggestions.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <p className="px-3 py-1.5 text-xs text-gray-400 font-medium bg-gray-50 border-b border-gray-100">
                      Produtos existentes
                    </p>
                    <div className="max-h-44 overflow-y-auto divide-y divide-gray-100">
                      {suggestions.map((s) => (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => pickSuggestion(s)}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 text-left transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{s.nome}</p>
                            <p className="text-xs text-gray-400 capitalize">{s.categoria} · {s.quantidade} un.</p>
                          </div>
                          {s.preco != null && (
                            <span className="text-xs text-green-700 font-semibold ml-2 flex-shrink-0">
                              €{s.preco.toFixed(2)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Duplicate warning */}
              {isDuplicate && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>Já existe um produto com este nome no stock.</span>
                </div>
              )}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número da Fatura</label>
              <input type="text" value={numeroFatura} onChange={(e) => setNumeroFatura(e.target.value)}
                placeholder="Ex: FT 2026/1234"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anexar Fatura (opcional)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors flex-1 min-w-0">
                  <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500 truncate">
                    {attachmentFile ? attachmentFile.name : "Selecionar ficheiro…"}
                  </span>
                  <input type="file" className="hidden" onChange={(e) => setAttachmentFile(e.target.files[0] || null)} />
                </label>
                {attachmentFile && (
                  <button type="button" onClick={() => setAttachmentFile(null)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {attachments.map((att) => (
                    <div key={att._id} className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <button type="button" onClick={() => openStockAttachment(item._id, att)}
                        className="flex items-center gap-2 min-w-0 text-left hover:text-blue-600 transition-colors">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{att.originalName || att.filename}</span>
                      </button>
                      <button type="button" onClick={() => handleDeleteAttachment(att._id)} disabled={deletingAttId === att._id}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving || isDuplicate}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {saving ? "A guardar…" : isEdit ? "Guardar Alterações" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
