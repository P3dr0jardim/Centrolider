import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { FrotasView } from "./components/FrotasView";
import { FrotaGlobalView } from "./components/FrotaGlobalView";
import { AgendaView } from "./components/AgendaView";
import { RentabilidadeView } from "./components/RentabilidadeView";
import { StockView } from "./components/StockView";
import { ConfiguracoesView } from "./components/ConfiguracoesView";
import { Login } from "./components/Login";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();
  const [activeMenu, setActiveMenu] = useState("frotas");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case "frotas":        return <FrotasView />;
      case "frota-global":  return <FrotaGlobalView />;
      case "agenda":        return <AgendaView />;
      case "rentabilidade": return <RentabilidadeView />;
      case "stock":          return <StockView />;
      case "configuracoes":  return <ConfiguracoesView />;
      default:               return <FrotasView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        onSettingsClick={() => setActiveMenu("configuracoes")}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
