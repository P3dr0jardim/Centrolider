import { Package, AlertTriangle, TrendingDown, ShoppingCart, Plus, Search } from "lucide-react";
import { useState } from "react";
import { StatCard } from "./StatCard";
import { AddStockModal } from "./AddStockModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const categoryData = [
  { category: "Pneus", quantidade: 156, minimo: 120 },
  { category: "Filtros", quantidade: 89, minimo: 80 },
  { category: "Óleo", quantidade: 234, minimo: 200 },
  { category: "Travões", quantidade: 45, minimo: 60 },
  { category: "Baterias", quantidade: 28, minimo: 40 },
  { category: "Lâmpadas", quantidade: 178, minimo: 150 },
];

// Tabela completa de inventário
const inventoryItems = [
  { id: "STK-001", categoria: "Pneus", nome: "Pneu 205/55 R16 Michelin", quantidade: 48, minimo: 30, fornecedor: "Pneus Express", preco: 85.5 },
  { id: "STK-002", categoria: "Pneus", nome: "Pneu 215/60 R17 Continental", quantidade: 35, minimo: 25, fornecedor: "Pneus Express", preco: 95.0 },
  { id: "STK-003", categoria: "Pneus", nome: "Pneu 195/65 R15 Bridgestone", quantidade: 52, minimo: 30, fornecedor: "Pneus Express", preco: 75.8 },
  { id: "STK-004", categoria: "Filtros", nome: "Filtro de Óleo Mann W811/80", quantidade: 68, minimo: 40, fornecedor: "AutoPeças SA", preco: 8.5 },
  { id: "STK-005", categoria: "Filtros", nome: "Filtro de Ar K&N 33-2070", quantidade: 42, minimo: 35, fornecedor: "AutoPeças SA", preco: 18.5 },
  { id: "STK-006", categoria: "Óleo", nome: "Óleo Motor 5W30 Castrol - 5L", quantidade: 125, minimo: 80, fornecedor: "Lubrificantes Lda", preco: 32.9 },
  { id: "STK-007", categoria: "Óleo", nome: "Óleo Motor 10W40 Mobil - 5L", quantidade: 98, minimo: 60, fornecedor: "Lubrificantes Lda", preco: 28.5 },
  { id: "STK-008", categoria: "Travões", nome: "Pastilhas de Travão - Dianteiras", quantidade: 25, minimo: 30, fornecedor: "AutoPeças SA", preco: 52.9 },
  { id: "STK-009", categoria: "Travões", nome: "Pastilhas de Travão - Traseiras", quantidade: 12, minimo: 30, fornecedor: "AutoPeças SA", preco: 45.9 },
  { id: "STK-010", categoria: "Travões", nome: "Discos de Travão - Dianteiros", quantidade: 18, minimo: 20, fornecedor: "AutoPeças SA", preco: 78.5 },
  { id: "STK-011", categoria: "Baterias", nome: "Bateria 12V 80Ah Varta", quantidade: 8, minimo: 15, fornecedor: "BatteryPro", preco: 128.5 },
  { id: "STK-012", categoria: "Baterias", nome: "Bateria 12V 100Ah Bosch", quantidade: 12, minimo: 15, fornecedor: "BatteryPro", preco: 158.0 },
  { id: "STK-013", categoria: "Lâmpadas", nome: "Lâmpada H7 Philips", quantidade: 95, minimo: 60, fornecedor: "AutoPeças SA", preco: 5.8 },
  { id: "STK-014", categoria: "Lâmpadas", nome: "Lâmpada H4 Osram", quantidade: 82, minimo: 50, fornecedor: "AutoPeças SA", preco: 6.2 },
  { id: "STK-015", categoria: "Filtros", nome: "Filtro de Combustível Bosch", quantidade: 18, minimo: 40, fornecedor: "AutoPeças SA", preco: 12.5 },
];

const lowStockItems = inventoryItems.filter(item => item.quantidade < item.minimo);

export function StockView() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSaveStock = (data) => {
    console.log("Novo item de stock:", data);
    // Aqui implementaria a lógica para salvar o novo item
  };

  // Filtrar itens baseado na pesquisa
  const filteredItems = inventoryItems.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestão de Stock</h2>
          <p className="text-gray-600 mt-1">
            Inventário completo de peças e componentes
          </p>
        </div>
        <button
          onClick={() => setIsAddStockModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Adicionar Stock
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Itens em Stock"
          value={inventoryItems.length.toString()}
          change="+12 esta semana"
          changeType="positive"
          icon={Package}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Alertas de Stock Baixo"
          value={lowStockItems.length.toString()}
          change="Requer atenção"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="bg-red-100 text-red-600"
        />
        <StatCard
          title="Valor em Stock"
          value="€42.350"
          change="Total inventário"
          changeType="neutral"
          icon={TrendingDown}
          iconColor="bg-green-100 text-green-600"
        />
        <StatCard
          title="Categorias"
          value="6"
          change="Bem organizado"
          changeType="neutral"
          icon={ShoppingCart}
          iconColor="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Tabela de Inventário Completo */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Inventário Completo
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nome do Item
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Mínimo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Preço Unit.
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const isLowStock = item.quantidade < item.minimo;
                const stockPercentage = (item.quantidade / item.minimo) * 100;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-semibold ${
                        isLowStock ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.quantidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                      {item.minimo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.fornecedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                      €{item.preco.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {isLowStock ? (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Baixo
                        </span>
                      ) : stockPercentage < 150 ? (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                          Normal
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Bom
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock by Category Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Stock por Categoria
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="category" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="quantidade" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Quantidade Atual" />
            <Bar dataKey="minimo" fill="#ef4444" radius={[8, 8, 0, 0]} name="Stock Mínimo" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Quantidade Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Stock Mínimo</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Alertas de Stock Baixo
            </h3>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
              {lowStockItems.length} itens
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
                        {item.quantidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                      {item.minimo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.fornecedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Encomendar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onSave={handleSaveStock}
      />
    </div>
  );
}
