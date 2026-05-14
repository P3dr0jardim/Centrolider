import { useState, useEffect } from "react";
import { X, Search, Wrench } from "lucide-react";

const STATUS_DOT = {
  "Operacional": "bg-green-500",
  "Manutenção":  "bg-orange-500",
  "Inativo":     "bg-red-500",
};

const STATUS_BADGE = {
  "Operacional": "bg-green-100 text-green-700",
  "Manutenção":  "bg-orange-100 text-orange-700",
  "Inativo":     "bg-red-100 text-red-700",
};

export function AddMaintenanceSearchModal({ isOpen, onClose, vehicles = [], onSelect }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  const filtered = vehicles
    .filter((v) => {
      if (!query.trim()) return true;
      const t = query.trim().toLowerCase();
      return v.matricula?.toLowerCase().includes(t) || v.modelo?.toLowerCase().includes(t);
    })
    .slice(0, 12);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wrench className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Seleccionar Viatura</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="Pesquisar matrícula ou modelo…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Nenhuma viatura encontrada</p>
            ) : (
              <ul className="space-y-0.5">
                {filtered.map((v) => (
                  <li key={v._id}>
                    <button
                      type="button"
                      onClick={() => { onSelect(v); onClose(); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-orange-50 transition-colors text-left"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[v.status] || "bg-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{v.matricula}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {v.modelo}{v.condutor ? ` · ${v.condutor}` : ""}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[v.status] || "bg-gray-100 text-gray-600"}`}>
                        {v.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
