import { X, Upload, FileText, Image, File } from "lucide-react";
import { useState, useRef } from "react";

const ACCEPT = "image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf";

function FileIcon({ mimetype }) {
  if (mimetype === "application/pdf") return <FileText className="w-8 h-8 text-red-500" />;
  if (mimetype?.startsWith("image/")) return <Image className="w-8 h-8 text-blue-500" />;
  return <File className="w-8 h-8 text-gray-400" />;
}

const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function AddAttachmentModal({ isOpen, onClose, onSave, vehicleId }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setFile(null);
    setSaving(false);
    setError(null);
    onClose();
  };

  const handleFile = (f) => {
    if (!f) return;
    const allowed = /\.(jpe?g|png|gif|webp|pdf)$/i;
    if (!allowed.test(f.name)) {
      setError("Tipo de ficheiro não suportado. Use PDF, JPG, PNG, GIF ou WebP.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("Ficheiro demasiado grande. Máximo 20 MB.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Selecione um ficheiro."); return; }
    const fd = new FormData(e.target);
    fd.set("file", file);
    setSaving(true);
    setError(null);
    try {
      await onSave(fd);
      handleClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Anexar Documento</h3>
            <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG, GIF, WebP — máx. 20 MB</p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center gap-4 justify-center">
                  <FileIcon mimetype={file.type} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 break-all">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{fmtSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Arraste um ficheiro ou clique para selecionar</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, GIF, WebP</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <input type="text" name="description" placeholder="Ex: Fatura oficina, Apólice seguro..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data do Documento</label>
              <input type="date" name="data" defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <button type="button" onClick={handleClose}
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !file}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-60">
              {saving ? "A enviar..." : "Anexar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
