import { Car, AlertCircle, CheckCircle, Clock, TrendingUp, X, Wrench, Package, Bell } from "lucide-react";
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

export function FrotasView({ onNavigate, onVehicleSelect }) {
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddFleetOpen, setIsAddFleetOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [loadingNotifVehicleId, setLoadingNotifVehicleId] = useState(null);
  const [bellFleetId, setBellFleetId] = useState(null);

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

  const handleOpenNotifVehicle = async (vehicleId) => {
    if (!vehicleId || !onVehicleSelect) return;
    setLoadingNotifVehicleId(String(vehicleId));
    try {
      const v = await api.getVehicle(vehicleId);
      setShowAlertsModal(false);
      onVehicleSelect(v);
    } catch {
      // ignore
    } finally {
      setLoadingNotifVehicleId(null);
    }
  };

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
          onClick={onNavigate ? () => onNavigate("frota-global") : undefined}
        />
        <StatCard
          title="Operacionais"
          value={loading ? "—" : totalOperacional.toString()}
          change={`${utilizacao}%`}
          changeType="positive"
          icon={CheckCircle}
          iconColor="bg-green-100 text-green-600"
          onClick={onNavigate ? () => onNavigate("frota-global", "Operacional") : undefined}
        />
        <StatCard
          title="Em Manutenção"
          value={loading ? "—" : totalManutencao.toString()}
          change={totalVehicles > 0 ? `${((totalManutencao / totalVehicles) * 100).toFixed(1)}%` : "0%"}
          changeType="neutral"
          icon={Car}
          iconColor="bg-orange-100 text-orange-600"
          onClick={onNavigate ? () => onNavigate("manutencao") : undefined}
        />
        <StatCard
          title="Alertas Ativos"
          value={loading ? "—" : notifications.length.toString()}
          change="Ver detalhes"
          changeType={notifications.length > 0 ? "negative" : "positive"}
          icon={AlertCircle}
          iconColor="bg-red-100 text-red-600"
          onClick={() => setShowAlertsModal(true)}
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
                  onBellClick={() => setBellFleetId(String(fleet._id))}
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

      {bellFleetId && (() => {
        const fleet = fleets.find((f) => String(f._id) === bellFleetId);
        const fleetNotifs = notifications.filter(
          (n) => n.frotaId && String(n.frotaId) === bellFleetId
        );
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBellFleetId(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{fleet?.name || "Frota"}</h3>
                    <p className="text-sm text-gray-500">{fleetNotifs.length} alerta{fleetNotifs.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button onClick={() => setBellFleetId(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-2">
                {fleetNotifs.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Sem alertas para esta frota</p>
                ) : (
                  fleetNotifs.map((n, i) => {
                    const isMaint    = n.type === "maintenance";
                    const isUpcoming = n.type === "upcoming";
                    const isHigh     = n.severity === "high";
                    const bgClass    = isMaint && isHigh ? "bg-red-50 border-red-200"
                                     : isMaint           ? "bg-orange-50 border-orange-200"
                                     : isUpcoming        ? "bg-blue-50 border-blue-200"
                                     : isHigh            ? "bg-red-50 border-red-200"
                                                         : "bg-yellow-50 border-yellow-200";
                    const iconBg     = isMaint && isHigh ? "bg-red-100" : isMaint ? "bg-orange-100" : isUpcoming ? "bg-blue-100" : isHigh ? "bg-red-100" : "bg-yellow-100";
                    const msgClass   = isMaint && isHigh ? "text-red-800" : isMaint ? "text-orange-800" : isUpcoming ? "text-blue-800" : isHigh ? "text-red-800" : "text-yellow-800";
                    const badgeClass = isHigh ? "bg-red-100 text-red-700" : n.severity === "medium" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700";
                    const badgeLabel = isHigh ? "Urgente" : n.severity === "medium" ? "Atenção" : "Info";
                    return (
                      <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${bgClass}`}>
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${iconBg}`}>
                          {isMaint ? <Wrench className="w-4 h-4 text-orange-600" />
                          : isUpcoming ? <Clock className="w-4 h-4 text-blue-600" />
                                       : <Package className="w-4 h-4 text-yellow-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${msgClass}`}>{n.message}</p>
                          {n.modelo && <p className="text-xs text-gray-500 mt-0.5">{n.modelo}</p>}
                          {n.vehicleId && onVehicleSelect && (
                            <button
                              type="button"
                              onClick={() => handleOpenNotifVehicle(String(n.vehicleId))}
                              disabled={!!loadingNotifVehicleId}
                              className="mt-1.5 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-40"
                            >
                              {loadingNotifVehicleId === String(n.vehicleId)
                                ? <><div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" /> A carregar…</>
                                : "Ver viatura →"}
                            </button>
                          )}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeClass}`}>{badgeLabel}</span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-end">
                <button onClick={() => setBellFleetId(null)} className="px-5 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showAlertsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAlertsModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Alertas Ativos</h3>
                  <p className="text-sm text-gray-500">{notifications.length} alerta{notifications.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-2">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Sem alertas ativos</p>
              ) : (
                notifications.map((n, i) => {
                  const isMaint    = n.type === "maintenance";
                  const isUpcoming = n.type === "upcoming";
                  const isHigh     = n.severity === "high";
                  const bgClass    = isMaint && isHigh ? "bg-red-50 border-red-200"
                                   : isMaint           ? "bg-orange-50 border-orange-200"
                                   : isUpcoming        ? "bg-blue-50 border-blue-200"
                                   : isHigh            ? "bg-red-50 border-red-200"
                                                       : "bg-yellow-50 border-yellow-200";
                  const iconBg     = isMaint && isHigh ? "bg-red-100"
                                   : isMaint           ? "bg-orange-100"
                                   : isUpcoming        ? "bg-blue-100"
                                   : isHigh            ? "bg-red-100"
                                                       : "bg-yellow-100";
                  const msgClass   = isMaint && isHigh ? "text-red-800"
                                   : isMaint           ? "text-orange-800"
                                   : isUpcoming        ? "text-blue-800"
                                   : isHigh            ? "text-red-800"
                                                       : "text-yellow-800";
                  const badgeClass = isHigh ? "bg-red-100 text-red-700"
                                   : n.severity === "medium" ? "bg-orange-100 text-orange-700"
                                   : "bg-blue-100 text-blue-700";
                  const badgeLabel = isHigh ? "Urgente" : n.severity === "medium" ? "Atenção" : "Info";
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${bgClass}`}>
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${iconBg}`}>
                        {isMaint    ? <Wrench    className="w-4 h-4 text-orange-600" />
                        : isUpcoming ? <Clock     className="w-4 h-4 text-blue-600" />
                                     : <Package   className="w-4 h-4 text-yellow-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${msgClass}`}>{n.message}</p>
                        {n.modelo && <p className="text-xs text-gray-500 mt-0.5">{n.modelo}</p>}
                        {n.vehicleId && onVehicleSelect && (
                          <button
                            type="button"
                            onClick={() => handleOpenNotifVehicle(String(n.vehicleId))}
                            disabled={!!loadingNotifVehicleId}
                            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-40"
                          >
                            {loadingNotifVehicleId === String(n.vehicleId)
                              ? <><div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" /> A carregar…</>
                              : "Ver viatura →"}
                          </button>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowAlertsModal(false)}
                className="px-5 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
