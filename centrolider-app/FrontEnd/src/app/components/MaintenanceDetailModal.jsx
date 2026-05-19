import { X, Wrench, Calendar, Gauge, MapPin, Package, Euro, Plus, Paperclip, FileText, FileImage, File, Download } from "lucide-react";
import { useState } from "react";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("pt-PT") : "—");
const fmtNum  = (n) => (n != null ? Number(n).toLocaleString("pt-PT") : "—");
const fmtEuro = (v) => `€${Number(v).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function matLabel(m) {
  if (!m) return "";
  if (typeof m === "string") return m;
  return m.quantidade && m.quantidade > 1 ? `${m.nome} x${m.quantidade}` : m.nome;
}

function AttachIcon({ mimetype }) {
  if (mimetype === "application/pdf") return <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />;
  if (mimetype?.startsWith("image/")) return <FileImage className="w-4 h-4 text-blue-500 flex-shrink-0" />;
  return <File className="w-4 h-4 text-gray-400 flex-shrink-0" />;
}

export function MaintenanceDetailModal({ isOpen, onClose, record, vehicle, attachments = [] }) {
  const [downloadingId, setDownloadingId] = useState(null);

  if (!isOpen || !record) return null;

  const handleDownload = async (att) => {
    setDownloadingId(att._id);
    try {
      const base  = import.meta.env.VITE_API_BASE ?? '/api';
      const token = localStorage.getItem('cl_token');
      const res   = await fetch(`${base}/vehicles/${vehicle._id}/attachments/${att._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao descarregar ficheiro');
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.target   = '_blank';
      a.rel      = 'noreferrer';
      const inline = blob.type.startsWith('image/') || blob.type === 'application/pdf';
      if (!inline) a.download = att.originalName || att.filename || 'ficheiro';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      alert(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const custoAdicional = record.custoAdicional || [];
  const totalExtras    = custoAdicional.reduce((s, c) => s + (c.valor || 0), 0);
  const totalCusto     = (record.custo || 0) + totalExtras;
  const recordId       = record._id ? String(record._id) : null;
  const relatedDocs    = attachments.filter(
    (a) => !a.archived && a.manutencaoId && String(a.manutencaoId) === recordId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Wrench className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Detalhes da Manutenção</h3>
              {vehicle && (
                <p className="text-sm text-gray-500">
                  {vehicle.matricula} · {vehicle.modelo}
                </p>
              )}
            </div>
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
          {/* Core info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Data</p>
                <p className="text-sm font-semibold text-gray-900">{fmtDate(record.data)}</p>
              </div>
            </div>

            {record.kms > 0 && (
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <Gauge className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">KMs</p>
                  <p className="text-sm font-semibold text-gray-900">{fmtNum(record.kms)} km</p>
                </div>
              </div>
            )}

            {record.oficina && (
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg col-span-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Oficina</p>
                  <p className="text-sm font-semibold text-gray-900">{record.oficina}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
            <p className="text-xs text-orange-700 font-medium mb-1">Descrição</p>
            <p className="text-sm text-gray-800">{record.descricao}</p>
          </div>

          {/* Materials */}
          {record.materiaisUsados?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                Materiais Utilizados
              </p>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {record.materiaisUsados.map((m, i) => {
                    const isObj = m && typeof m === "object";
                    const nome  = isObj ? m.nome : m;
                    const qty   = isObj && m.quantidade > 1 ? m.quantidade : 1;
                    const preco = isObj ? (m.preco ?? null) : null;
                    const total = preco != null ? preco * qty : null;
                    return (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Package className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                          <span className="text-sm text-gray-800 truncate">{nome}</span>
                          {qty > 1 && (
                            <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full flex-shrink-0">
                              x{qty}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-3">
                          {total != null ? fmtEuro(total) : preco != null ? fmtEuro(preco) : "—"}
                        </span>
                      </div>
                    );
                  })}
                  {(() => {
                    const matTotal = record.materiaisUsados.reduce((s, m) => {
                      if (m && typeof m === "object" && m.preco != null)
                        return s + m.preco * (m.quantidade || 1);
                      return s;
                    }, 0);
                    return matTotal > 0 ? (
                      <div className="flex items-center justify-between px-4 py-2.5 bg-purple-50">
                        <span className="text-sm font-bold text-purple-900">Total Materiais</span>
                        <span className="text-sm font-bold text-purple-900">{fmtEuro(matTotal)}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Cost breakdown */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Euro className="w-3.5 h-3.5" />
                Custos
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Base cost */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700">Custo principal</span>
                <span className="text-sm font-semibold text-gray-900">
                  {record.custo > 0 ? fmtEuro(record.custo) : "—"}
                </span>
              </div>

              {/* Extra costs */}
              {custoAdicional.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Plus className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-700">{c.descricao || `Extra ${i + 1}`}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{fmtEuro(c.valor || 0)}</span>
                </div>
              ))}

              {/* Total */}
              {(record.custo > 0 || totalExtras > 0) && (
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50">
                  <span className="text-sm font-bold text-blue-900">Total</span>
                  <span className="text-base font-bold text-blue-900">{fmtEuro(totalCusto)}</span>
                </div>
              )}
            </div>
          </div>
          {/* Related documents */}
          {relatedDocs.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" />
                Documentos Anexos ({relatedDocs.length})
              </p>
              <div className="space-y-1.5">
                {relatedDocs.map((att) => (
                  <div key={att._id} className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <AttachIcon mimetype={att.mimetype} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{att.originalName || att.filename}</p>
                      {att.description && <p className="text-xs text-gray-500 truncate">{att.description}</p>}
                    </div>
                    {att.data && <span className="text-xs text-gray-400 flex-shrink-0">{fmtDate(att.data)}</span>}
                    <button
                      type="button"
                      onClick={() => handleDownload(att)}
                      disabled={downloadingId === att._id}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40 flex-shrink-0"
                      title="Abrir ficheiro"
                    >
                      {downloadingId === att._id
                        ? <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        : <Download className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
