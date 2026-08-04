import { X } from "lucide-react";
import { useState, useEffect } from "react";

const ROLES = [
  { value: "admin",      label: "Administrador" },
  { value: "manager",    label: "Gestor" },
  { value: "accounting", label: "Contabilidade" },
];

export function AddUserModal({ isOpen, onClose, onSave, editUser }) {
  const [username, setUsername] = useState("");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [role, setRole]         = useState("manager");
  const [password, setPassword] = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  const isEdit = !!editUser;

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false); setError(null); setPassword("");
    if (isEdit) {
      setUsername(editUser.username || "");
      setName(editUser.name || "");
      setEmail(editUser.email || "");
      setRole(editUser.role || "manager");
    } else {
      setUsername(""); setName(""); setEmail(""); setRole("manager");
    }
  }, [isOpen, editUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const data = { name, email, role };
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Editar Utilizador" : "Novo Utilizador"}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
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
