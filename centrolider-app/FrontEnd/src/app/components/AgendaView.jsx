import {
  ChevronLeft, ChevronRight, Plus,
  AlertTriangle, Calendar, Shield, Clock, FileText, Filter,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import { AddScheduleModal } from "./AddScheduleModal";
import { DayEventsModal, TIPO_CONFIG } from "./DayEventsModal";

const mesesNomes = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const toDateKey = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
};

const daysBetween = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);

export function AgendaView() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [vehicles, setVehicles] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayModal, setDayModal] = useState(null);     // 'YYYY-MM-DD' | null
  const [scheduleModal, setScheduleModal] = useState(null); // null | { date?, schedule?, prefill? }
  const [oficinaFilter, setOficinaFilter] = useState("");

  const TODAY = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayKey = useMemo(() => toDateKey(TODAY), [TODAY]);

  // Sync vehicle statuses based on active schedules (runs once on mount)
  useEffect(() => {
    api.syncVehicleStatuses().catch(console.error);
  }, []);

  // Load all vehicles once
  useEffect(() => {
    api.getVehicles().then(setVehicles).catch(console.error);
  }, []);

  // Load schedules for the displayed month
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const from = new Date(year, month, 1).toISOString().slice(0, 10);
    const to   = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    setLoading(true);
    api.getSchedules({ from, to })
      .then(setSchedules)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentDate]);

  const availableOficinas = useMemo(() => {
    const set = new Set();
    for (const s of schedules) {
      if (s.oficina) set.add(s.oficina);
    }
    return Array.from(set).sort();
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    if (!oficinaFilter) return schedules;
    return schedules.filter((s) => s.oficina === oficinaFilter);
  }, [schedules, oficinaFilter]);

  // Auto-events derived from vehicle expiry fields
  const autoEvents = useMemo(() => {
    const evs = [];
    for (const v of vehicles) {
      if (v.proximaRevisao) evs.push({ _auto: true, tipo: "revisao",  date: new Date(v.proximaRevisao),    matricula: v.matricula, modelo: v.modelo, vehicleId: v._id });
      if (v.seguro)         evs.push({ _auto: true, tipo: "seguro",   date: new Date(v.seguro),            matricula: v.matricula, modelo: v.modelo, vehicleId: v._id });
      if (v.validadeContrato) evs.push({ _auto: true, tipo: "contrato", date: new Date(v.validadeContrato), matricula: v.matricula, modelo: v.modelo, vehicleId: v._id });
    }
    return evs;
  }, [vehicles]);

  // Map of dateKey → events[] for the displayed month
  const eventsByDate = useMemo(() => {
    const map = {};
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (!oficinaFilter) {
      for (const ev of autoEvents) {
        if (ev.date.getFullYear() === year && ev.date.getMonth() === month) {
          const key = toDateKey(ev.date);
          if (!map[key]) map[key] = [];
          map[key].push(ev);
        }
      }
    }
    for (const s of filteredSchedules) {
      const start = new Date(s.dataInicio);
      start.setHours(0, 0, 0, 0);
      const end = s.dataFim ? new Date(s.dataFim) : new Date(s.dataInicio);
      end.setHours(0, 0, 0, 0);

      const cur = new Date(start);
      let guard = 0;
      while (cur <= end && guard < 366) {
        const key = toDateKey(cur);
        if (!map[key]) map[key] = [];
        if (!map[key].some((e) => !e._auto && e._id === s._id)) {
          map[key].push(s);
        }
        cur.setDate(cur.getDate() + 1);
        guard++;
      }
    }
    return map;
  }, [autoEvents, filteredSchedules, currentDate, oficinaFilter]);

  // Sidebar alerts: expiring within 30 days, or overdue
  const alerts = useMemo(() => {
    const seguros = [], revisoes = [], contratos = [], overdue = [];
    for (const v of vehicles) {
      const check = (date, tipo, campo) => {
        if (!date) return;
        const diff = daysBetween(new Date(date), TODAY);
        if (diff >= 0 && diff <= 30) {
          const target = tipo === "seguro" ? seguros : tipo === "revisao" ? revisoes : contratos;
          target.push({ ...v, dias: diff, dataLimite: date, tipo });
        } else if (diff < 0) {
          overdue.push({ ...v, atraso: Math.abs(diff), campo, tipo });
        }
      };
      check(v.seguro,           "seguro",   "Seguro");
      check(v.proximaRevisao,   "revisao",  "Revisão");
      check(v.validadeContrato, "contrato", "Contrato");
    }
    seguros.sort((a, b) => a.dias - b.dias);
    revisoes.sort((a, b) => a.dias - b.dias);
    contratos.sort((a, b) => a.dias - b.dias);
    overdue.sort((a, b) => b.atraso - a.atraso);
    return { seguros, revisoes, contratos, overdue };
  }, [vehicles, TODAY]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, isCurrentMonth: true });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ day: i, isCurrentMonth: false });
    return days;
  };

  const handleDayClick = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setDayModal(key);
  };

  const handleSaveSchedule = async (data) => {
    if (scheduleModal?.schedule) {
      const updated = await api.updateSchedule(scheduleModal.schedule._id, data);
      setSchedules((prev) => prev.map((s) => s._id === updated._id ? updated : s));
    } else {
      const created = await api.createSchedule(data);
      setSchedules((prev) => [...prev, created]);
    }
    setScheduleModal(null);
  };

  const handleDeleteSchedule = async (id) => {
    await api.deleteSchedule(id);
    setSchedules((prev) => prev.filter((s) => s._id !== id));
  };

  const days = getDaysInMonth();
  const MAX_PER_CELL = 2;

  const hasAlerts = alerts.seguros.length > 0 || alerts.revisoes.length > 0 ||
    alerts.contratos.length > 0 || alerts.overdue.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Agendamentos e Prazos</h2>
          <p className="text-gray-600 mt-1">Gestão de inspeções, seguros e manutenções</p>
        </div>
        <button
          onClick={() => setScheduleModal({ date: todayKey })}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Agendar Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Month navigation */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                  {mesesNomes[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {availableOficinas.length > 0 && (
                  <div className="relative flex items-center gap-1.5">
                    <Filter className={`w-4 h-4 flex-shrink-0 ${oficinaFilter ? "text-blue-600" : "text-gray-400"}`} />
                    <select
                      value={oficinaFilter}
                      onChange={(e) => setOficinaFilter(e.target.value)}
                      className={`text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-7 ${
                        oficinaFilter
                          ? "border-blue-400 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-300 bg-white text-gray-700"
                      }`}
                    >
                      <option value="">Todas as oficinas</option>
                      {availableOficinas.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={() => setCurrentDate(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                >
                  Hoje
                </button>
              </div>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {diasSemana.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {days.map((dayObj, index) => {
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();
                  const key = dayObj.isCurrentMonth
                    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(dayObj.day).padStart(2, "0")}`
                    : null;
                  const cellEvents = key ? (eventsByDate[key] || []) : [];
                  const isToday = key === todayKey;
                  const isSelected = key === dayModal;

                  return (
                    <div
                      key={index}
                      onClick={() => dayObj.isCurrentMonth && handleDayClick(dayObj.day)}
                      className={`min-h-[100px] border rounded-lg p-2 transition-all ${
                        dayObj.isCurrentMonth
                          ? `bg-white cursor-pointer hover:bg-blue-50 ${
                              isSelected
                                ? "ring-2 ring-blue-500 border-blue-400 bg-blue-50"
                                : isToday
                                ? "ring-2 ring-blue-500 border-blue-300 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`
                          : "bg-gray-50 cursor-default border-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold ${
                          !dayObj.isCurrentMonth ? "text-gray-300"
                          : isToday ? "text-blue-600"
                          : "text-gray-900"
                        }`}>
                          {dayObj.day}
                        </span>
                        {isToday && (
                          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                            Hoje
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        {cellEvents.slice(0, MAX_PER_CELL).map((ev, i) => {
                          const tipo = ev._auto ? ev.tipo : ev.tipoEvento;
                          const cfg = TIPO_CONFIG[tipo] || TIPO_CONFIG.outro;
                          const label = ev._auto ? ev.matricula : (ev.viaturaId?.matricula || cfg.label);
                          return (
                            <div
                              key={i}
                              className={`px-1.5 py-0.5 rounded text-xs font-medium border truncate ${cfg.color}`}
                            >
                              {label}
                            </div>
                          );
                        })}
                        {cellEvents.length > MAX_PER_CELL && (
                          <div className="text-xs text-gray-400 text-center pt-0.5">
                            +{cellEvents.length - MAX_PER_CELL} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-200">
              {Object.entries(TIPO_CONFIG).map(([tipo, cfg]) => (
                <div key={tipo} className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded border ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar — Alerts */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 space-y-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Avisos Críticos</h3>
            </div>

            {!hasAlerts && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Sem avisos nos próximos 30 dias.
              </div>
            )}

            {alerts.seguros.length > 0 && (
              <AlertSection
                icon={<Shield className="w-4 h-4 text-purple-600" />}
                title="Seguros (30 dias)"
                items={alerts.seguros}
                colorClass="purple"
                onSchedule={(v) =>
                  setScheduleModal({
                    date: toDateKey(v.dataLimite),
                    prefill: { viaturaId: v._id, tipoEvento: "seguro" },
                  })
                }
              />
            )}

            {alerts.revisoes.length > 0 && (
              <AlertSection
                icon={<Calendar className="w-4 h-4 text-blue-600" />}
                title="Revisões (30 dias)"
                items={alerts.revisoes}
                colorClass="blue"
                onSchedule={(v) =>
                  setScheduleModal({
                    date: toDateKey(v.dataLimite),
                    prefill: { viaturaId: v._id, tipoEvento: "revisao" },
                  })
                }
              />
            )}

            {alerts.contratos.length > 0 && (
              <AlertSection
                icon={<FileText className="w-4 h-4 text-orange-600" />}
                title="Contratos (30 dias)"
                items={alerts.contratos}
                colorClass="orange"
                onSchedule={(v) =>
                  setScheduleModal({
                    date: toDateKey(v.dataLimite),
                    prefill: { viaturaId: v._id, tipoEvento: "contrato" },
                  })
                }
              />
            )}

            {alerts.overdue.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-red-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Datas Ultrapassadas</h4>
                </div>
                <div className="space-y-2">
                  {alerts.overdue.slice(0, 5).map((v, i) => (
                    <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{v.matricula}</p>
                          <p className="text-xs text-gray-500">{v.campo} · {v.atraso}d atraso</p>
                        </div>
                        <span className="px-2 py-0.5 bg-red-200 text-red-700 text-xs font-medium rounded">
                          {v.atraso}d
                        </span>
                      </div>
                    </div>
                  ))}
                  {alerts.overdue.length > 5 && (
                    <p className="text-xs text-gray-400 text-center">+{alerts.overdue.length - 5} mais</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day events modal (z-50) */}
      {dayModal && (
        <DayEventsModal
          dateKey={dayModal}
          events={eventsByDate[dayModal] || []}
          onClose={() => setDayModal(null)}
          onAdd={() => setScheduleModal({ date: dayModal })}
          onEdit={(schedule) => setScheduleModal({ date: toDateKey(schedule.dataInicio), schedule })}
          onDelete={handleDeleteSchedule}
        />
      )}

      {/* Add/Edit schedule modal (z-60 — stacks on top of day modal) */}
      {scheduleModal !== null && (
        <AddScheduleModal
          isOpen={true}
          onClose={() => setScheduleModal(null)}
          onSave={handleSaveSchedule}
          selectedDate={scheduleModal.date}
          schedule={scheduleModal.schedule}
          prefill={scheduleModal.prefill}
          vehicles={vehicles}
        />
      )}
    </div>
  );
}

function AlertSection({ icon, title, items, colorClass, onSchedule }) {
  const palette = {
    purple: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-200 text-purple-700", btn: "bg-purple-600 hover:bg-purple-700 text-white" },
    blue:   { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-200 text-blue-700",     btn: "bg-blue-600 hover:bg-blue-700 text-white" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-200 text-orange-700", btn: "bg-orange-600 hover:bg-orange-700 text-white" },
  }[colorClass];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      </div>
      <div className="space-y-2">
        {items.slice(0, 4).map((item, i) => (
          <div key={i} className={`p-3 ${palette.bg} border ${palette.border} rounded-lg`}>
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.matricula}</p>
                <p className="text-xs text-gray-600 truncate">{item.modelo}</p>
              </div>
              <span className={`ml-2 px-2 py-0.5 ${palette.badge} text-xs font-medium rounded flex-shrink-0`}>
                {item.dias}d
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {new Date(item.dataLimite).toLocaleDateString("pt-PT")}
              </span>
              <button
                onClick={() => onSchedule(item)}
                className={`px-2 py-1 ${palette.btn} text-xs rounded transition-colors`}
              >
                Agendar
              </button>
            </div>
          </div>
        ))}
        {items.length > 4 && (
          <p className="text-xs text-gray-400 text-center">+{items.length - 4} mais</p>
        )}
      </div>
    </div>
  );
}
