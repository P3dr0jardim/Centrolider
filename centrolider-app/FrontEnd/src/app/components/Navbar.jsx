import { Bell, Search, Settings, Menu, Truck, BarChart2, Package, Car, CalendarDays, LogOut, Activity, Wrench, X, AlertTriangle, Clock, CalendarClock, Users } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { CentroliderLogo } from "./CentroliderLogo";
import { MiNunesLogo } from "./MiNunesLogo";
import { api } from "../../services/api";

const STATUS_DOT = {
  "Operacional": "bg-green-500",
  "Manutenção":  "bg-orange-500",
  "Inativo":     "bg-red-500",
};

const NOTIF_ICONS = {
  maintenance: { Icon: Wrench,       bg: "bg-orange-100", color: "text-orange-600" },
  upcoming:    { Icon: CalendarClock, bg: "bg-blue-100",   color: "text-blue-600"  },
  stock:       { Icon: Package,      bg: "bg-red-100",    color: "text-red-600"   },
};

const SEVERITY_DOT = {
  high:   "bg-red-500",
  medium: "bg-orange-400",
  info:   "bg-blue-400",
};

export function Navbar({ activeMenu, onMenuChange, onSettingsClick, onVehicleSelect }) {
  const { user, logout } = useAuth();
  const isMiNunes = user?.app === "minunes";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const vehiclesCache = useRef(null);
  const searchWrapRef = useRef(null);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [loadingVehicleId, setLoadingVehicleId] = useState(null);
  const notifWrapRef = useRef(null);

  const menuItems = [
    { id: "frotas",        label: "Frotas",        icon: Truck },
    { id: "manutencao",    label: "Manutenção",    icon: Wrench },
    { id: "frota-global",  label: "Frota Global",  icon: Car },
    { id: "agenda",        label: "Agenda",        icon: CalendarDays },
    { id: "rentabilidade", label: "Rentabilidade", icon: BarChart2 },
    { id: "stock",         label: "Stock",         icon: Package },
    { id: "atividade",     label: "Atividade",     icon: Activity },
    ...(user?.role === "admin" ? [{ id: "utilizadores", label: "Utilizadores", icon: Users }] : []),
  ];

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load notifications on mount and every 5 minutes
  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
    } catch {
      // silent fail — don't break the nav
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const loadVehicles = useCallback(async () => {
    if (vehiclesCache.current) return vehiclesCache.current;
    setSearching(true);
    try {
      const vehicles = await api.getVehicles();
      vehiclesCache.current = vehicles;
      return vehicles;
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = async (e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setSearchOpen(false);
      return;
    }
    const vehicles = await loadVehicles();
    const term = q.trim().toLowerCase();
    const found = vehicles
      .filter(
        (v) =>
          v.matricula?.toLowerCase().includes(term) ||
          v.modelo?.toLowerCase().includes(term)
      )
      .slice(0, 8);
    setResults(found);
    setSearchOpen(true);
  };

  const handleSelect = (vehicle) => {
    setQuery("");
    setResults([]);
    setSearchOpen(false);
    onVehicleSelect?.(vehicle);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearchOpen(false);
  };

  const toggleNotif = () => {
    setNotifOpen((prev) => !prev);
  };

  const highCount = notifications.filter((n) => n.severity === "high").length;
  const badgeCount = notifications.length;

  const groupedNotifs = [
    { key: "maintenance", label: "Em Manutenção",    items: notifications.filter((n) => n.type === "maintenance") },
    { key: "upcoming",    label: "Próximos Eventos",  items: notifications.filter((n) => n.type === "upcoming") },
    { key: "stock",       label: "Stock Baixo",       items: notifications.filter((n) => n.type === "stock") },
  ].filter((g) => g.items.length > 0);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0 flex items-center">
              {isMiNunes ? <MiNunesLogo size="sm" /> : <CentroliderLogo size="sm" />}
            </div>

            {/* Desktop Menu — scrolls horizontally instead of pushing the right-side controls off-screen */}
            <div className="hidden md:flex md:ml-4 lg:ml-8 md:space-x-1 lg:space-x-4 xl:space-x-6 overflow-x-auto flex-1 min-w-0 [scrollbar-width:thin]">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onMenuChange(item.id)}
                  className={`inline-flex items-center flex-shrink-0 px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    activeMenu === item.id
                      ? isMiNunes ? "border-orange-600 text-gray-900" : "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <item.icon className={`w-4 h-4 mr-2 ${activeMenu === item.id ? (isMiNunes ? "text-orange-600" : "text-blue-500") : "text-gray-400"}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0 ml-2">
            {/* Search */}
            <div ref={searchWrapRef} className="hidden lg:block relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${searching ? "text-blue-400 animate-pulse" : "text-gray-400"}`} />
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => results.length > 0 && setSearchOpen(true)}
                onKeyDown={(e) => e.key === "Escape" && clearSearch()}
                placeholder="Pesquisar viatura…"
                className="pl-10 pr-8 py-1.5 border border-gray-200 rounded-lg w-44 xl:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Search Dropdown */}
              {searchOpen && (
                <div className="absolute top-full mt-1.5 left-0 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  {results.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400 text-center">
                      Nenhuma viatura encontrada
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                      {results.map((v) => (
                        <li key={v._id}>
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); handleSelect(v); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[v.status] || "bg-gray-400"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900">{v.matricula}</p>
                              <p className="text-xs text-gray-500 truncate">{v.modelo}{v.condutor ? ` · ${v.condutor}` : ""}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                              v.status === "Operacional" ? "bg-green-100 text-green-700"
                              : v.status === "Manutenção" ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                            }`}>
                              {v.status}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div ref={notifWrapRef} className="relative">
              <button
                onClick={toggleNotif}
                className={`relative p-2 rounded-lg transition-colors ${notifOpen ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <Bell className="w-5 h-5" />
                {badgeCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1 ${highCount > 0 ? "bg-red-500" : "bg-orange-400"}`}>
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900 text-sm">Notificações</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {badgeCount > 0 && (
                        <span className="text-xs text-gray-500">{badgeCount} alerta{badgeCount !== 1 ? "s" : ""}</span>
                      )}
                      <button
                        onClick={loadNotifications}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        disabled={notifLoading}
                      >
                        {notifLoading ? "A carregar…" : "Actualizar"}
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  {notifLoading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : groupedNotifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Sem alertas activos</p>
                      <p className="text-xs text-gray-400">Tudo está a funcionar normalmente</p>
                    </div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto">
                      {groupedNotifs.map((group) => {
                        const { Icon, bg, color } = NOTIF_ICONS[group.key];
                        return (
                          <div key={group.key}>
                            {/* Group header */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${bg}`}>
                                <Icon className={`w-3 h-3 ${color}`} />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{group.label}</span>
                              <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full ${bg} ${color}`}>{group.items.length}</span>
                            </div>

                            {/* Notification rows */}
                            {group.items.map((n, i) => {
                              const { Icon: RowIcon, bg: rowBg, color: rowColor } = NOTIF_ICONS[n.type];
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onMouseDown={async (e) => {
                                    e.preventDefault();
                                    if (!n.vehicleId || !onVehicleSelect) return;
                                    const vid = String(n.vehicleId);
                                    setLoadingVehicleId(vid);
                                    try {
                                      const vehicle = await api.getVehicle(vid);
                                      setNotifOpen(false);
                                      onVehicleSelect(vehicle);
                                    } catch {
                                      // ignore
                                    } finally {
                                      setLoadingVehicleId(null);
                                    }
                                  }}
                                  className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 text-left transition-colors ${
                                    n.vehicleId
                                      ? loadingVehicleId === String(n.vehicleId)
                                        ? "bg-blue-50 cursor-wait"
                                        : "hover:bg-blue-50 cursor-pointer"
                                      : "cursor-default"
                                  }`}
                                >
                                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${rowBg}`}>
                                    <RowIcon className={`w-3.5 h-3.5 ${rowColor}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                                    {n.type === "maintenance" && n.days >= 7 && (
                                      <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Intervenção prolongada
                                      </p>
                                    )}
                                    {n.type === "upcoming" && (
                                      <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Nos próximos 7 dias
                                      </p>
                                    )}
                                    {n.type === "stock" && n.severity === "high" && (
                                      <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Ruptura de stock
                                      </p>
                                    )}
                                  </div>
                                  {loadingVehicleId === String(n.vehicleId)
                                    ? <div className="mt-1 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                    : <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[n.severity] || "bg-gray-400"}`} />}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={onSettingsClick}
              className={`p-2 rounded-lg transition-colors hidden md:block ${activeMenu === "configuracoes" ? (isMiNunes ? "text-orange-600 bg-orange-50" : "text-blue-600 bg-blue-50") : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${isMiNunes ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                {user?.name?.slice(0, 2).toUpperCase() || "?"}
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              title="Terminar sessão"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <Menu className="block h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onMenuChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  activeMenu === item.id
                    ? isMiNunes ? "bg-orange-50 border-orange-600 text-orange-700" : "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${activeMenu === item.id ? (isMiNunes ? "text-orange-600" : "text-blue-500") : "text-gray-400"}`} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
