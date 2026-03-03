import { TrendingUp, TrendingDown, Car, DollarSign, Wrench } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data - Veículos por cliente
const clientesData = [
  {
    id: "CLI-001",
    nome: "Empresa de Logística A",
    totalVeiculos: 24,
    veiculos: [
      { matricula: "AA-01-BB", marcaModelo: "Mercedes Sprinter 316", condutor: "João Silva", valorAquisicao: 45000, rentabilidade: 8500 },
      { matricula: "AA-02-CC", marcaModelo: "Renault Master L3H2", condutor: "Maria Costa", valorAquisicao: 38000, rentabilidade: 7200 },
      { matricula: "AA-03-DD", marcaModelo: "Peugeot Boxer 435", condutor: "Pedro Santos", valorAquisicao: 42000, rentabilidade: 6800 },
      { matricula: "AA-04-EE", marcaModelo: "Mercedes Vito 116", condutor: "Ana Ferreira", valorAquisicao: 35000, rentabilidade: 5400 },
      { matricula: "AA-05-FF", marcaModelo: "Volkswagen Crafter", condutor: "Rui Alves", valorAquisicao: 48000, rentabilidade: 9100 },
      { matricula: "AA-06-GG", marcaModelo: "Ford Transit Custom", condutor: "Sofia Mendes", valorAquisicao: 32000, rentabilidade: 4900 },
      { matricula: "AA-07-HH", marcaModelo: "Fiat Ducato Maxi", condutor: "Carlos Martins", valorAquisicao: 36000, rentabilidade: 6200 },
      { matricula: "AA-08-II", marcaModelo: "Renault Trafic L2H1", condutor: "Isabel Rodrigues", valorAquisicao: 28000, rentabilidade: 4100 },
      { matricula: "AA-09-JJ", marcaModelo: "Mercedes Sprinter 319", condutor: "Paulo Oliveira", valorAquisicao: 52000, rentabilidade: 10200 },
      { matricula: "AA-10-KK", marcaModelo: "Peugeot Expert L2", condutor: "Teresa Lima", valorAquisicao: 29000, rentabilidade: 5300 },
      { matricula: "AA-11-LL", marcaModelo: "Volkswagen Transporter", condutor: "Miguel Pereira", valorAquisicao: 31000, rentabilidade: 5800 },
      { matricula: "AA-12-MM", marcaModelo: "Ford Transit 350", condutor: "Carla Sousa", valorAquisicao: 44000, rentabilidade: 7900 },
    ],
  },
  {
    id: "CLI-002",
    nome: "Empresa de Transportes B",
    totalVeiculos: 18,
    veiculos: [
      { matricula: "BB-01-XX", marcaModelo: "Iveco Daily 35S", condutor: "António Gomes", valorAquisicao: 42000, rentabilidade: 7800 },
      { matricula: "BB-02-YY", marcaModelo: "Mercedes Sprinter 316", condutor: "Helena Ramos", valorAquisicao: 46000, rentabilidade: 8900 },
      { matricula: "BB-03-ZZ", marcaModelo: "Renault Master", condutor: "José Ferreira", valorAquisicao: 39000, rentabilidade: 6700 },
      { matricula: "BB-04-AA", marcaModelo: "Peugeot Boxer 435", condutor: "Luísa Dias", valorAquisicao: 41000, rentabilidade: 7100 },
      { matricula: "BB-05-BB", marcaModelo: "Ford Transit 350L", condutor: "Manuel Correia", valorAquisicao: 43000, rentabilidade: 8200 },
      { matricula: "BB-06-CC", marcaModelo: "Mercedes Vito 114", condutor: "Beatriz Neves", valorAquisicao: 33000, rentabilidade: 5200 },
      { matricula: "BB-07-DD", marcaModelo: "Volkswagen Crafter", condutor: "Fernando Silva", valorAquisicao: 49000, rentabilidade: 9500 },
      { matricula: "BB-08-EE", marcaModelo: "Fiat Ducato", condutor: "Cristina Lopes", valorAquisicao: 37000, rentabilidade: 6400 },
      { matricula: "BB-09-FF", marcaModelo: "Renault Trafic", condutor: "Ricardo Soares", valorAquisicao: 30000, rentabilidade: 4800 },
      { matricula: "BB-10-GG", marcaModelo: "Peugeot Expert", condutor: "Mariana Costa", valorAquisicao: 28000, rentabilidade: 4500 },
    ],
  },
  {
    id: "CLI-003",
    nome: "Construtora Silva & Filhos",
    totalVeiculos: 15,
    veiculos: [
      { matricula: "CC-01-PP", marcaModelo: "Mercedes Sprinter 319", condutor: "Joaquim Silva", valorAquisicao: 54000, rentabilidade: 11200 },
      { matricula: "CC-02-QQ", marcaModelo: "Ford Transit 350", condutor: "Sandra Pinto", valorAquisicao: 45000, rentabilidade: 8600 },
      { matricula: "CC-03-RR", marcaModelo: "Renault Master L3", condutor: "Nuno Carvalho", valorAquisicao: 40000, rentabilidade: 7400 },
      { matricula: "CC-04-SS", marcaModelo: "Volkswagen Crafter", condutor: "Paula Monteiro", valorAquisicao: 50000, rentabilidade: 9800 },
      { matricula: "CC-05-TT", marcaModelo: "Iveco Daily 50C", condutor: "Vítor Teixeira", valorAquisicao: 48000, rentabilidade: 9200 },
      { matricula: "CC-06-UU", marcaModelo: "Mercedes Vito 116", condutor: "Daniela Ribeiro", valorAquisicao: 36000, rentabilidade: 6100 },
      { matricula: "CC-07-VV", marcaModelo: "Peugeot Boxer 435", condutor: "Bruno Almeida", valorAquisicao: 43000, rentabilidade: 7700 },
      { matricula: "CC-08-WW", marcaModelo: "Fiat Ducato Maxi", condutor: "Raquel Moreira", valorAquisicao: 38000, rentabilidade: 6800 },
    ],
  },
];

