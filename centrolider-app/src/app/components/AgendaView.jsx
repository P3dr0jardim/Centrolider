import {
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  Calendar,
  Clock,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { AddScheduleModal } from "./AddScheduleModal";

// Mock data - Eventos do calendário
const eventos = [
  {
    id: 1,
    dia: 5,
    tipo: "inspecao",
    titulo: "IPO - AA-01-BB",
    cor: "bg-red-100 text-red-700 border-red-300",
  },
  {
    id: 2,
    dia: 8,
    tipo: "revisao",
    titulo: "Revisão 120k - Clio",
    cor: "bg-blue-100 text-blue-700 border-blue-300",
  },
  {
    id: 3,
    dia: 12,
    tipo: "seguro",
    titulo: "Renovação Seguro",
    cor: "bg-purple-100 text-purple-700 border-purple-300",
  },
  {
    id: 4,
    dia: 15,
    tipo: "inspecao",
    titulo: "IPO - BB-02-YY",
    cor: "bg-red-100 text-red-700 border-red-300",
  },
  {
    id: 5,
    dia: 18,
    tipo: "revisao",
    titulo: "Revisão - Sprinter",
    cor: "bg-blue-100 text-blue-700 border-blue-300",
  },
  {
    id: 6,
    dia: 22,
    tipo: "inspecao",
    titulo: "IPO - CC-01-PP",
    cor: "bg-red-100 text-red-700 border-red-300",
  },
  {
    id: 7,
    dia: 25,
    tipo: "seguro",
    titulo: "Seguro - AA-03-DD",
    cor: "bg-purple-100 text-purple-700 border-purple-300",
  },
  {
    id: 8,
    dia: 28,
    tipo: "revisao",
    titulo: "Revisão 80k - Master",
    cor: "bg-blue-100 text-blue-700 border-blue-300",
  },
];

// Mock data - Alertas críticos
const alertas = {
  seguros: [
    {
      id: 1,
      matricula: "AA-01-BB",
      modelo: "Mercedes Sprinter",
      dataLimite: "2026-03-08",
      dias: 6,
    },
    {
      id: 2,
      matricula: "BB-03-ZZ",
      modelo: "Renault Master",
      dataLimite: "2026-03-12",
      dias: 10,
    },
  ],
  ipos: [
    {
      id: 3,
      matricula: "CC-02-QQ",
      modelo: "Ford Transit",
      dataLimite: "2026-03-05",
      dias: 3,
    },
    {
      id: 4,
      matricula: "AA-05-FF",
      modelo: "Volkswagen Crafter",
      dataLimite: "2026-03-10",
      dias: 8,
    },
  ],
  revisoesAtrasadas: [
    {
      id: 5,
      matricula: "BB-07-DD",
      modelo: "Volkswagen Crafter",
      atraso: "5 dias",
    },
    {
      id: 6,
      matricula: "AA-09-JJ",
      modelo: "Mercedes Sprinter 319",
      atraso: "12 dias",
    },
  ],
};

const mesesNomes = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function AgendaView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Março 2026
  const [viewMode, setViewMode] = useState("mes"); // "mes", "semana", "dia"
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSaveSchedule = (data) => {
    console.log("Novo agendamento:", data);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    setSelectedDate(clickedDate);
    setIsScheduleModalOpen(true);
  };

  // Gerar dias do calendário
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Dias do mês anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  const days = getDaysInMonth();
  const today = new Date();
  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getEventosForDay = (day) => {
    return eventos.filter((e) => e.dia === day);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Agendamentos e Prazos
          </h2>
          <p className="text-gray-600 mt-1">
            Gestão de inspeções, seguros e manutenções
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDate(undefined);
            setIsScheduleModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Agendar Serviço
        </button>
      </div>

      {/* Layout principal - Calendário + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Área Principal - Calendário */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controlos do Calendário */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-xl font-semibold text-gray-900 min-w-[180px] text-center">
                  {mesesNomes[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("mes")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "mes"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Mês
                </button>
                <button
                  onClick={() => setViewMode("semana")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "semana"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setViewMode("dia")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "dia"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Dia
                </button>
              </div>
            </div>
          </div>

          {/* Calendário */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {diasSemana.map((dia) => (
                <div
                  key={dia}
                  className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider py-2"
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Grade do calendário */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((dayObj, index) => {
                const eventosDay = dayObj.isCurrentMonth
                  ? getEventosForDay(dayObj.day)
                  : [];
                const isTodayDay = dayObj.isCurrentMonth && isToday(dayObj.day);

                return (
                  <div
                    key={index}
                    onClick={() =>
                      dayObj.isCurrentMonth && handleDayClick(dayObj.day)
                    }
                    className={`min-h-[100px] border border-gray-200 rounded-lg p-2 transition-all ${
                      dayObj.isCurrentMonth
                        ? "bg-white hover:bg-blue-50 cursor-pointer hover:border-blue-300"
                        : "bg-gray-50 cursor-default"
                    } ${isTodayDay ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-semibold ${
                          dayObj.isCurrentMonth
                            ? isTodayDay
                              ? "text-blue-600"
                              : "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {dayObj.day}
                      </span>
                      {isTodayDay && (
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                          Hoje
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {eventosDay.map((evento) => (
                        <div
                          key={evento.id}
                          className={`px-2 py-1 rounded text-xs font-medium border truncate ${evento.cor}`}
                        >
                          {evento.titulo}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600">Inspeção (IPO)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-600">Revisão Oficina</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-xs text-gray-600">Renovação Seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral - Alertas */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Avisos Críticos
              </h3>
            </div>

            <div className="space-y-6">
              {/* Seguros a Caducar */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-semibold text-gray-700">
                    Seguros a Caducar (15 dias)
                  </h4>
                </div>
                <div className="space-y-2">
                  {alertas.seguros.map((alerta) => (
                    <div
                      key={alerta.id}
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {alerta.matricula}
                          </p>
                          <p className="text-xs text-gray-600">
                            {alerta.modelo}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-purple-200 text-purple-700 text-xs font-medium rounded">
                          {alerta.dias}d
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(alerta.dataLimite).toLocaleDateString(
                            "pt-PT",
                          )}
                        </span>
                        <button className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors">
                          Agendar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* IPO a Expirar */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <h4 className="text-sm font-semibold text-gray-700">
                    IPO a Expirar
                  </h4>
                </div>
                <div className="space-y-2">
                  {alertas.ipos.map((alerta) => (
                    <div
                      key={alerta.id}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {alerta.matricula}
                          </p>
                          <p className="text-xs text-gray-600">
                            {alerta.modelo}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-red-200 text-red-700 text-xs font-medium rounded">
                          {alerta.dias}d
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(alerta.dataLimite).toLocaleDateString(
                            "pt-PT",
                          )}
                        </span>
                        <button className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                          Agendar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revisões Atrasadas */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <h4 className="text-sm font-semibold text-gray-700">
                    Revisões Atrasadas
                  </h4>
                </div>
                <div className="space-y-2">
                  {alertas.revisoesAtrasadas.map((alerta) => (
                    <div
                      key={alerta.id}
                      className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {alerta.matricula}
                          </p>
                          <p className="text-xs text-gray-600">
                            {alerta.modelo}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-orange-200 text-orange-700 text-xs font-medium rounded">
                          {alerta.atraso}
                        </span>
                      </div>
                      <button className="w-full px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors">
                        Agendar Agora
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        selectedDate={selectedDate}
      />
    </div>
  );
}
