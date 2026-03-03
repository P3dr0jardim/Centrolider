import { 
  ArrowLeft, 
  Edit, 
  Plus,
  TrendingUp,
  User,
  Phone,
  Gauge,
  Euro,
  Wrench,
  Calendar,
  MoreVertical,
  Package
} from "lucide-react";
import { useState } from "react";
import { AddExpenseStockModal } from "./AddExpenseStockModal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data - Evolução de lucro dos últimos 6 meses
const profitData = [
  { mes: "Set", lucro: 1200 },
  { mes: "Out", lucro: 1450 },
  { mes: "Nov", lucro: 980 },
  { mes: "Dez", lucro: 1680 },
  { mes: "Jan", lucro: 1920 },
  { mes: "Fev", lucro: 2100 },
];

// Mock data - Transações financeiras
const transactions = [
  { id: 1, data: "2026-02-25", tipo: "Receita", categoria: "Aluguer", valor: 450.00 },
  { id: 2, data: "2026-02-24", tipo: "Despesa", categoria: "Combustível", valor: -85.50 },
  { id: 3, data: "2026-02-22", tipo: "Receita", categoria: "Serviço", valor: 380.00 },
  { id: 4, data: "2026-02-20", tipo: "Despesa", categoria: "Portagens", valor: -12.30 },
  { id: 5, data: "2026-02-18", tipo: "Despesa", categoria: "Manutenção", valor: -250.00 },
  { id: 6, data: "2026-02-15", tipo: "Receita", categoria: "Aluguer", valor: 520.00 },
  { id: 7, data: "2026-02-12", tipo: "Despesa", categoria: "Combustível", valor: -92.40 },
  { id: 8, data: "2026-02-08", tipo: "Despesa", categoria: "Seguro", valor: -180.00 },
];

// Mock data - Histórico de manutenção
const maintenanceHistory = [
  {
    id: 1,
    data: "2026-02-18",
    descricao: "Substituição de pastilhas de travão dianteiras",
    oficina: "AutoReparos Lda",
    custo: 250.00,
    materiaisUsados: ["4x Pastilhas Travão", "1x Óleo Travões"]
  },
  {
    id: 2,
    data: "2026-01-15",
    descricao: "Mudança de óleo e filtros",
    oficina: "Serviço Rápido",
    custo: 85.00,
    materiaisUsados: ["1x Óleo Motor 5W30 - 5L", "1x Filtro Óleo", "1x Filtro Ar"]
  },
  {
    id: 3,
    data: "2025-12-10",
    descricao: "Substituição de pneus",
    oficina: "Pneus Express",
    custo: 340.00,
    materiaisUsados: ["4x Pneu 205/55 R16"]
  },
];

