import { Bell, Search, Settings, Menu, Truck, BarChart2, Package, Car, CalendarDays, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CentroliderLogo } from "./CentroliderLogo";

export function Navbar({ activeMenu, onMenuChange, onSettingsClick }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "frotas", label: "Frotas", icon: Truck },
    { id: "frota-global", label: "Frota Global", icon: Car },
    { id: "agenda", label: "Agenda", icon: CalendarDays },
    { id: "rentabilidade", label: "Rentabilidade", icon: BarChart2 },
    { id: "stock", label: "Stock", icon: Package },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <CentroliderLogo size="sm" />
            </div> 
            
            {/* Desktop Menu */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onMenuChange(item.id)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    activeMenu === item.id
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <item.icon className={`w-4 h-4 mr-2 ${activeMenu === item.id ? "text-blue-500" : "text-gray-400"}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search - Hidden on mobile for simplicity */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="pl-10 pr-4 py-1.5 border border-gray-200 rounded-lg w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            <button
              onClick={onSettingsClick}
              className={`p-2 rounded-lg transition-colors hidden md:block ${activeMenu === "configuracoes" ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
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
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${activeMenu === item.id ? "text-blue-500" : "text-gray-400"}`} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}