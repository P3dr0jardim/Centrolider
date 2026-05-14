import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import {
  Car, TrendingDown, TrendingUp, Truck, CalendarDays, Package,
  RefreshCw, ChevronLeft, ChevronRight, AlertCircle, Activity
} from "lucide-react";

const ENTIDADE_META = {
  Viatura:  { icon: Car,          color: "bg-blue-100 text-blue-600" },
  Despesa:  { icon: TrendingDown,  color: "bg-red-100 text-red-600" },
  Receita:  { icon: TrendingUp,    color: "bg-green-100 text-green-600" },
  Frota:    { icon: Truck,         color: "bg-purple-100 text-purple-600" },
  Agenda:   { icon: CalendarDays,  color: "bg-amber-100 text-amber-600" },
  Stock:    { icon: Package,       color: "bg-cyan-100 text-cyan-600" },
};

const ACAO_COLOR = {
  Adicionou: "bg-green-100 text-green-700",
  Agendou:   "bg-green-100 text-green-700",
  Criou:     "bg-green-100 text-green-700",
  Registou:  "bg-green-100 text-green-700",
  Consumiu:  "bg-orange-100 text-orange-700",
  Editou:    "bg-blue-100 text-blue-700",
  Eliminou:  "bg-red-100 text-red-700",
};

const ENTIDADES = ["Todas", "Viatura", "Frota", "Despesa", "Receita", "Agenda", "Stock"];
const PAGE_SIZE = 20;

function formatRelative(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)   return "Agora mesmo";
  if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Há ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  if (days === 1)  return "Ontem";
  if (days < 7)   return `Há ${days} dias`;
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

function formatFull(dateStr) {
  return new Date(dateStr).toLocaleString("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function AtividadeView() {
  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [entidade, setEntidade] = useState("Todas");
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: PAGE_SIZE,
        skip: page * PAGE_SIZE,
      };
      if (entidade !== "Todas") params.entidade = entidade;
      if (from) params.from = from;
      if (to)   params.to   = to;
      const data = await api.getLogs(params);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, entidade, from, to]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handleFilterChange(fn) {
    setPage(0);
    fn();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Atividade</h1>
            <p className="text-sm text-gray-500">{total} registos encontrados</p>
          </div>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-wrap gap-2">
          {ENTIDADES.map((e) => (
            <button
              key={e}
              onClick={() => handleFilterChange(() => setEntidade(e))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                entidade === e
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">De</label>
            <input
              type="date"
              value={from}
              onChange={(e) => handleFilterChange(() => setFrom(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Até</label>
            <input
              type="date"
              value={to}
              onChange={(e) => handleFilterChange(() => setTo(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {(from || to) && (
            <button
              onClick={() => handleFilterChange(() => { setFrom(""); setTo(""); })}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {error && (
          <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 border-b border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Activity className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhuma atividade registada</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log, idx) => {
              const meta = ENTIDADE_META[log.entidade] || { icon: Activity, color: "bg-gray-100 text-gray-600" };
              const Icon = meta.icon;
              const aColor = ACAO_COLOR[log.acao] || "bg-gray-100 text-gray-700";
              const initials = log.userName
                ? log.userName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
                : "?";

              return (
                <div
                  key={log._id || idx}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Entity icon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${aColor}`}>
                        {log.acao}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{log.entidade}</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-snug">{log.descricao}</p>
                  </div>

                  {/* User + time */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500 hidden sm:block">{log.userName}</span>
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                        {initials}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400" title={formatFull(log.data)}>
                      {formatRelative(log.data)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-500">
              Página {page + 1} de {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
