import { Car, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";
import { StatCard } from "./StatCard";
import { FleetCard } from "./FleetCard";
import { FleetDetailView } from "./FleetDetailView";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const statusData = [
  { name: "Operacional", value: 142, color: "#10b981" },
  { name: "Manutenção", value: 18, color: "#f59e0b" },
  { name: "Inativo", value: 8, color: "#ef4444" },
];

const fleetsList = [
  {
    id: 1,
    name: "ARM",
    description: "Aguas e Residuos Madeira",
    activeVehicles: 28,
    totalVehicles: 32,
    maintenanceAlerts: 2,
    performanceChange: "+12% este mês",
    imageUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Faquasis.pt%2Ffiles%2Flogo-aguas-e-residuos-da-madeira.png%3Fv%3D20210914145610&f=1&nofb=1&ipt=226cbc2697cb759ef296513a9d55b9390f3d39fabe8fe5131cd4bdc610112212",
  },
  {
    id: 2,
    name: "EEM",
    description: "Empresa Eletricidade Madeira",
    activeVehicles: 45,
    totalVehicles: 48,
    maintenanceAlerts: 3,
    performanceChange: "+8% este mês",
    imageUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2F736x%2F5e%2Fe3%2Ff7%2F5ee3f7a48a128c06687fca8adf6d67af.jpg&f=1&nofb=1&ipt=6ec3e57f66d6493fd7207898b804fffa20fd60d3b9334d3ef0abc7fbad75aa72",
  },
  {
    id: 3,
    name: "CM Funchal",
    description: "Camara Municipal Funchal",
    activeVehicles: 38,
    totalVehicles: 42,
    maintenanceAlerts: 0,
    performanceChange: "+5% este mês",
    imageUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Fmedia%2F%3Fmedia_id%3D100044260157500&f=1&nofb=1&ipt=b486fdac9b1ecda388d9b0b424ffd47c1d2e448199c5d09dfb2996a52e32c143",
  },
  {
    id: 4,
    name: "CM Calheta",
    description: "Camara Municipal Calheta",
    activeVehicles: 31,
    totalVehicles: 35,
    maintenanceAlerts: 3,
    performanceChange: "+15% este mês",
    imageUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Fmedia%2F%3Fmedia_id%3D100064824392992&f=1&nofb=1&ipt=9ccc244a05a1fba5d8df45861ac51d47f3f327f0d93135a535890c48144c0c8a",
  },
];

export function FrotasView() {
  const [selectedFleet, setSelectedFleet] = useState(null);

  // If a fleet is selected, show the detail view
  if (selectedFleet) {
    return (
      <FleetDetailView
        fleetName={selectedFleet.name}
        fleetDescription={selectedFleet.description}
        onBack={() => setSelectedFleet(null)}
      />
    );
  }

  // Otherwise, show the fleet list
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Veículos"
          value="168"
          change="+5 este mês"
          changeType="positive"
          icon={Car}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Operacionais"
          value="142"
          change="84.5%"
          changeType="positive"
          icon={CheckCircle}
          iconColor="bg-green-100 text-green-600"
        />
        <StatCard
          title="Em Manutenção"
          value="18"
          change="10.7%"
          changeType="neutral"
          icon={Car}
          iconColor="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Alertas Ativos"
          value="8"
          change="-2 vs. semana passada"
          changeType="positive"
          icon={AlertCircle}
          iconColor="bg-red-100 text-red-600"
        />
      </div>

      {/* Fleet Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Gestão de Frotas
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            + Nova Frota
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fleetsList.map((fleet) => (
            <div
              key={fleet.id}
              onClick={() =>
                setSelectedFleet({
                  name: fleet.name,
                  description: fleet.description,
                })
              }
            >
              <FleetCard
                name={fleet.name}
                description={fleet.description}
                activeVehicles={fleet.activeVehicles}
                totalVehicles={fleet.totalVehicles}
                maintenanceAlerts={fleet.maintenanceAlerts}
                performanceChange={fleet.performanceChange}
                imageUrl={fleet.imageUrl}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado da Frota
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {statusData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Taxa de Utilização
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-1">84.5%</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-700" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">+3.2% vs. mês anterior</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Viaturas ativas
                </p>
                <p className="text-3xl font-bold text-green-900 mt-1">92.3%</p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-700" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">lorem ipsum lorem</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-orange-700 font-medium">
                  Viaturas de substituição
                </p>
                <p className="text-3xl font-bold text-orange-900 mt-1">5</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-lg">
                <Clock className="w-6 h-6 text-orange-700" />
              </div>
            </div>
            <p className="text-xs text-orange-600 mt-2">
              Viaturas de substituição da why not e da 7M
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-red-700 font-medium">
                  Incidentes Ativos
                </p>
                <p className="text-3xl font-bold text-red-900 mt-1">8</p>
              </div>
              <div className="p-3 bg-red-200 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-700" />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">Requer atenção imediata</p>
          </div>
        </div>
      </div>
    </div>
  );
}
