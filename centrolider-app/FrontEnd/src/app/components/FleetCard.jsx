import { Bell, AlertTriangle, TrendingUp } from "lucide-react";

const FLEET_COLORS = {
  ARM:         { bg: "#1e3a8a", text: "#ffffff" },
  CMC:         { bg: "#dc2626", text: "#ffffff" },
  CMF:         { bg: "#7c3aed", text: "#ffffff" },
  CMSC:        { bg: "#16a34a", text: "#ffffff" },
  DRPA:        { bg: "#0d9488", text: "#ffffff" },
  IDR:         { bg: "#4338ca", text: "#ffffff" },
  IEM:         { bg: "#b45309", text: "#ffffff" },
  IMT:         { bg: "#0369a1", text: "#ffffff" },
  IQ:          { bg: "#be185d", text: "#ffffff" },
  ISSM:        { bg: "#c2410c", text: "#ffffff" },
  PRODERAM:    { bg: "#059669", text: "#ffffff" },
  SESARAM:     { bg: "#a21caf", text: "#ffffff" },
  EEM:         { bg: "#1d4ed8", text: "#ffffff" },
  "TEST FLEET":{ bg: "#374151", text: "#ffffff" },
};

const FALLBACK_PALETTE = [
  "#1e3a8a","#dc2626","#7c3aed","#16a34a","#0d9488",
  "#4338ca","#b45309","#0369a1","#be185d","#059669",
];

function hashColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0x7fffffff;
  return FALLBACK_PALETTE[h % FALLBACK_PALETTE.length];
}

function getFleetStyle(name) {
  const key = name?.toUpperCase().trim();
  return FLEET_COLORS[key] ?? { bg: hashColor(name || ""), text: "#ffffff" };
}

function getFleetAbbr(name) {
  if (!name) return "?";
  if (name.length <= 6) return name.toUpperCase();
  const words = name.trim().split(/\s+/);
  if (words.length > 1) return words.map((w) => w[0]).join("").toUpperCase().slice(0, 3);
  return name.slice(0, 3).toUpperCase();
}

export function FleetCard({
  name,
  description,
  activeVehicles,
  totalVehicles,
  maintenanceAlerts,
  performanceChange,
  notifCount = 0,
  onBellClick,
}) {
  const hasAlerts = maintenanceAlerts > 0;
  const style = getFleetStyle(name);
  const abbr = getFleetAbbr(name);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
      {/* Badge Section */}
      <div
        className="relative h-48 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${style.bg}ee, ${style.bg})` }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ background: "#ffffff" }} />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10" style={{ background: "#ffffff" }} />

        {/* Abbreviation */}
        <span
          className="relative z-10 font-black tracking-widest select-none"
          style={{
            color: style.text,
            fontSize: abbr.length <= 3 ? "3.5rem" : abbr.length <= 5 ? "2.5rem" : "1.75rem",
            textShadow: "0 2px 12px rgba(0,0,0,0.25)",
          }}
        >
          {abbr}
        </span>

        {/* Alert Badge */}
        {hasAlerts && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{maintenanceAlerts}</span>
          </div>
        )}

        {/* Notification Bell */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onBellClick?.(); }}
          className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
          title={notifCount > 0 ? `${notifCount} notificação${notifCount !== 1 ? "s" : ""}` : "Sem notificações"}
        >
          <Bell className="w-4 h-4 text-white" />
          {notifCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 shadow">
              {notifCount > 99 ? "99+" : notifCount}
            </span>
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-600 line-clamp-1">{description}</p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Viaturas Ativas</span>
            <span className="text-lg font-semibold text-gray-900">
              {activeVehicles}/{totalVehicles}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: totalVehicles > 0 ? `${(activeVehicles / totalVehicles) * 100}%` : "0%",
                backgroundColor: style.bg,
              }}
            />
          </div>

          {performanceChange && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">{performanceChange}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-600">{activeVehicles} operacionais</span>
            </div>
            {maintenanceAlerts > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-xs text-gray-600">{maintenanceAlerts} alertas</span>
              </div>
            )}
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Ver detalhes →
          </button>
        </div>
      </div>
    </div>
  );
}
