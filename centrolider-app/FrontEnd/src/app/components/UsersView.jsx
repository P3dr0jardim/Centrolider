import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import { AddUserModal } from "./AddUserModal";
import { useAuth } from "../context/AuthContext";

const ROLE_LABEL = {
  admin:      "Administrador",
  manager:    "Gestor",
  accounting: "Contabilidade",
};

const ROLE_BADGE = {
  admin:      "bg-purple-100 text-purple-700",
  manager:    "bg-blue-100 text-blue-700",
  accounting: "bg-green-100 text-green-700",
};

export function UsersView() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null); // null = create, user = edit

  const load = () => {
    setLoading(true);
    api.getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredUsers = useMemo(() =>
    users.filter((u) => {
      const term = searchTerm.toLowerCase();
      return (
        u.name?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    }),
    [users, searchTerm]
  );

  const openCreate = () => { setEditUser(null); setModalOpen(true); };
  const openEdit = (u) => { setEditUser(u); setModalOpen(true); };

  const handleSave = async (data) => {
    if (editUser) {
      const updated = await api.updateUser(editUser._id, data);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    } else {
      const created = await api.createUser(data);
      setUsers((prev) => [created, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Eliminar o utilizador "${u.name}"?`)) return;
    try {
      await api.deleteUser(u._id);
      setUsers((prev) => prev.filter((x) => x._id !== u._id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Utilizadores</h2>
          <p className="text-gray-600 mt-1">Criar e gerir contas de acesso ao sistema</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Utilizador
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Search bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">{filteredUsers.length} utilizadores</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar utilizadores…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Nome</th>
                <th className="px-6 py-3 text-left">Utilizador</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-center">Função</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Nenhum utilizador encontrado.
                  </td>
                </tr>
              )}
              {filteredUsers.map((u) => {
                const isSelf = u._id === currentUser?._id;
                return (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                          {u.name?.slice(0, 2).toUpperCase() || "?"}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {u.name}
                          {isSelf && <span className="ml-2 text-xs text-gray-400">(você)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{u.username}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${ROLE_BADGE[u.role] || "bg-gray-100 text-gray-700"}`}>
                        {ROLE_LABEL[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={isSelf}
                          title={isSelf ? "Não pode eliminar a sua própria conta" : "Eliminar"}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editUser={editUser}
      />
    </div>
  );
}
