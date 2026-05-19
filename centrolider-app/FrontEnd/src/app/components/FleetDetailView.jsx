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
  RotateCcw,
  Phone,
  Mail,
  User,
  AlertCircle,
  Wrench,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AddVehicleModal } from "./AddVehicleModal";
import { AddExpenseStockModal } from "./AddExpenseStockModal";
import { AddRevenueModal } from "./AddRevenueModal";
import { EditVehicleModal } from "./EditVehicleModal";
import { AddAttachmentModal } from "./AddAttachmentModal";
import { FleetRentabilidadeModal } from "./FleetRentabilidadeModal";
import { VehicleDetailView } from "./VehicleDetailView";
import { api } from "../../services/api";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT");
};

export function FleetDetailView({ fleet, onBack }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Modal visibility
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isRentabilidadeOpen, setIsRentabilidadeOpen] = useState(false);

  // Row-action modals — keyed by target vehicle
  const [actionVehicle, setActionVehicle] = useState(null);
  const [activeAction, setActiveAction] = useState(null); // 'edit' | 'expense' | 'revenue' | 'attachment' | null
  const [notifications, setNotifications] = useState([]);

  const openAction = (vehicle, action) => {
    setActionVehicle(vehicle);
    setActiveAction(action);
  };
  const closeAction = () => {
    setActionVehicle(null);
    setActiveAction(null);
  };

  useEffect(() => {
    if (!fleet?._id) return;
    setLoading(true);
    api.getVehicles({ frotaId: fleet._id })
      .then(setVehicles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [fleet?._id]);

  useEffect(() => {
    if (!fleet?._id) return;
    api.getNotifications()
      .then(({ notifications: all }) => {
        setNotifications(
          (all || []).filter((n) => n.frotaId && String(n.frotaId) === String(fleet._id))
        );
      })
      .catch(() => {});
  }, [fleet?._id]);

  const handleVehicleUpdated = (updated) => {
    setVehicles((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
    if (selectedVehicle?._id === updated._id) setSelectedVehicle(updated);
  };

  // --- Save handlers ---

  const handleSaveVehicle = async (data) => {
    const created = await api.createVehicle({ ...data, frotaId: fleet._id });
    setVehicles((prev) => [...prev, created]);
    setIsAddVehicleOpen(false);
  };

  const handleSaveEdit = async (data) => {
    const updated = await api.updateVehicle(actionVehicle._id, data);
    handleVehicleUpdated(updated);
    closeAction();
  };

  const handleSaveExpense = async (data) => {
    const MAINTENANCE_TYPES = ["manutencao", "reparacao"];
    const valor = parseFloat(data.valor);
    await api.createExpense({
      vehicleId: actionVehicle._id,
      tipo: data.tipo,
      valor,
      data: data.data,
      descricao: data.descricao,
    });
    if (MAINTENANCE_TYPES.includes(data.tipo)) {
      const updated = await api.addMaintenance(actionVehicle._id, {
        data: data.data,
        descricao: data.descricao || data.tipo,
        custo: valor,
        kms: data.kms ? parseInt(data.kms) : undefined,
        oficina: data.oficina || undefined,
        materiaisUsados: data.materiaisUsados?.map((i) => i.nome) || [],
      });
      handleVehicleUpdated(updated);
    }
    if (data.materiaisUsados?.length > 0) {
      api.consumeStock({
        vehicleId: actionVehicle._id,
        matricula: actionVehicle.matricula,
        modelo: actionVehicle.modelo,
        data: data.data,
        descricao: data.descricao || data.tipo,
        items: data.materiaisUsados.map((m) => ({
          stockItemId: m._isCustom ? null : m._id,
          nome: m.nome,
          categoria: m.categoria,
          quantidade: m.quantidade,
        })),
      }).catch(console.error);
    }
  };

  const handleSaveRevenue = async (data) => {
    await api.createRevenue({
      vehicleId: actionVehicle._id,
      tipo: data.tipo,
      valor: parseFloat(data.valor),
      data: data.data,
      descricao: data.descricao,
    });
  };

  const handleSaveAttachment = async (formData) => {
    const updated = await api.addAttachment(actionVehicle._id, formData);
    handleVehicleUpdated(updated);
  };

  const handleArchiveToggle = (vehicle) => {
    const isInativo = vehicle.status === "Inativo";
    const msg = isInativo
      ? `Ativar a viatura ${vehicle.matricula}? O estado será alterado para Operacional.`
      : `Arquivar a viatura ${vehicle.matricula}? O estado será alterado para Inativo.`;
    if (!window.confirm(msg)) return;
    api.updateVehicle(vehicle._id, { status: isInativo ? "Operacional" : "Inativo" })
      .then(handleVehicleUpdated)
      .catch((err) => alert(err.message));
  };

  if (selectedVehicle) {
    return (
      <VehicleDetailView
        vehicle={selectedVehicle}
        onBack={() => setSelectedVehicle(null)}
        onVehicleUpdated={handleVehicleUpdated}
      />
    );
  }

  const filtered = vehicles.filter((v) =>
    v.matricula.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo.toLowerCase().includes(search.toLowerCase())
  );

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
          <h2 className="text-3xl font-bold text-gray-900">{fleet?.name}</h2>
          <p className="text-gray-600 mt-1">{fleet?.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700">
            <Download className="w-4 h-4" />
            Exportar Dados
          </button>
          <button
            onClick={() => setIsRentabilidadeOpen(true)}
            className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
          >
            <TrendingUp className="w-4 h-4" />
            Rentabilidade da Frota
          </button>
          <button
            onClick={() => setIsAddVehicleOpen(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar Viatura
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table Section */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por matrícula ou modelo..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="px-6 py-8 text-center text-red-600">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400">
                {search ? "Nenhum veículo encontrado." : "Esta frota não tem veículos."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Matrícula</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Modelo</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">KM</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Próxima Revisão</th>
                      <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((vehicle) => (
                      <tr key={vehicle._id} className="hover:bg-gray-50 transition-colors">
                        <td
                          className="px-4 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          <span className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                            {vehicle.matricula}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">{vehicle.modelo}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.km?.toLocaleString("pt-PT")} km
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            vehicle.status === "Operacional"
                              ? "bg-green-100 text-green-700"
                              : vehicle.status === "Manutenção"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {fmtDate(vehicle.proximaRevisao)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openAction(vehicle, "edit")}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar Viatura"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openAction(vehicle, "expense")}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Registar Despesa"
                            >
                              <TrendingDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openAction(vehicle, "revenue")}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Adicionar Ganho"
                            >
                              <Euro className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openAction(vehicle, "attachment")}
                              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Anexar Documento"
                            >
                              <Paperclip className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleArchiveToggle(vehicle)}
                              className={`p-2 rounded-lg transition-colors ${
                                vehicle.status === "Inativo"
                                  ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                              }`}
                              title={vehicle.status === "Inativo" ? "Ativar Viatura" : "Arquivar Viatura"}
                            >
                              {vehicle.status === "Inativo"
                                ? <RotateCcw className="w-4 h-4" />
                                : <Archive className="w-4 h-4" />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactos</h3>
            {fleet?.contactos?.length > 0 ? (
              <div className="space-y-4">
                {fleet.contactos.map((contact, i) => (
                  <div key={i} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{contact.nome}</p>
                        <p className="text-sm text-gray-600">{contact.cargo}</p>
                      </div>
                    </div>
                    {contact.telefone && (
                      <a href={`tel:${contact.telefone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                        <Phone className="w-4 h-4" />{contact.telefone}
                      </a>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 break-all mt-1">
                        <Mail className="w-4 h-4 flex-shrink-0" />{contact.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sem contactos registados.</p>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Resumo Rápido</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Viaturas</span>
                  <span className="font-semibold text-gray-900">{vehicles.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Operacionais</span>
                  <span className="font-semibold text-green-600">
                    {vehicles.filter((v) => v.status === "Operacional").length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Em Manutenção</span>
                  <span className="font-semibold text-orange-600">
                    {vehicles.filter((v) => v.status === "Manutenção").length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Inativos</span>
                  <span className="font-semibold text-red-600">
                    {vehicles.filter((v) => v.status === "Inativo").length}
                  </span>
                </div>
                {fleet?.orcamentoPneus != null && (
                  <>
                    <div className="my-2 border-t border-gray-100" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Orçamento Pneus</span>
                      <span className="font-semibold text-gray-900">{fleet.orcamentoPneus} un.</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Alertas ({notifications.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                        n.severity === "high"
                          ? "bg-red-50 border border-red-100 text-red-700"
                          : n.type === "upcoming"
                          ? "bg-blue-50 border border-blue-100 text-blue-700"
                          : "bg-orange-50 border border-orange-100 text-orange-700"
                      }`}
                    >
                      {n.type === "upcoming"
                        ? <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        : <Wrench className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                      <span className="leading-relaxed">{n.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onSave={handleSaveVehicle}
      />

      <FleetRentabilidadeModal
        isOpen={isRentabilidadeOpen}
        onClose={() => setIsRentabilidadeOpen(false)}
        fleet={fleet}
        vehicles={vehicles}
      />

      <EditVehicleModal
        isOpen={activeAction === "edit"}
        onClose={closeAction}
        onSave={handleSaveEdit}
        vehicle={actionVehicle}
      />

      <AddExpenseStockModal
        isOpen={activeAction === "expense"}
        onClose={closeAction}
        onSave={handleSaveExpense}
        vehicleId={actionVehicle?._id}
        vehicle={actionVehicle}
      />

      <AddRevenueModal
        isOpen={activeAction === "revenue"}
        onClose={closeAction}
        onSave={handleSaveRevenue}
        vehicleId={actionVehicle?._id}
      />

      <AddAttachmentModal
        isOpen={activeAction === "attachment"}
        onClose={closeAction}
        onSave={handleSaveAttachment}
        vehicleId={actionVehicle?._id}
      />
    </div>
  );
}
