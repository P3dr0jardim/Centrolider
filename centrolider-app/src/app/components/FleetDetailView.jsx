import {
  ArrowLeft,
  Download,
  Plus,
  TrendingUp,
  Search,
  Edit,
  Euro,
  TrendingDown,
  Paperclip,
  Archive,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { useState } from "react";
import { AddVehicleModal } from "./AddVehicleModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { AddRevenueModal } from "./AddRevenueModal";
import { VehicleDetailView } from "./VehicleDetailView";

const mockVehicles = [
  {
    id: "VH-001",
    matricula: "AB-12-CD",
    modelo: "Mercedes Sprinter 316",
    ano: 2022,
    condutor: "João Silva",
    km: 45320,
    status: "Operacional",
    proximaRevisao: "2026-04-15",
    seguro: "Válido até 2026-12-31",
  },
  {
    id: "VH-002",
    matricula: "EF-34-GH",
    modelo: "Volkswagen Crafter 2.0 TDI",
    ano: 2021,
    condutor: "Maria Santos",
    km: 67890,
    status: "Manutenção",
    proximaRevisao: "2026-03-20",
    seguro: "Válido até 2026-11-15",
  },
  {
    id: "VH-003",
    matricula: "IJ-56-KL",
    modelo: "Renault Master L3H2",
    ano: 2023,
    condutor: "Pedro Costa",
    km: 32100,
    status: "Operacional",
    proximaRevisao: "2026-05-10",
    seguro: "Válido até 2027-01-20",
  },
  {
    id: "VH-004",
    matricula: "MN-78-OP",
    modelo: "Ford Transit Custom",
    ano: 2020,
    condutor: "Ana Ferreira",
    km: 89450,
    status: "Operacional",
    proximaRevisao: "2026-03-05",
    seguro: "Válido até 2026-10-30",
  },
  {
    id: "VH-005",
    matricula: "QR-90-ST",
    modelo: "Fiat Ducato Maxi",
    ano: 2019,
    condutor: "-",
    km: 98200,
    status: "Inativo",
    proximaRevisao: "Expirada",
    seguro: "Válido até 2026-09-15",
  },
  {
    id: "VH-006",
    matricula: "UV-11-WX",
    modelo: "Mercedes Sprinter 319",
    ano: 2022,
    condutor: "Rui Alves",
    km: 28900,
    status: "Operacional",
    proximaRevisao: "2026-06-22",
    seguro: "Válido até 2027-02-10",
  },
];

const mockContacts = [
  {
    nome: "Carlos Mendes",
    cargo: "Gestor de Frota",
    telefone: "+351 912 345 678",
    email: "carlos.mendes@centrolider.pt",
  },
  {
    nome: "Sofia Rodrigues",
    cargo: "Coordenadora Logística",
    telefone: "+351 918 765 432",
    email: "sofia.rodrigues@centrolider.pt",
  },
];

export function FleetDetailView({ fleetName, fleetDescription, onBack }) {
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddRevenueModalOpen, setIsAddRevenueModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(undefined);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] =
    useState(undefined);

  const handleSaveVehicle = (vehicle) => {
    // Logic to save the vehicle
    console.log("Vehicle saved:", vehicle);
    setIsAddVehicleModalOpen(false);
  };

  const handleSaveExpense = (expense) => {
    // Logic to save the expense
    console.log("Expense saved:", expense);
    setIsAddExpenseModalOpen(false);
    setSelectedVehicleId(undefined);
  };

  const handleSaveRevenue = (revenue) => {
    // Logic to save the revenue
    console.log("Revenue saved:", revenue);
    setIsAddRevenueModalOpen(false);
    setSelectedVehicleId(undefined);
  };

  // If a vehicle is selected for detail view, show the vehicle detail page
  if (selectedVehicleForDetail) {
    return (
      <VehicleDetailView
        vehicleId={selectedVehicleForDetail.id}
        matricula={selectedVehicleForDetail.matricula}
        onBack={() => setSelectedVehicleForDetail(undefined)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar às Frotas</span>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{fleetName}</h2>
            <p className="text-gray-600 mt-1">{fleetDescription}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700">
            <Download className="w-4 h-4" />
            Exportar Dados
          </button>
          <button className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium">
            <TrendingUp className="w-4 h-4" />
            Rentabilidade da Frota
          </button>
          <button
            onClick={() => setIsAddVehicleModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar Viatura
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table Section - 3 columns */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por matrícula..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Matrícula
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Ano
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Condutor
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      KM
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Próxima Revisão
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vehicle.id}
                      </td>
                      <td
                        className="px-4 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() =>
                          setSelectedVehicleForDetail({
                            id: vehicle.id,
                            matricula: vehicle.matricula,
                          })
                        }
                      >
                        <span className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                          {vehicle.matricula}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {vehicle.modelo}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {vehicle.ano}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {vehicle.condutor}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {vehicle.km.toLocaleString()} km
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            vehicle.status === "Operacional"
                              ? "bg-green-100 text-green-700"
                              : vehicle.status === "Manutenção"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {vehicle.proximaRevisao}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setIsAddExpenseModalOpen(true);
                              setSelectedVehicleId(vehicle.id);
                            }}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Adicionar Despesa"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setIsAddRevenueModalOpen(true);
                              setSelectedVehicleId(vehicle.id);
                            }}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Adicionar Ganho"
                          >
                            <Euro className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Anexar Documento"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Arquivar Viatura"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Contacts Sidebar - 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contactos
            </h3>
            <div className="space-y-4">
              {mockContacts.map((contact, index) => (
                <div
                  key={index}
                  className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {contact.nome}
                      </p>
                      <p className="text-sm text-gray-600">{contact.cargo}</p>
                    </div>
                  </div>
                  <div className="space-y-2 ml-13">
                    <a
                      href={`tel:${contact.telefone}`}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{contact.telefone}</span>
                    </a>
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors break-all"
                    >
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span>{contact.email}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Resumo Rápido
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Viaturas</span>
                  <span className="font-semibold text-gray-900">
                    {mockVehicles.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Operacionais</span>
                  <span className="font-semibold text-green-600">
                    {
                      mockVehicles.filter((v) => v.status === "Operacional")
                        .length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Em Manutenção</span>
                  <span className="font-semibold text-orange-600">
                    {
                      mockVehicles.filter((v) => v.status === "Manutenção")
                        .length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Inativos</span>
                  <span className="font-semibold text-red-600">
                    {mockVehicles.filter((v) => v.status === "Inativo").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
      />
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => {
          setIsAddExpenseModalOpen(false);
          setSelectedVehicleId(undefined);
        }}
        onSave={handleSaveExpense}
        vehicleId={selectedVehicleId}
      />
      <AddRevenueModal
        isOpen={isAddRevenueModalOpen}
        onClose={() => {
          setIsAddRevenueModalOpen(false);
          setSelectedVehicleId(undefined);
        }}
        onSave={handleSaveRevenue}
        vehicleId={selectedVehicleId}
      />
    </div>
  );
}