export function VehicleDetailView({ vehicleId, matricula, onBack }) {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const handleSaveExpense = (data) => {
    console.log("Nova despesa/manutenção:", data);
  };

  // Mock vehicle data
  const vehicle = {
    matricula: matricula,
    estado: "Ativo",
    condutor: "João Silva",
    telefone: "+351 912 345 678",
    km: 45320,
    rentabilidade: 3250.00,
    custoManutencao: 1890.00,
    marca: "Mercedes-Benz",
    modelo: "Sprinter 316 CDI",
    ano: 2022,
    numeroQuadro: "WDB9066331N123456",
    cor: "Branco",
    combustivel: "Diesel",
    cilindrada: "2143 cc",
    potencia: "163 CV",
    dataEntrega: "2022-03-15",
    intervaloRevisao: 10000,
    tipoPneu: "225/75 R16",
    pneuOriginal: "225/75 R16 116R Continental VanContact",
    pneuAtual: "225/75 R16 116R Michelin Agilis"
  };

  const totalReceitas = transactions.filter(t => t.tipo === "Receita").reduce((sum, t) => sum + t.valor, 0);
  const totalDespesas = Math.abs(transactions.filter(t => t.tipo === "Despesa").reduce((sum, t) => sum + t.valor, 0));
  const saldoLiquido = totalReceitas - totalDespesas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Voltar à Frota</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{vehicle.matricula}</h1>
              <p className="text-gray-600 mt-1">{vehicle.marca} {vehicle.modelo}</p>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-full">
              {vehicle.estado}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700">
              <Edit className="w-4 h-4" />
              Editar Dados
            </button>
            <button className="px-4 py-2.5 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2 font-medium">
              <Plus className="w-4 h-4" />
              Adicionar Ganho
            </button>
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Wrench className="w-4 h-4" />
              Registar Despesa / Manutenção
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Condutor Atual */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Condutor Atual</p>
              <p className="text-lg font-semibold text-gray-900">{vehicle.condutor}</p>
            </div>
          </div>
          <a href={`tel:${vehicle.telefone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
            <Phone className="w-4 h-4" />
            {vehicle.telefone}
          </a>
        </div>

        {/* Quilometragem */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Gauge className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quilometragem</p>
              <p className="text-2xl font-bold text-gray-900">{vehicle.km.toLocaleString()} km</p>
            </div>
          </div>
        </div>

        {/* Rentabilidade Líquida */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rentabilidade Líquida</p>
              <p className="text-2xl font-bold text-green-600">€{vehicle.rentabilidade.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Custo Total Manutenção */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Euro className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Custo Total Manutenção</p>
              <p className="text-2xl font-bold text-gray-900">€{vehicle.custoManutencao.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab("visao-geral")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === "visao-geral"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab("historico-financeiro")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === "historico-financeiro"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Histórico Financeiro
            </button>
            <button
              onClick={() => setActiveTab("manutencao-stock")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === "manutencao-stock"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Manutenção & Stock
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Tab 1 - Visão Geral */}
          {activeTab === "visao-geral" && (
            <div className="space-y-6">
              {/* Detalhes Técnicos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes Técnicos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Marca</span>
                    <span className="font-semibold text-gray-900">{vehicle.marca}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Modelo</span>
                    <span className="font-semibold text-gray-900">{vehicle.modelo}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Ano</span>
                    <span className="font-semibold text-gray-900">{vehicle.ano}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Cor</span>
                    <span className="font-semibold text-gray-900">{vehicle.cor}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Combustível</span>
                    <span className="font-semibold text-gray-900">{vehicle.combustivel}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Cilindrada</span>
                    <span className="font-semibold text-gray-900">{vehicle.cilindrada}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Potência</span>
                    <span className="font-semibold text-gray-900">{vehicle.potencia}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Nº de Quadro</span>
                    <span className="font-semibold text-gray-900 text-sm">{vehicle.numeroQuadro}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Data de Entrega</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(vehicle.dataEntrega).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Intervalo de Revisão</span>
                    <span className="font-semibold text-gray-900">
                      {vehicle.intervaloRevisao.toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Tipo de Pneu</span>
                    <span className="font-semibold text-gray-900">{vehicle.tipoPneu}</span>
                  </div>
                  <div className="col-span-2 flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Pneu Original (Fábrica)</span>
                    <span className="font-semibold text-gray-900">{vehicle.pneuOriginal}</span>
                  </div>
                  <div className="col-span-2 flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Pneu Atual</span>
                    <span className="font-semibold text-gray-900 text-blue-600">{vehicle.pneuAtual}</span>
                  </div>
                </div>
              </div>

              {/* Gráfico de Evolução de Lucro */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução de Lucro (Últimos 6 Meses)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `€${value}`} />
                    <Tooltip 
                      formatter={(value) => [`€${value}`, 'Lucro']}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lucro" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tab 2 - Histórico Financeiro */}
          {activeTab === "historico-financeiro" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Todas as Transações</h3>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Total Receitas: </span>
                    <span className="font-semibold text-green-600">€{totalReceitas.toFixed(2)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Total Despesas: </span>
                    <span className="font-semibold text-red-600">€{totalDespesas.toFixed(2)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Saldo: </span>
                    <span className={`font-semibold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{saldoLiquido.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Categoria</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Valor</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(transaction.data).toLocaleDateString('pt-PT')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            transaction.tipo === "Receita"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {transaction.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{transaction.categoria}</td>
                        <td className={`px-4 py-3 text-sm text-right font-semibold ${
                          transaction.valor >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          €{Math.abs(transaction.valor).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3 - Manutenção & Stock */}
          {activeTab === "manutencao-stock" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Manutenção</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data da Oficina</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Descrição</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Oficina</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Material Usado (Stock)</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Custo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {maintenanceHistory.map((maintenance) => (
                      <tr key={maintenance.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(maintenance.data).toLocaleDateString('pt-PT')}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{maintenance.descricao}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{maintenance.oficina}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {maintenance.materiaisUsados.map((material, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                              >
                                <Package className="w-3 h-3" />
                                {material}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          €{maintenance.custo.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddExpenseStockModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        vehicleId={vehicleId}
      />
    </div>
  );
}