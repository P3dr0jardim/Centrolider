import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { FrotasView } from "./components/FrotasView";
import { FrotaGlobalView } from "./components/FrotaGlobalView";
import { AgendaView } from "./components/AgendaView";
import { RentabilidadeView } from "./components/RentabilidadeView";
import { StockView } from "./components/StockView";

export default function App() {
  const [activeMenu, setActiveMenu] = useState("frotas");

  const renderContent = () => {
    switch (activeMenu) {
      case "frotas":
        return <FrotasView />;
      case "frota-global":
        return <FrotaGlobalView />;
      case "agenda":
        return <AgendaView />;
      case "rentabilidade":
        return <RentabilidadeView />;
      case "stock":
        return <StockView />;
      default:
        return <FrotasView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}