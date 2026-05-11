import { LogOut, User, Shield, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CentroliderLogo } from "./CentroliderLogo";

export function ConfiguracoesView() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-500 text-sm mt-1">Gerencie a sua conta e preferências</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Perfil</h3>
        </div>
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
            {user?.name?.slice(0, 2).toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user?.name || "—"}</p>
            <p className="text-sm text-gray-500">{user?.email || user?.username || "—"}</p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Segurança</h3>
        </div>
        <div className="px-6 py-5">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-medium rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Terminar sessão
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Sobre</h3>
        </div>
        <div className="px-6 py-6 flex flex-col items-center gap-3">
          <CentroliderLogo size="lg" />
          <p className="text-xs text-gray-400 mt-2">Versão 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
