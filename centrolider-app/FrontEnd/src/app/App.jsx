import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { FrotasView } from "./components/FrotasView";
import { FrotaGlobalView } from "./components/FrotaGlobalView";
import { AgendaView } from "./components/AgendaView";
import { RentabilidadeView } from "./components/RentabilidadeView";
import { StockView } from "./components/StockView";
import { ConfiguracoesView } from "./components/ConfiguracoesView";
import { AtividadeView } from "./components/AtividadeView";
import { ManutencaoView } from "./components/ManutencaoView";
import { VehicleDetailView } from "./components/VehicleDetailView";
import { Login } from "./components/Login";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();
  const [activeMenu, setActiveMenu] = useState("frotas");
  const [globalVehicle, setGlobalVehicle] = useState(null);
  const [frotaGlobalFilter, setFrotaGlobalFilter] = useState("todas");

  const navigate = (menu, filter) => {
    setGlobalVehicle(null);
    setActiveMenu(menu);
    setFrotaGlobalFilter(menu === "frota-global" && filter ? filter : "todas");
  };

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
    if (globalVehicle) {
      return (
        <VehicleDetailView
          vehicle={globalVehicle}
          onBack={() => setGlobalVehicle(null)}
          onVehicleUpdated={(v) => setGlobalVehicle(v)}
        />
      );
    }
    switch (activeMenu) {
      case "frotas":        return <FrotasView onNavigate={navigate} onVehicleSelect={setGlobalVehicle} />;
      case "manutencao":    return <ManutencaoView />;
      case "frota-global":  return <FrotaGlobalView key={frotaGlobalFilter} initialStatusFilter={frotaGlobalFilter} />;
      case "agenda":        return <AgendaView />;
      case "rentabilidade": return <RentabilidadeView />;
      case "stock":          return <StockView />;
      case "configuracoes":  return <ConfiguracoesView />;
      case "atividade":      return <AtividadeView />;
      default:               return <FrotasView onNavigate={navigate} onVehicleSelect={setGlobalVehicle} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeMenu={activeMenu}
        onMenuChange={(menu) => { setGlobalVehicle(null); setActiveMenu(menu); setFrotaGlobalFilter("todas"); }}
        onSettingsClick={() => { setGlobalVehicle(null); setActiveMenu("configuracoes"); }}
        onVehicleSelect={setGlobalVehicle}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
