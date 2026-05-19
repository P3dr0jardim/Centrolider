import { X, Search, Car } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";

const TIPOS = [
  { value: "inspecao",   label: "Inspeção (IPO)" },
  { value: "revisao",    label: "Revisão Oficina" },
  { value: "seguro",     label: "Renovação Seguro" },
  { value: "contrato",   label: "Fim de Contrato" },
  { value: "reparacao",  label: "Reparação" },
  { value: "manutencao", label: "Manutenção Preventiva" },
  { value: "outro",      label: "Outro" },
];

const OFICINAS = [
  "Autocrescente Ribeira Brava",
  "Autocrescente Canhas",
  "Eurorepar",
  "Opel",
  "Peugeot",
  "Mendes e Gomes",
  "CSantos",
  "CIAM",
  "Autozarco",
  "Vulcanizadora 25 abril",
  "Autobraga",
  "Extrapneu",
];

const TIPOS_COM_OFICINA = ["inspecao", "revisao", "reparacao", "manutencao"];

const STATUS_DOT = {
  Operacional: "bg-green-500",
  Manutenção:  "bg-orange-500",
  Inativo:     "bg-red-500",
};

export function AddScheduleModal({
  isOpen, onClose, onSave,
  selectedDate,
  schedule,
  prefill,
  vehicles = [],
}) {
  const [viaturaId, setViaturaId]       = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [dropOpen, setDropOpen]         = useState(false);
  const [tipoEvento, setTipoEvento]     = useState("");
  const [dataInicio, setDataInicio]     = useState("");
  const [horaInicio, setHoraInicio]     = useState("09:00");
  const [dataFim, setDataFim]           = useState("");
  const [horaFim, setHoraFim]           = useState("17:00");
  const [notas, setNotas]               = useState("");
  const [oficina, setOficina]           = useState("");
  const [showOficinaSugg, setShowOficinaSugg] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState(null);

  const dropRef      = useRef(null);
  const oficinaSuggRef = useRef(null);
  const isEdit  = !!schedule;

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false); setError(null);
    if (isEdit) {
      const v = schedule.viaturaId;
      setViaturaId(typeof v === "object" ? v._id : v || "");
      setTipoEvento(schedule.tipoEvento || "");
      setDataInicio(schedule.dataInicio ? schedule.dataInicio.slice(0, 10) : "");
      setHoraInicio(schedule.horaInicio || "09:00");
      setDataFim(schedule.dataFim ? schedule.dataFim.slice(0, 10) : "");
      setHoraFim(schedule.horaFim || "17:00");
      setNotas(schedule.notas || "");
      setOficina(schedule.oficina || "");
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setViaturaId(prefill?.viaturaId || "");
      setTipoEvento(prefill?.tipoEvento || "");
      setDataInicio(selectedDate || today);
      setHoraInicio("09:00");
      setDataFim(selectedDate || today);
      setHoraFim("17:00");
      setNotas("");
      setOficina("");
    }
    setVehicleSearch(""); setDropOpen(false); setShowOficinaSugg(false);
  }, [isOpen, schedule, selectedDate, prefill]);

  // Close vehicle dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close oficina dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (oficinaSuggRef.current && !oficinaSuggRef.current.contains(e.target))
        setShowOficinaSugg(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v._id === viaturaId) || null,
    [vehicles, viaturaId]
  );

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase();
    if (!q) return vehicles.slice(0, 12);
    return vehicles
      .filter(
        (v) =>
          v.matricula.toLowerCase().includes(q) ||
          v.modelo.toLowerCase().includes(q) ||
          (v.condutor || "").toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [vehicles, vehicleSearch]);

  if (!isOpen) return null;

  const needsOficina = TIPOS_COM_OFICINA.includes(tipoEvento);

  const oficinaSuggestions = OFICINAS.filter(
    (o) =>
      o.toLowerCase().includes(oficina.toLowerCase()) &&
      o.toLowerCase() !== oficina.toLowerCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!viaturaId) { setError("Selecione uma viatura."); return; }
    if (needsOficina && !oficina.trim()) { setError("Selecione ou introduza a oficina."); return; }
    setSaving(true); setError(null);
    try {
      await onSave({
        viaturaId, tipoEvento, dataInicio, horaInicio,
        dataFim: dataFim || dataInicio, horaFim, notas,
        oficina: oficina.trim() || undefined,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const selectVehicle = (v) => {
    setViaturaId(v._id);
    setVehicleSearch("");
    setDropOpen(false);
  };

  const clearVehicle = (e) => {
    e.stopPropagation();
    setViaturaId("");
    setVehicleSearch("");
    setDropOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Editar Agendamento" : "Novo Agendamento"}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
            )}

            {/* Viatura — searchable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Viatura *</label>
              <div className="relative" ref={dropRef}>
                {selectedVehicle ? (
                  /* Selected vehicle chip */
                  <div className="flex items-center gap-3 px-4 py-2.5 border border-blue-400 bg-blue-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[selectedVehicle.status] || "bg-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-gray-900">{selectedVehicle.matricula}</span>
                      <span className="text-gray-500 ml-2 text-sm">{selectedVehicle.modelo}</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearVehicle}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Search input */
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Pesquisar matrícula ou modelo…"
                      value={vehicleSearch}
                      onChange={(e) => { setVehicleSearch(e.target.value); setDropOpen(true); }}
                      onFocus={() => setDropOpen(true)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoComplete="off"
                    />
                  </div>
                )}

                {/* Dropdown */}
                {dropOpen && !selectedVehicle && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {filteredVehicles.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400 text-center">Nenhuma viatura encontrada</div>
                    ) : (
                      <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                        {filteredVehicles.map((v) => (
                          <button
                            key={v._id}
                            type="button"
                            onClick={() => selectVehicle(v)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors"
                          >
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[v.status] || "bg-gray-400"}`} />
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-gray-900 text-sm">{v.matricula}</span>
                              <span className="text-gray-500 text-sm ml-2">{v.modelo}</span>
                            </div>
                            {v.status && (
                              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                v.status === "Operacional" ? "bg-green-100 text-green-700" :
                                v.status === "Manutenção"  ? "bg-orange-100 text-orange-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {v.status}
                              </span>
                            )}
                            {v.condutor && (
                              <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">{v.condutor}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tipo de Evento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento *</label>
              <select value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione o tipo</option>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Data e Hora Início */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início *</label>
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Data e Hora Fim */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Fim</label>
                <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Oficina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oficina {needsOficina ? "*" : "(opcional)"}
              </label>
              <div className="relative" ref={oficinaSuggRef}>
                <input
                  type="text"
                  value={oficina}
                  onChange={(e) => { setOficina(e.target.value); setShowOficinaSugg(true); }}
                  onFocus={() => setShowOficinaSugg(true)}
                  placeholder="Selecionar ou digitar oficina"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showOficinaSugg && oficinaSuggestions.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {oficinaSuggestions.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => { setOficina(o); setShowOficinaSugg(false); }}
                          className="w-full px-4 py-2.5 text-sm text-left text-gray-800 hover:bg-blue-50 transition-colors"
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas / Observações</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
                placeholder="Descrição adicional, contacto, etc."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {saving ? "A guardar…" : isEdit ? "Guardar Alterações" : "Criar Agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
