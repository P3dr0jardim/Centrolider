import { TrendingUp, TrendingDown, DollarSign, Euro } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Mock data para rentabilidade por frota
const fleetProfitabilityData = [
  {
    frota: "ARM",
    receita: 125000,
    despesa: 78000,
    lucro: 47000,
  },
  {
    frota: "EEM",
    receita: 185000,
    despesa: 112000,
    lucro: 73000,
  },
  {
    frota: "CM Funchal",
    receita: 158000,
    despesa: 95000,
    lucro: 63000,
  },
  {
    frota: "CM Calheta",
    receita: 142000,
    despesa: 88000,
    lucro: 54000,
  },
];

// Calcular totais
const totalReceita = fleetProfitabilityData.reduce((sum, item) => sum + item.receita, 0);
const totalDespesa = fleetProfitabilityData.reduce((sum, item) => sum + item.despesa, 0);
const totalLucro = totalReceita - totalDespesa;
const margemLucro = ((totalLucro / totalReceita) * 100).toFixed(1);

// Custom tooltip para o gráfico
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.frota}</p>
        <div className="space-y-1">
          <p className="text-sm text-green-600">
            Receita: €{payload[0].value.toLocaleString()}
          </p>
          <p className="text-sm text-red-600">
            Despesa: €{payload[1].value.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600 font-semibold">
            Lucro: €{payload[2].value.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function RentabilidadeView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Rentabilidade</h2>
        <p className="text-gray-600 mt-1">
          Análise financeira completa de todas as frotas
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receita Total */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-green-700 font-medium">Receita Total</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                €{totalReceita.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">
              +12.5%
            </span>
            <span className="text-xs text-green-700">vs. mês anterior</span>
          </div>
        </div>

        {/* Despesa Total */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-red-700 font-medium">Despesa Total</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                €{totalDespesa.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-700" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-semibold rounded-full">
              +8.2%
            </span>
            <span className="text-xs text-red-700">vs. mês anterior</span>
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-blue-700 font-medium">Lucro Líquido</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                €{totalLucro.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Euro className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
              {margemLucro}%
            </span>
            <span className="text-xs text-blue-700">margem de lucro</span>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras - Rentabilidade por Frota */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Rentabilidade por Frota
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Comparativo de receitas, despesas e lucros
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={fleetProfitabilityData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="frota" 
              tick={{ fill: '#6b7280', fontSize: 14 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 14 }}
              tickLine={false}
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="receita" 
              fill="#10b981" 
              radius={[8, 8, 0, 0]}
              name="Receita"
            />
            <Bar 
              dataKey="despesa" 
              fill="#ef4444" 
              radius={[8, 8, 0, 0]}
              name="Despesa"
            />
            <Bar 
              dataKey="lucro" 
              fill="#3b82f6" 
              radius={[8, 8, 0, 0]}
              name="Lucro"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela Detalhada */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detalhamento por Frota
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Frota
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Receita
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Despesa
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Lucro
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Margem
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fleetProfitabilityData.map((fleet) => {
                const margem = ((fleet.lucro / fleet.receita) * 100).toFixed(1);
                const isGoodMargin = parseFloat(margem) > 35;
                
                return (
                  <tr key={fleet.frota} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {fleet.frota}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-green-600">
                        €{fleet.receita.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-red-600">
                        €{fleet.despesa.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-blue-600">
                        €{fleet.lucro.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-semibold ${
                        isGoodMargin ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {margem}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        isGoodMargin 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {isGoodMargin ? 'Excelente' : 'Boa'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-gray-900">TOTAL</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-bold text-green-600">
                    €{totalReceita.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-bold text-red-600">
                    €{totalDespesa.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-bold text-blue-600">
                    €{totalLucro.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {margemLucro}%
                  </span>
                </td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
