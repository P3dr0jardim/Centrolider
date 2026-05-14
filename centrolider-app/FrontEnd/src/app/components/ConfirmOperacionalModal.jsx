import { CheckCircle, X, Wrench, Calendar, Euro, Clock } from "lucide-react";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("pt-PT") : "—");
const fmtEuro = (v) => `€${Number(v).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtNum  = (n) => (n != null ? Number(n).toLocaleString("pt-PT") : "—");

function daysSince(date) {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function matLabel(m) {
  if (!m) return "";
  if (typeof m === "string") return m;
  return m.quantidade && m.quantidade > 1 ? `${m.nome} x${m.quantidade}` : m.nome;
}

export function ConfirmOperacionalModal({ isOpen, onClose, onConfirm, vehicle }) {
  if (!isOpen || !vehicle) return null;

  const days = daysSince(vehicle.manutencaoDesde);
  const records = [...(vehicle.historicoManutencao || [])].sort(
    (a, b) => new Date(b.data) - new Date(a.data)
  );
  const totalCusto = records.reduce((s, r) => s + (r.custo || 0), 0);
  const totalItems = records.reduce(
    (s, r) => s + (r.materiaisUsados?.length || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Confirmar Operacional</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Vehicle summary */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-900 text-lg">{vehicle.matricula}</p>
                <p className="text-sm text-gray-600">
                  {vehicle.modelo}
                  {vehicle.condutor ? ` · ${vehicle.condutor}` : ""}
                </p>
              </div>
            </div>
            {days != null && (
              <div className="flex items-center gap-2 mt-3 text-sm text-orange-700">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>
                  Em manutenção há{" "}
                  <strong>{days} {days === 1 ? "dia" : "dias"}</strong>
                  {vehicle.manutencaoDesde ? ` (desde ${fmtDate(vehicle.manutencaoDesde)})` : ""}
                </span>
              </div>
            )}
          </div>

          {/* Maintenance records */}
          {records.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Intervenções registadas ({records.length})
              </h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {records.map((r, i) => (
                  <div
                    key={r._id || i}
                    className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{r.descricao}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fmtDate(r.data)}
                          {r.oficina ? ` · ${r.oficina}` : ""}
                          {r.kms ? ` · ${fmtNum(r.kms)} km` : ""}
                        </p>
                        {r.materiaisUsados?.length > 0 && (
                          <p className="text-xs text-purple-600 mt-1">
                            {r.materiaisUsados.map(matLabel).join(", ")}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                        {r.custo > 0 ? fmtEuro(r.custo) : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost summary */}
          {totalCusto > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Euro className="w-4 h-4" />
                <span className="font-medium">Custo total ({records.length} intervenções{totalItems > 0 ? `, ${totalItems} materiais` : ""})</span>
              </div>
              <span className="font-bold text-blue-900 text-base">{fmtEuro(totalCusto)}</span>
            </div>
          )}

          <p className="text-sm text-gray-500 text-center pt-1">
            Tem a certeza que pretende marcar{" "}
            <strong className="text-gray-900">{vehicle.matricula}</strong> como{" "}
            <strong className="text-green-700">Operacional</strong>?
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Confirmar Operacional
          </button>
        </div>
      </div>
    </div>
  );
}
