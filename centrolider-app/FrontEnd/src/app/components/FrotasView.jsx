import { Car, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { StatCard } from "./StatCard";
import { FleetCard } from "./FleetCard";
import { FleetDetailView } from "./FleetDetailView";
import { AddFleetModal } from "./AddFleetModal";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../../services/api";

const STATUS_COLORS = {
  Operacional: "#10b981",
  Manutenção: "#f59e0b",
  Inativo: "#ef4444",
};

export function FrotasView() {
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddFleetOpen, setIsAddFleetOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.getFleets()
      .then(setFleets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    api.getNotifications()
      .then(({ notifications }) => setNotifications(notifications || []))
      .catch(() => {});
  }, []);

  const fleetNotifCounts = useMemo(() => {
    const map = {};
    for (const n of notifications) {
      if (n.frotaId) {
        const fid = String(n.frotaId);
        map[fid] = (map[fid] || 0) + 1;
      }
    }
    return map;
  }, [notifications]);

  if (selectedFleet) {
    return (
      <FleetDetailView
        fleet={selectedFleet}
        onBack={() => setSelectedFleet(null)}
      />
    );
  }

  const totalVehicles = fleets.reduce((s, f) => s + (f.totalVehicles || 0), 0);
  const totalOperacional = fleets.reduce((s, f) => s + (f.activeVehicles || 0), 0);
  const totalManutencao = fleets.reduce((s, f) => s + (f.maintenanceAlerts || 0), 0);
  const totalInativos = totalVehicles - totalOperacional - totalManutencao;

  const statusData = [
    { name: "Operacional", value: totalOperacional, color: STATUS_COLORS.Operacional },
    { name: "Manutenção",  value: totalManutencao,  color: STATUS_COLORS.Manutenção },
    { name: "Inativo",     value: Math.max(0, totalInativos), color: STATUS_COLORS.Inativo },
  ].filter((s) => s.value > 0);

  const utilizacao = totalVehicles > 0
    ? ((totalOperacional / totalVehicles) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Veículos"
          value={loading ? "—" : totalVehicles.toString()}
          change={`${fleets.length} frotas`}
          changeType="positive"
          icon={Car}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Operacionais"
          value={loading ? "—" : totalOperacional.toString()}
          change={`${utilizacao}%`}
          changeType="positive"
          icon={CheckCircle}
          iconColor="bg-green-100 text-green-600"
        />
        <StatCard
          title="Em Manutenção"
          value={loading ? "—" : totalManutencao.toString()}
          change={totalVehicles > 0 ? `${((totalManutencao / totalVehicles) * 100).toFixed(1)}%` : "0%"}
          changeType="neutral"
          icon={Car}
          iconColor="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Alertas Ativos"
          value={loading ? "—" : totalManutencao.toString()}
          change="Em manutenção"
          changeType={totalManutencao > 0 ? "negative" : "positive"}
          icon={AlertCircle}
          iconColor="bg-red-100 text-red-600"
        />
      </div>

      {/* Fleet Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Gestão de Frotas</h3>
          <button
            onClick={() => setIsAddFleetOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            + Nova Frota
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4">
            Erro ao carregar frotas: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fleets.map((fleet) => (
              <div key={fleet._id} onClick={() => setSelectedFleet(fleet)} className="cursor-pointer">
                <FleetCard
                  name={fleet.name}
                  description={fleet.description}
                  activeVehicles={fleet.activeVehicles || 0}
                  totalVehicles={fleet.totalVehicles || 0}
                  maintenanceAlerts={fleet.maintenanceAlerts || 0}
                  performanceChange={fleet.totalVehicles > 0 ? `${fleet.activeVehicles} operacionais` : "Sem veículos"}
                  imageUrl={fleet.imageUrl}
                  notifCount={fleetNotifCounts[String(fleet._id)] || 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado da Frota</h3>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Sem dados</div>
          )}
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-blue-700 font-medium">Taxa de Utilização</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{utilizacao}%</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-700" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">{totalOperacional} de {totalVehicles} veículos</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-green-700 font-medium">Total de Frotas</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{fleets.length}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-700" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">Clientes ativos</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-orange-700 font-medium">Em Manutenção</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{totalManutencao}</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-lg">
                <Clock className="w-6 h-6 text-orange-700" />
              </div>
            </div>
            <p className="text-xs text-orange-600 mt-2">Veículos em oficina</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-red-700 font-medium">Inativos</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{Math.max(0, totalInativos)}</p>
              </div>
              <div className="p-3 bg-red-200 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-700" />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">Fora de serviço</p>
          </div>
        </div>
      </div>
      <AddFleetModal
        isOpen={isAddFleetOpen}
        onClose={() => setIsAddFleetOpen(false)}
        onSave={async (data) => {
          const fleet = await api.createFleet(data);
          setFleets((prev) => [...prev, { ...fleet, totalVehicles: 0, activeVehicles: 0, maintenanceAlerts: 0 }]);
        }}
      />
    </div>
  );
}
