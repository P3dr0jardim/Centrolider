import {
  ArrowLeft,
  Edit,
  Plus,
  TrendingUp,
  User,
  Gauge,
  Euro,
  Wrench,
  Calendar,
  Package,
  FileText,
  Paperclip,
  FileImage,
  File,
  Download,
  Pencil,
  Trash2,
  Search,
  Archive,
  ArchiveRestore,
  Check,
  X as XIcon,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

function matLabel(m) {
  if (!m) return "";
  if (typeof m === "string") return m;
  return m.quantidade && m.quantidade > 1 ? `${m.nome} x${m.quantidade}` : m.nome;
}
import { AddExpenseStockModal } from "./AddExpenseStockModal";
import { AddRevenueModal } from "./AddRevenueModal";
import { AddAttachmentModal } from "./AddAttachmentModal";
import { EditVehicleModal } from "./EditVehicleModal";
import { EditExpenseModal } from "./EditExpenseModal";
import { EditRevenueModal } from "./EditRevenueModal";
import { EditMaintenanceModal } from "./EditMaintenanceModal";
import { MaintenanceDetailModal } from "./MaintenanceDetailModal";
import { api } from "../../services/api";
import { openAttachment } from "../utils/openAttachment";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT");
};

const fmtNum = (n) => (n != null ? Number(n).toLocaleString("pt-PT") : "—");

const MAINTENANCE_TYPES = ["manutencao", "reparacao"];

