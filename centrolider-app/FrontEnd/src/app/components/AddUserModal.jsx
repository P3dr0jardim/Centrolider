import { X, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";

const ROLES = [
  { value: "admin",      label: "Administrador" },
  { value: "manager",    label: "Gestor" },
  { value: "accounting", label: "Contabilidade" },
];

const APPS = [
  { value: "centrolider", label: "Centrolider" },
  { value: "minunes",     label: "MI Nunes" },
];

const MINUNES_FLEET_NAMES = ["7M Rent a Car", "Why Not Car Rental"];

export function AddUserModal({ isOpen, onClose, onSave, editUser }) {
  const [username, setUsername] = useState("");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [role, setRole]         = useState("manager");
  const [password, setPassword] = useState("");
  const [app, setApp]           = useState("centrolider");
  const [fleets, setFleets]     = useState([]);
  const [restricted, setRestricted]         = useState(false);
  const [allowedFleetIds, setAllowedFleetIds] = useState(new Set());
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  const isEdit = !!editUser;

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false); setError(null); setPassword("");
    api.getFleets().then(setFleets).catch(() => setFleets([]));
    if (isEdit) {
      setUsername(editUser.username || "");
      setName(editUser.name || "");
      setEmail(editUser.email || "");
      setRole(editUser.role || "manager");
      setApp(editUser.app || "centrolider");
      const ids = (editUser.allowedFleets || []).map((f) => (typeof f === "string" ? f : f._id));
      setRestricted(ids.length > 0);
      setAllowedFleetIds(new Set(ids));
    } else {
      setUsername(""); setName(""); setEmail(""); setRole("manager");
      setApp("centrolider"); setRestricted(false); setAllowedFleetIds(new Set());
    }
  }, [isOpen, editUser]);

  // MI Nunes side only ever sees these two fleets — enforced automatically, not left to chance.
  useEffect(() => {
    if (app !== "minunes" || fleets.length === 0) return;
    const ids = fleets.filter((f) => MINUNES_FLEET_NAMES.includes(f.name)).map((f) => f._id);
    setRestricted(true);
    setAllowedFleetIds(new Set(ids));
  }, [app, fleets]);

  if (!isOpen) return null;

  const toggleFleet = (id) =>
    setAllowedFleetIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const data = { name, email, role, app, allowedFleets: restricted ? [...allowedFleetIds] : [] };
      if (!isEdit) {
        data.username = username;
        data.password = password;
      } else if (password) {
        data.password = password;
      }
      await onSave(data);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Editar Utilizador" : "Novo Utilizador"}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Silva" required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome de Utilizador *</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: maria.silva" required disabled={isEdit} minLength={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" />
              {isEdit && <p className="text-xs text-gray-400 mt-1">O nome de utilizador não pode ser alterado.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: maria.silva@centrolider.pt" required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Função *</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isEdit ? "Nova Palavra-passe" : "Palavra-passe *"}
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Deixe em branco para manter a atual" : "Mínimo 6 caracteres"}
                required={!isEdit} minLength={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-gray-400" /> Aplicação
              </label>
              <select value={app} onChange={(e) => setApp(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {APPS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Define a marca (logótipo/cores) que este utilizador vê ao entrar.</p>
            </div>

            {app === "minunes" ? (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
                Acesso limitado automaticamente a <strong>7M Rent a Car</strong> e <strong>Why Not Car Rental</strong>.
              </div>
            ) : (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <input type="checkbox" checked={restricted} onChange={(e) => setRestricted(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  Restringir a frotas específicas
                </label>
                {!restricted ? (
                  <p className="text-xs text-gray-400">Sem restrição: vê todas as frotas.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {fleets.map((f) => (
                      <label key={f._id} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={allowedFleetIds.has(f._id)} onChange={() => toggleFleet(f._id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                        {f.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              {saving ? "A guardar…" : isEdit ? "Guardar Alterações" : "Criar Utilizador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
