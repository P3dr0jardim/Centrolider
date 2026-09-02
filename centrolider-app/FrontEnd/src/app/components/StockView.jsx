import {
  Package, AlertTriangle, TrendingDown, ShoppingCart,
  Plus, Search, Pencil, Trash2, History, BarChart2, ArrowLeft, Paperclip,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { api } from "../../services/api";
import { AddStockModal } from "./AddStockModal";
import { VehicleDetailView } from "./VehicleDetailView";

const CATEGORIAS = [
  { value: "pneus",    label: "Pneus" },
  { value: "filtros",  label: "Filtros" },
  { value: "oleo",     label: "Óleo" },
  { value: "travoes",  label: "Travões" },
  { value: "baterias", label: "Baterias" },
  { value: "lampadas", label: "Lâmpadas" },
  { value: "outros",   label: "Outros" },
];

const CAT_LABEL = Object.fromEntries(CATEGORIAS.map((c) => [c.value, c.label]));

const fmtEuro = (v) => `€${Number(v).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("pt-PT") : "—");

export function StockView() {
  const [stockItems, setStockItems] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mainTab, setMainTab] = useState("inventario");   // "inventario" | "historico"
  const [fleetTab, setFleetTab] = useState("global");      // "global" | fleet _id
  const [inventoryTab, setInventoryTab] = useState("todos");
  const [tyreSizeFilter, setTyreSizeFilter] = useState("todos");
  const [historyTab, setHistoryTab] = useState("pneus");
  const [vehicleDetail, setVehicleDetail] = useState(null);   // vehicle object to drill into
  const [vehicleDetailLoading, setVehicleDetailLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = create, item = edit

  const fleetName = useMemo(() => {
    const map = Object.fromEntries(fleets.map((f) => [String(f._id), f.name]));
    return (id) => map[String(id)] || "—";
  }, [fleets]);

  const load = () => {
    setLoading(true);
    Promise.all([api.getStock(), api.getFleets()])
      .then(([items, fleetList]) => { setStockItems(items); setFleets(fleetList); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ── KPI stats ──────────────────────────────────────────────────────
  const totalItems = stockItems.length;
  const lowStockCount = stockItems.filter((i) => i.quantidade <= i.minimo).length;
  const totalValue = stockItems.reduce((s, i) => s + (i.quantidade * (i.preco || 0)), 0);
  const categoryCount = new Set(stockItems.map((i) => i.categoria)).size;

  // ── Chart data ─────────────────────────────────────────────────────
  const chartData = useMemo(() =>
    CATEGORIAS
      .map((cat) => {
        const items = stockItems.filter((i) => i.categoria === cat.value);
        const quantidade = items.reduce((s, i) => s + i.quantidade, 0);
        const minimo = items.reduce((s, i) => s + i.minimo, 0);
        return { category: cat.label, quantidade, minimo };
      })
      .filter((d) => d.quantidade > 0 || d.minimo > 0),
    [stockItems]
  );

  // ── Items scoped to the selected fleet tab ("global" = no fleet filter) ──
  const fleetScopedItems = useMemo(() =>
    fleetTab === "global"
      ? stockItems
      : stockItems.filter((item) => (item.frotaIds || []).some((id) => String(id) === fleetTab)),
    [stockItems, fleetTab]
  );

  // ── Count per fleet tab (how many items each fleet has) ─────────────
  const countByFleet = useMemo(() => {
    const map = { global: stockItems.length };
    for (const f of fleets) {
      map[f._id] = stockItems.filter((i) => (i.frotaIds || []).some((id) => String(id) === String(f._id))).length;
    }
    return map;
  }, [stockItems, fleets]);

  // ── Distinct tyre sizes available within the current fleet scope ────
  const tyreSizes = useMemo(() =>
    [...new Set(
      fleetScopedItems
        .filter((i) => i.categoria === "pneus" && i.tamanhoPneu)
        .map((i) => i.tamanhoPneu)
    )].sort(),
    [fleetScopedItems]
  );

  // ── Filtered inventory ─────────────────────────────────────────────
  const filteredItems = useMemo(() =>
    fleetScopedItems.filter((item) => {
      const matchSearch =
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (CAT_LABEL[item.categoria] || item.categoria).toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = inventoryTab === "todos" || item.categoria === inventoryTab;
      const matchSize =
        inventoryTab !== "pneus" || tyreSizeFilter === "todos" || item.tamanhoPneu === tyreSizeFilter;
      return matchSearch && matchCat && matchSize;
    }),
    [fleetScopedItems, searchTerm, inventoryTab, tyreSizeFilter]
  );

  // ── Count per category for inventory tabs (within the selected fleet) ───
  const countByCategory = useMemo(() => {
    const map = { todos: fleetScopedItems.length };
    for (const cat of CATEGORIAS) {
      map[cat.value] = fleetScopedItems.filter((i) => i.categoria === cat.value).length;
    }
    return map;
  }, [fleetScopedItems]);

  // ── History: flatten all historico entries per category ────────────
  const historyByCategory = useMemo(() => {
    const all = stockItems.flatMap((item) =>
      (item.historico || []).map((h) => ({
        ...h,
        itemNome: item.nome,
        itemCategoria: item.categoria,
        itemId: item._id,
      }))
    );
    const map = {};
    for (const cat of CATEGORIAS) {
      map[cat.value] = all
        .filter((h) => h.itemCategoria === cat.value)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
    }
    return map;
  }, [stockItems]);

  // ── Handlers ───────────────────────────────────────────────────────
  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setModalOpen(true); };

  const handleSave = async (data) => {
    const { attachmentFile, ...fields } = data;
    let saved;
    if (editItem) {
      saved = await api.updateStockItem(editItem._id, fields);
    } else {
      saved = await api.createStockItem(fields);
    }
    if (attachmentFile) {
      const fd = new FormData();
      fd.append("file", attachmentFile);
      saved = await api.addStockAttachment(saved._id, fd);
    }
    setStockItems((prev) =>
      editItem
        ? prev.map((i) => (i._id === saved._id ? saved : i))
        : [...prev, saved]
    );
    setModalOpen(false);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Eliminar "${item.nome}"?`)) return;
    await api.deleteStockItem(item._id);
    setStockItems((prev) => prev.filter((i) => i._id !== item._id));
  };

  const openVehicleDetail = async (vehicleId) => {
    if (!vehicleId) return;
    setVehicleDetailLoading(true);
    try {
      const v = await api.getVehicle(vehicleId);
      setVehicleDetail(v);
    } catch {
      // vehicle not found — ignore
    } finally {
      setVehicleDetailLoading(false);
    }
  };

  if (vehicleDetail) {
    return (
      <VehicleDetailView
        vehicle={vehicleDetail}
        onBack={() => setVehicleDetail(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestão de Stock</h2>
          <p className="text-gray-600 mt-1">Inventário completo de peças e componentes</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Adicionar Item
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Package className="w-6 h-6 text-blue-600" />} bg="bg-blue-100"
          label="Itens em Stock" value={totalItems} />
        <KpiCard icon={<AlertTriangle className="w-6 h-6 text-red-600" />} bg="bg-red-100"
          label="Stock Baixo" value={lowStockCount} warn={lowStockCount > 0} />
        <KpiCard icon={<TrendingDown className="w-6 h-6 text-green-600" />} bg="bg-green-100"
          label="Valor Total" value={fmtEuro(totalValue)} />
        <KpiCard icon={<ShoppingCart className="w-6 h-6 text-purple-600" />} bg="bg-purple-100"
          label="Categorias" value={categoryCount} />
      </div>

      {/* Main tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            {[
              { id: "inventario", label: "Inventário", icon: <BarChart2 className="w-4 h-4" /> },
              { id: "historico",  label: "Histórico de Uso", icon: <History className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors text-sm ${
                  mainTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Inventário tab ─────────────────────────────────────────── */}
        {mainTab === "inventario" && (
          <div>
            {/* Fleet sub-tabs */}
            <div className="border-b border-gray-100 px-6 overflow-x-auto bg-gray-50/50">
              <div className="flex gap-1 py-2 min-w-max">
                {[{ _id: "global", name: "Global" }, ...fleets].map((f) => {
                  const count = countByFleet[f._id] || 0;
                  const active = fleetTab === f._id;
                  return (
                    <button
                      key={f._id}
                      onClick={() => setFleetTab(f._id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${
                        active
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
                      }`}
                    >
                      {f.name}
                      {count > 0 && (
                        <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                          active ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category sub-tabs */}
            <div className="border-b border-gray-100 px-6 overflow-x-auto">
              <div className="flex gap-1 py-2 min-w-max">
                {[{ value: "todos", label: "Todos" }, ...CATEGORIAS].map((cat) => {
                  const count = countByCategory[cat.value] || 0;
                  const active = inventoryTab === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => { setInventoryTab(cat.value); setTyreSizeFilter("todos"); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {cat.label}
                      {count > 0 && (
                        <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                          active ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search bar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm text-gray-500">{filteredItems.length} itens</span>
              <div className="flex items-center gap-2">
                {inventoryTab === "pneus" && tyreSizes.length > 0 && (
                  <select
                    value={tyreSizeFilter}
                    onChange={(e) => setTyreSizeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="todos">Todos os tamanhos</option>
                    {tyreSizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar itens…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Categoria</th>
                    <th className="px-6 py-3 text-left">Nome</th>
                    <th className="px-6 py-3 text-left">Frota</th>
                    <th className="px-6 py-3 text-center">Qtd</th>
                    <th className="px-6 py-3 text-center">Mínimo</th>
                    <th className="px-6 py-3 text-left">Fornecedor</th>
                    <th className="px-6 py-3 text-right">Preço Unit.</th>
                    <th className="px-6 py-3 text-center">Estado</th>
                    <th className="px-6 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-400 text-sm">
                        Nenhum item encontrado.
                      </td>
                    </tr>
                  )}
                  {filteredItems.map((item) => {
                    const isLow = item.quantidade <= item.minimo;
                    const pct = item.minimo > 0 ? (item.quantidade / item.minimo) * 100 : 200;
                    return (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                            {CAT_LABEL[item.categoria] || item.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800">
                          <div>{item.nome}</div>
                          {(item.numeroFatura || item.attachments?.length > 0) && (
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.numeroFatura && (
                                <span className="text-xs text-gray-400">Fatura: {item.numeroFatura}</span>
                              )}
                              {item.attachments?.length > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-xs text-blue-500">
                                  <Paperclip className="w-3 h-3" /> {item.attachments.length}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-500">
                          {(item.frotaIds || []).map((id) => fleetName(id)).join(", ") || "—"}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`text-sm font-semibold ${isLow ? "text-red-600" : "text-gray-900"}`}>
                            {item.quantidade}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center text-sm text-gray-600">{item.minimo}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{item.fornecedor || "—"}</td>
                        <td className="px-6 py-3 text-right text-sm text-gray-700">
                          {item.preco ? fmtEuro(item.preco) : "—"}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {isLow ? (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Baixo
                            </span>
                          ) : pct < 150 ? (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">Normal</span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Bom</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="px-6 py-6 border-t border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Stock por Categoria</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="quantidade" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Quantidade" />
                    <Bar dataKey="minimo" fill="#fca5a5" radius={[6, 6, 0, 0]} name="Mínimo" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-3">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded" /><span className="text-xs text-gray-600">Quantidade Atual</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-300 rounded" /><span className="text-xs text-gray-600">Stock Mínimo</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Histórico tab ──────────────────────────────────────────── */}
        {mainTab === "historico" && (
          <div>
            {/* Category sub-tabs */}
            <div className="border-b border-gray-100 px-6 overflow-x-auto">
              <div className="flex gap-1 py-2 min-w-max">
                {CATEGORIAS.map((cat) => {
                  const count = historyByCategory[cat.value]?.length || 0;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setHistoryTab(cat.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        historyTab === cat.value
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {cat.label}
                      {count > 0 && (
                        <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                          historyTab === cat.value ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Item</th>
                    <th className="px-6 py-3 text-left">Viatura</th>
                    <th className="px-6 py-3 text-center">Qtd Usada</th>
                    <th className="px-6 py-3 text-left">Data</th>
                    <th className="px-6 py-3 text-left">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(historyByCategory[historyTab] || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                        Sem histórico de utilização para esta categoria.
                      </td>
                    </tr>
                  ) : (
                    (historyByCategory[historyTab] || []).map((h, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{h.itemNome}</td>
                        <td className="px-6 py-3">
                          <button
                            type="button"
                            onClick={() => openVehicleDetail(h.vehicleId)}
                            disabled={!h.vehicleId || vehicleDetailLoading}
                            className="text-left group disabled:cursor-default"
                          >
                            <p className="text-sm font-semibold text-blue-600 group-hover:underline group-hover:text-blue-800 transition-colors">
                              {h.matricula || "—"}
                            </p>
                            <p className="text-xs text-gray-500">{h.modelo || ""}</p>
                          </button>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                            {h.quantidade} un.
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{fmtDate(h.data)}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{h.descricao || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AddStockModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        item={editItem}
        existingItems={stockItems}
        fleets={fleets}
      />
    </div>
  );
}

function KpiCard({ icon, bg, label, value, warn }) {
  return (
    <div className={`bg-white rounded-xl border ${warn ? "border-red-200" : "border-gray-200"} p-5`}>
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${warn ? "text-red-600" : "text-gray-900"}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