function AttachmentIcon({ mimetype }) {
  if (mimetype === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />;
  if (mimetype?.startsWith("image/")) return <FileImage className="w-5 h-5 text-blue-500" />;
  return <File className="w-5 h-5 text-gray-400" />;
}

const fmtSize = (b) => {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

export function VehicleDetailView({ vehicle, onBack, onVehicleUpdated }) {
  const [vehicleData, setVehicleData] = useState(vehicle);
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingRevenue, setEditingRevenue] = useState(null);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [viewingMaintenance, setViewingMaintenance] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [maintSearch, setMaintSearch] = useState("");
  const [editingAttId, setEditingAttId] = useState(null);  // attachment being edited
  const [editAttForm, setEditAttForm] = useState({});      // { originalName, description, data }
  const [savingAtt, setSavingAtt] = useState(false);
  const [showArchivedDocs, setShowArchivedDocs] = useState(false);
  const [archivingId, setArchivingId] = useState(null);

  useEffect(() => {
    setVehicleData(vehicle);
  }, [vehicle?._id]);

  useEffect(() => {
    if (activeTab !== "historico-financeiro" || !vehicleData?._id) return;
    setTxLoading(true);
    Promise.all([
      api.getExpenses({ vehicleId: vehicleData._id }),
      api.getRevenues({ vehicleId: vehicleData._id }),
    ])
      .then(([exp, rev]) => { setExpenses(exp); setRevenues(rev); })
      .catch(console.error)
      .finally(() => setTxLoading(false));
  }, [activeTab, vehicleData?._id]);

  const handleDownloadAttachment = useCallback(async (att) => {
    setDownloadingId(att._id);
    try {
      await openAttachment(vehicleData._id, att);
    } catch (err) {
      alert(err.message);
    } finally {
      setDownloadingId(null);
    }
  }, [vehicleData._id]);

  if (!vehicleData) return null;

  const handleSaveEdit = async (data) => {
    const updated = await api.updateVehicle(vehicleData._id, data);
    setVehicleData(updated);
    if (onVehicleUpdated) onVehicleUpdated(updated);
    setIsEditModalOpen(false);
  };

  const handleSaveExpense = async (data) => {
    const valor = parseFloat(data.valor);
    const expense = await api.createExpense({
      vehicleId: vehicleData._id,
      tipo: data.tipo,
      valor,
      data: data.data,
      descricao: data.descricao,
    });
    setExpenses((prev) => [expense, ...prev]);

    let currentVehicle = vehicleData;
    let maintenanceRecordId = null;
    if (MAINTENANCE_TYPES.includes(data.tipo)) {
      const updated = await api.addMaintenance(vehicleData._id, {
        data: data.data,
        descricao: data.descricao || data.tipo,
        custo: valor,
        kms: data.kms ? parseInt(data.kms) : undefined,
        oficina: data.oficina || undefined,
        materiaisUsados: data.materiaisUsados || [],
        custoAdicional: data.custoAdicional || [],
      });
      currentVehicle = updated;
      setVehicleData(updated);
      if (onVehicleUpdated) onVehicleUpdated(updated);
      maintenanceRecordId = updated.historicoManutencao[updated.historicoManutencao.length - 1]?._id;
    }

    if (data.materiaisUsados?.length > 0) {
      api.consumeStock({
        vehicleId: vehicleData._id,
        matricula: vehicleData.matricula,
        modelo: vehicleData.modelo,
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

    if (data.attachmentFile) {
      const attachFd = new FormData();
      attachFd.append("file", data.attachmentFile);
      if (maintenanceRecordId) attachFd.append("manutencaoId", String(maintenanceRecordId));
      attachFd.append("data", data.data);
      const updatedWithAtt = await api.addAttachment(currentVehicle._id, attachFd);
      setVehicleData(updatedWithAtt);
      if (onVehicleUpdated) onVehicleUpdated(updatedWithAtt);
    }
  };

  const handleSaveRevenue = async (data) => {
    const revenue = await api.createRevenue({
      vehicleId: vehicleData._id,
      tipo: data.tipo,
      valor: parseFloat(data.valor),
      data: data.data,
      descricao: data.descricao,
    });
    setRevenues((prev) => [revenue, ...prev]);
  };

  const handleUpdateExpense = async (id, data) => {
    const updated = await api.updateExpense(id, data);
    setExpenses((prev) => prev.map((e) => (e._id === id ? updated : e)));
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Eliminar esta despesa?")) return;
    await api.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e._id !== id));
  };

  const handleUpdateRevenue = async (id, data) => {
    const updated = await api.updateRevenue(id, data);
    setRevenues((prev) => prev.map((r) => (r._id === id ? updated : r)));
  };

  const handleDeleteRevenue = async (id) => {
    if (!window.confirm("Eliminar este ganho?")) return;
    await api.deleteRevenue(id);
    setRevenues((prev) => prev.filter((r) => r._id !== id));
  };

  const handleUpdateMaintenance = async (recordId, data) => {
    const { attachmentFile, ...rest } = data;
    let updated = await api.updateMaintenance(vehicleData._id, recordId, rest);
    if (attachmentFile) {
      const attachFd = new FormData();
      attachFd.append("file", attachmentFile);
      attachFd.append("manutencaoId", String(recordId));
      attachFd.append("data", rest.data);
      updated = await api.addAttachment(vehicleData._id, attachFd);
    }
    setVehicleData(updated);
    if (onVehicleUpdated) onVehicleUpdated(updated);
  };

  const handleDeleteMaintenance = async (recordId) => {
    if (!window.confirm("Eliminar este registo de manutenção?")) return;
    const updated = await api.deleteMaintenance(vehicleData._id, recordId);
    setVehicleData(updated);
    if (onVehicleUpdated) onVehicleUpdated(updated);
  };

  const handleSaveAttachment = async (formData) => {
    const updated = await api.addAttachment(vehicleData._id, formData);
    setVehicleData(updated);
    if (onVehicleUpdated) onVehicleUpdated(updated);
  };

  const openEditAtt = (att) => {
    setEditingAttId(att._id);
    setEditAttForm({
      originalName: att.originalName || att.filename || "",
      description: att.description || "",
      data: att.data ? new Date(att.data).toISOString().slice(0, 10) : "",
    });
  };

  const handleSaveAttMeta = async () => {
    setSavingAtt(true);
    try {
      const updated = await api.updateAttachmentMeta(vehicleData._id, editingAttId, editAttForm);
      setVehicleData(updated);
      if (onVehicleUpdated) onVehicleUpdated(updated);
      setEditingAttId(null);
    } finally {
      setSavingAtt(false);
    }
  };

  const handleToggleArchive = async (att) => {
    setArchivingId(att._id);
    try {
      const updated = await api.toggleArchiveAttachment(vehicleData._id, att._id);
      setVehicleData(updated);
      if (onVehicleUpdated) onVehicleUpdated(updated);
    } finally {
      setArchivingId(null);
    }
  };

  const totalReceitas = revenues.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = expenses.reduce((s, e) => s + e.valor, 0);
  const saldoLiquido = totalReceitas - totalDespesas;

  const custoManutencao = (vehicleData.historicoManutencao || []).reduce(
    (s, r) => s + (r.custo || 0),
    0
  );

  const allMaintenance = [...(vehicleData.historicoManutencao || [])].sort(
    (a, b) => new Date(b.data) - new Date(a.data)
  );

  const maintenance = useMemo(() => {
    if (!maintSearch.trim()) return allMaintenance;
    const q = maintSearch.toLowerCase();
    return allMaintenance.filter(
      (r) =>
        r.descricao?.toLowerCase().includes(q) ||
        r.oficina?.toLowerCase().includes(q) ||
        (r.materiaisUsados || []).some((m) => matLabel(m).toLowerCase().includes(q))
    );
  }, [allMaintenance, maintSearch]);

  const allAttachments = [...(vehicleData.attachments || [])].sort(
    (a, b) => new Date(b.data || b.createdAt) - new Date(a.data || a.createdAt)
  );
  const attachments        = allAttachments.filter((a) => !a.archived);
  const archivedAttachments = allAttachments.filter((a) => a.archived);

  const statusColor =
    vehicleData.status === "Operacional"
      ? "bg-green-100 text-green-700"
      : vehicleData.status === "Manutenção"
      ? "bg-orange-100 text-orange-700"
      : "bg-red-100 text-red-700";

  const TABS = [
    { id: "visao-geral",          label: "Visão Geral" },
    { id: "historico-financeiro", label: "Histórico Financeiro" },
    { id: "manutencao-stock",     label: "Manutenção & Stock" },
    { id: "documentos",           label: `Documentos${allAttachments.length > 0 ? ` (${attachments.length}${archivedAttachments.length > 0 ? `+${archivedAttachments.length}` : ""})` : ""}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Voltar à Frota</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{vehicleData.matricula}</h1>
              <p className="text-gray-600 mt-1">{vehicleData.modelo}</p>
              {vehicleData.numeroContrato && (
                <p className="text-xs text-gray-400 mt-0.5">Contrato: {vehicleData.numeroContrato}</p>
              )}
            </div>
            <span className={`px-4 py-2 font-semibold rounded-full ${statusColor}`}>
              {vehicleData.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700"
            >
              <Edit className="w-4 h-4" />
              Editar Dados
            </button>
            <button
              onClick={() => setIsRevenueModalOpen(true)}
              className="px-4 py-2.5 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Adicionar Ganho
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Wrench className="w-4 h-4" />
              Registar Despesa / Manutenção
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Condutor</p>
              <p className="text-lg font-semibold text-gray-900">{vehicleData.condutor || "—"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Gauge className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quilometragem Atual</p>
              <p className="text-2xl font-bold text-gray-900">{fmtNum(vehicleData.km)} km</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rentabilidade/mês</p>
              <p className="text-2xl font-bold text-green-600">
                {vehicleData.rentabilidade != null ? `€${fmtNum(vehicleData.rentabilidade)}` : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Euro className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Custo Total Manutenção</p>
              <p className="text-2xl font-bold text-gray-900">€{fmtNum(custoManutencao.toFixed(2))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Encargos Fixos row — only shown when at least one value is set */}
      {(vehicleData.leasing != null || vehicleData.seguroValor != null || vehicleData.iuc != null) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vehicleData.leasing != null && (
            <div className="bg-white rounded-xl border border-indigo-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Euro className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Leasing</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    €{Number(vehicleData.leasing).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400">por mês</p>
                </div>
              </div>
            </div>
          )}
          {vehicleData.seguroValor != null && (
            <div className="bg-white rounded-xl border border-purple-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Euro className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seguro</p>
                  <p className="text-2xl font-bold text-purple-700">
                    €{Number(vehicleData.seguroValor).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400">por mês</p>
                </div>
              </div>
            </div>
          )}
          {vehicleData.iuc != null && (
            <div className="bg-white rounded-xl border border-amber-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Euro className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">IUC</p>
                  <p className="text-2xl font-bold text-amber-700">
                    €{Number(vehicleData.iuc).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400">por ano</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Tab 1 — Visão Geral */}
          {activeTab === "visao-geral" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes Técnicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {[
                  ["Modelo",             vehicleData.modelo],
                  ["N.º Contrato",       vehicleData.numeroContrato],
                  ["Condutor",           vehicleData.condutor],
                  ["Combustível",        vehicleData.combustivel],
                  ["Cilindrada",         vehicleData.cilindrada],
                  ["Potência",           vehicleData.potencia],
                  ["Cor",                vehicleData.cor],
                  ["N.º de Quadro",      vehicleData.numeroQuadro],
                  ["Data de Entrega",    fmtDate(vehicleData.dataEntrega)],
                  ["Data de Matrícula",  fmtDate(vehicleData.dataMatricula)],
                  ["Próxima Inspeção",   fmtDate(vehicleData.proximaRevisao)],
                  ["Validade Seguro",    fmtDate(vehicleData.seguro)],
                  ["Validade Contrato",  fmtDate(vehicleData.validadeContrato)],
                  ["Intervalo Revisão",  vehicleData.intervaloRevisao ? `${fmtNum(vehicleData.intervaloRevisao)} km` : null],
                  ["KMs Última Revisão", vehicleData.kmsUltimaRevisao ? `${fmtNum(vehicleData.kmsUltimaRevisao)} km` : null],
                  ["Tipo de Pneu",       vehicleData.tipoPneu],
                  ["Pneu Original",      vehicleData.pneuOriginal],
                  ["Pneu Atual",         vehicleData.pneuAtual],
                ]
                  .filter(([, v]) => v != null && v !== "" && v !== "—")
                  .map(([label, value]) => (
                    <div key={label} className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-900 text-right max-w-[60%]">{value}</span>
                    </div>
                  ))}
              </div>

            {/* Encargos Fixos */}
            {(vehicleData.leasing != null || vehicleData.seguroValor != null || vehicleData.iuc != null) && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Encargos Fixos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {vehicleData.leasing != null && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                      <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">Leasing</p>
                      <p className="text-xl font-bold text-indigo-900">
                        €{Number(vehicleData.leasing).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-indigo-500 mt-0.5">por mês</p>
                    </div>
                  )}
                  {vehicleData.seguroValor != null && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">Seguro</p>
                      <p className="text-xl font-bold text-purple-900">
                        €{Number(vehicleData.seguroValor).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-purple-500 mt-0.5">por mês</p>
                    </div>
                  )}
                  {vehicleData.iuc != null && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">IUC</p>
                      <p className="text-xl font-bold text-amber-900">
                        €{Number(vehicleData.iuc).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-amber-500 mt-0.5">por ano</p>
                    </div>
                  )}
                </div>
                {vehicleData.valoresFinanceirosEm && (
                  <p className="text-xs text-gray-400 mt-3">
                    Valores confirmados em {new Date(vehicleData.valoresFinanceirosEm).toLocaleDateString("pt-PT")}
                  </p>
                )}
              </div>
            )}
            </div>
          )}

          {/* Tab 2 — Histórico Financeiro */}
          {activeTab === "historico-financeiro" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Transações</h3>
                <div className="flex items-center gap-6 text-sm">
                  <span>Receitas: <span className="font-semibold text-green-600">€{totalReceitas.toFixed(2)}</span></span>
                  <span>Despesas: <span className="font-semibold text-red-600">€{totalDespesas.toFixed(2)}</span></span>
                  <span>Saldo: <span className={`font-semibold ${saldoLiquido >= 0 ? "text-green-600" : "text-red-600"}`}>€{saldoLiquido.toFixed(2)}</span></span>
                </div>
              </div>

              {txLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : expenses.length === 0 && revenues.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>Sem registos financeiros para esta viatura.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Categoria</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Descrição</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Valor</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        ...revenues.map((r) => ({ ...r, _kind: "Receita" })),
                        ...expenses.map((e) => ({ ...e, _kind: "Despesa" })),
                      ]
                        .sort((a, b) => new Date(b.data) - new Date(a.data))
                        .map((tx) => (
                          <tr key={tx._id} className="hover:bg-gray-50 group">
                            <td className="px-4 py-3 text-sm text-gray-700">{fmtDate(tx.data)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                tx._kind === "Receita" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                                {tx._kind}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 capitalize">{tx.tipo}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div>{tx.descricao || "—"}</div>
                              {tx.kms && <div className="text-xs text-gray-400">{fmtNum(tx.kms)} km</div>}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right font-semibold ${
                              tx._kind === "Receita" ? "text-green-600" : "text-red-600"
                            }`}>
                              {tx._kind === "Receita" ? "+" : "-"}€{tx.valor.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                <button
                                  onClick={() => (tx._kind === "Despesa" ? setEditingExpense(tx) : setEditingRevenue(tx))}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => (tx._kind === "Despesa" ? handleDeleteExpense(tx._id) : handleDeleteRevenue(tx._id))}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Histórico de alterações de encargos fixos */}
              {(vehicleData.historicoFinanceiro?.length ?? 0) > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterações de Encargos Fixos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Campo</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Valor Anterior</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Valor Novo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {[...(vehicleData.historicoFinanceiro || [])]
                          .sort((a, b) => new Date(b.data) - new Date(a.data))
                          .map((entry, i) => {
                            const campoLabel = entry.campo === "leasing" ? "Leasing" : entry.campo === "seguroValor" ? "Seguro" : entry.campo === "iuc" ? "IUC" : entry.campo;
                            const colorCls = entry.campo === "leasing" ? "bg-indigo-100 text-indigo-700" : entry.campo === "seguroValor" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700";
                            return (
                              <tr key={entry._id || i} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{fmtDate(entry.data)}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colorCls}`}>{campoLabel}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-500">
                                  {entry.valorAnterior != null ? `€${Number(entry.valorAnterior).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}` : "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                  €{Number(entry.valorNovo).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3 — Manutenção & Stock */}
          {activeTab === "manutencao-stock" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Histórico de Manutenção ({maintenance.length}{maintSearch ? ` de ${allMaintenance.length}` : ""} registos)
                </h3>
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filtrar manutenções…"
                    value={maintSearch}
                    onChange={(e) => setMaintSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {maintenance.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Wrench className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>Sem registos de manutenção.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">KMs</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Descrição</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Oficina</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Materiais</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Custo</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {maintenance.map((rec, i) => (
                        <tr key={rec._id || i} className="hover:bg-gray-50 group">
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {fmtDate(rec.data)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {rec.kms ? `${fmtNum(rec.kms)} km` : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{rec.descricao}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{rec.oficina || "—"}</td>
                          <td className="px-4 py-3">
                            {rec.materiaisUsados?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {rec.materiaisUsados.map((m, j) => (
                                  <span key={j} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                    <Package className="w-3 h-3" />{matLabel(m)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                            {rec.custo > 0 ? `€${rec.custo.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                              <button
                                onClick={() => setViewingMaintenance(rec)}
                                className="px-2.5 py-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors whitespace-nowrap"
                                title="Ver detalhes"
                              >
                                Ver detalhes
                              </button>
                              <button
                                onClick={() => setEditingMaintenance(rec)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMaintenance(rec._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          )}

          {/* Tab 4 — Documentos */}
          {activeTab === "documentos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Documentos Anexados ({attachments.length})
                </h3>
                <button
                  onClick={() => setIsAttachmentModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium text-sm"
                >
                  <Paperclip className="w-4 h-4" />
                  Adicionar Documento
                </button>
              </div>

              {attachments.length === 0 && archivedAttachments.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Paperclip className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>Sem documentos anexados.</p>
                  <p className="text-sm mt-1">Clique em "Adicionar Documento" para anexar um ficheiro.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div key={att._id} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Main row */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0">
                          <AttachmentIcon mimetype={att.mimetype} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{att.originalName || att.filename}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {att.manutencaoId && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                <Wrench className="w-3 h-3" />
                                Manutenção
                              </span>
                            )}
                            {att.description && <span className="text-xs text-gray-600">{att.description}</span>}
                            {att.description && att.data && <span className="text-gray-300 text-xs">·</span>}
                            {att.data && <span className="text-xs text-gray-500">{fmtDate(att.data)}</span>}
                            {att.size && <span className="text-xs text-gray-400 ml-auto">{fmtSize(att.size)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => editingAttId === att._id ? setEditingAttId(null) : openEditAtt(att)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleArchive(att)}
                            disabled={archivingId === att._id}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Arquivar"
                          >
                            {archivingId === att._id
                              ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              : <Archive className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(att)}
                            disabled={downloadingId === att._id}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Abrir ficheiro"
                          >
                            {downloadingId === att._id
                              ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              : <Download className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Inline edit form */}
                      {editingAttId === att._id && (
                        <div className="px-4 pb-4 pt-3 bg-blue-50 border-t border-blue-100 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Nome do ficheiro</label>
                              <input
                                type="text"
                                value={editAttForm.originalName}
                                onChange={(e) => setEditAttForm((f) => ({ ...f, originalName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Data</label>
                              <input
                                type="date"
                                value={editAttForm.data}
                                onChange={(e) => setEditAttForm((f) => ({ ...f, data: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                            <input
                              type="text"
                              value={editAttForm.description}
                              onChange={(e) => setEditAttForm((f) => ({ ...f, description: e.target.value }))}
                              placeholder="Ex: Contrato de leasing, seguro, etc."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingAttId(null)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <XIcon className="w-4 h-4" />
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveAttMeta}
                              disabled={savingAtt}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                            >
                              <Check className="w-4 h-4" />
                              {savingAtt ? "A guardar…" : "Guardar"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Archived section */}
              {archivedAttachments.length > 0 && (
                <div className="border border-dashed border-gray-300 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowArchivedDocs((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      <span className="font-medium">Arquivados ({archivedAttachments.length})</span>
                    </div>
                    <span className="text-xs text-gray-400">{showArchivedDocs ? "Ocultar" : "Ver"}</span>
                  </button>

                  {showArchivedDocs && (
                    <div className="divide-y divide-gray-100">
                      {archivedAttachments.map((att) => (
                        <div key={att._id} className="flex items-center gap-4 p-4 bg-gray-50 opacity-70">
                          <div className="flex-shrink-0">
                            <AttachmentIcon mimetype={att.mimetype} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate line-through">{att.originalName || att.filename}</p>
                            {att.description && <p className="text-xs text-gray-400 mt-0.5">{att.description}</p>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleArchive(att)}
                              disabled={archivingId === att._id}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                              title="Restaurar"
                            >
                              {archivingId === att._id
                                ? <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                : <ArchiveRestore className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadAttachment(att)}
                              disabled={downloadingId === att._id}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
                              title="Abrir ficheiro"
                            >
                              {downloadingId === att._id
                                ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                : <Download className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <EditVehicleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        vehicle={vehicleData}
      />
      <AddRevenueModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        onSave={handleSaveRevenue}
        vehicleId={vehicleData._id}
      />
      <AddExpenseStockModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        vehicleId={vehicleData._id}
        vehicle={vehicleData}
      />
      <AddAttachmentModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        onSave={handleSaveAttachment}
        vehicleId={vehicleData._id}
      />
      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        onSave={handleUpdateExpense}
        expense={editingExpense}
      />
      <EditRevenueModal
        isOpen={!!editingRevenue}
        onClose={() => setEditingRevenue(null)}
        onSave={handleUpdateRevenue}
        revenue={editingRevenue}
      />
      <EditMaintenanceModal
        isOpen={!!editingMaintenance}
        onClose={() => setEditingMaintenance(null)}
        onSave={handleUpdateMaintenance}
        record={editingMaintenance}
      />
      <MaintenanceDetailModal
        isOpen={!!viewingMaintenance}
        onClose={() => setViewingMaintenance(null)}
        record={viewingMaintenance}
        vehicle={vehicleData}
        attachments={allAttachments}
      />
    </div>
  );
}