// Dados para gráfico de distribuição por marca
const marcasData = [
  { nome: "Mercedes", valor: 40, count: 16 },
  { nome: "Renault", valor: 25, count: 10 },
  { nome: "Peugeot", valor: 15, count: 6 },
  { nome: "Volkswagen", valor: 10, count: 4 },
  { nome: "Ford", valor: 7, count: 3 },
  { nome: "Outros", valor: 3, count: 1 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"];

// Dados para gráfico de valor por cliente
const valorPorClienteData = [
  { cliente: "Logística A", valor: 960000 },
  { cliente: "Transportes B", valor: 720000 },
  { cliente: "Silva & Filhos", valor: 540000 },
];

export function FrotaGlobalView() {
  // Calcular estatísticas globais
  const totalVeiculos = clientesData.reduce((sum, c) => sum + c.totalVeiculos, 0);
  const totalValorAtivo = clientesData.reduce(
    (sum, c) => sum + c.veiculos.reduce((s, v) => s + v.valorAquisicao, 0),
    0
  );
  const custoMedio = Math.round(totalValorAtivo / totalVeiculos);
  const veiculosOperacionais = Math.round(totalVeiculos * 0.85); // 85% operacionais
  const veiculosOficina = totalVeiculos - veiculosOperacionais;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Frota Global e Estatísticas</h2>
        <p className="text-gray-600 mt-1">
          Visão consolidada de todas as frotas geridas
        </p>
      </div>

      {/* Secção 1: Listagens por Cliente */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Listagens de Frotas por Empresa</h3>
        
        {clientesData.map((cliente) => (
          <div key={cliente.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{cliente.nome}</h4>
                <p className="text-sm text-gray-600 mt-0.5">Cliente ID: {cliente.id}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm">
                  {cliente.totalVeiculos} Viaturas
                </span>
                <span className="text-sm text-gray-600">
                  Valor Total: €{cliente.veiculos.reduce((sum, v) => sum + v.valorAquisicao, 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Tabela com altura fixa e scroll */}
            <div className="overflow-hidden">
              <div className="overflow-y-auto" style={{ maxHeight: "460px" }}>
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Matrícula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Marca / Modelo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Condutor
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Valor de Aquisição
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Rentabilidade Atual
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cliente.veiculos.map((veiculo, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-blue-600">
                            {veiculo.matricula}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {veiculo.marcaModelo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {veiculo.condutor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                          €{veiculo.valorAquisicao.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-semibold flex items-center justify-end gap-1 ${
                            veiculo.rentabilidade >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {veiculo.rentabilidade >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            €{Math.abs(veiculo.rentabilidade).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secção 2: Estatísticas de Veículos */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8 mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Estatísticas de Veículos</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Widget 1: Distribuição por Marca (Donut Chart) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição por Marca
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={marcasData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="valor"
                  label={({ nome, valor }) => `${nome} ${valor}%`}
                  labelLine={false}
                >
                  {marcasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% (${props.payload.count} veículos)`,
                    props.payload.nome
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {marcasData.map((marca, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    {marca.nome} ({marca.count})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Valor Total por Cliente (Bar Chart) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Valor Total da Frota por Cliente
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={valorPorClienteData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <YAxis dataKey="cliente" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [`€${value.toLocaleString()}`, 'Valor Total']}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="valor" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Valor Total Combinado</span>
                <span className="font-bold text-gray-900 text-lg">
                  €{(valorPorClienteData.reduce((sum, d) => sum + d.valor, 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Widget 3: Resumo Financeiro (KPI Cards) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo Financeiro
            </h4>
            <div className="space-y-5">
              {/* KPI 1 */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Valor Total do Ativo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{(totalValorAtivo / 1000000).toFixed(2)}M
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalVeiculos} veículos ativos
                  </p>
                </div>
              </div>

              {/* KPI 2 */}
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Car className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Custo Médio por Viatura</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{custoMedio.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Média da frota global
                  </p>
                </div>
              </div>

              {/* KPI 3 */}
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wrench className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Ativos vs Oficina</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-green-600">
                      {veiculosOperacionais}
                    </p>
                    <span className="text-gray-400 font-semibold">/</span>
                    <p className="text-2xl font-bold text-orange-600">
                      {veiculosOficina}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((veiculosOperacionais / totalVeiculos) * 100)}% operacionais
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
