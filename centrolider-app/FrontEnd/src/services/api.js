const BASE = import.meta.env.VITE_API_BASE ?? '/api';
export const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE ?? '/uploads';

const getToken = () => localStorage.getItem('cl_token');

function buildHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    localStorage.removeItem('cl_token');
    window.dispatchEvent(new Event('cl:logout'));
    throw new Error('Sessão expirada. Por favor faça login novamente.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

const qs = (params) =>
  params && Object.keys(params).length ? '?' + new URLSearchParams(params) : '';

export const api = {
  // Auth
  login: (credentials) => request('POST', '/auth/login', credentials),
  me: () => request('GET', '/auth/me'),

  // Fleets
  getFleets: () => request('GET', '/fleets'),
  getFleet: (id) => request('GET', `/fleets/${id}`),
  createFleet: (data) => request('POST', '/fleets', data),
  updateFleet: (id, data) => request('PUT', `/fleets/${id}`, data),
  deleteFleet: (id) => request('DELETE', `/fleets/${id}`),

  // Vehicles
  getVehicles: (params) => request('GET', `/vehicles${qs(params)}`),
  getVehicle: (id) => request('GET', `/vehicles/${id}`),
  createVehicle: (data) => request('POST', '/vehicles', data),
  updateVehicle: (id, data) => request('PUT', `/vehicles/${id}`, data),
  bulkUpdateVehicleFields: (updates) => request('PATCH', '/vehicles/bulk-financial', { updates }),
  bulkConfirmFinancial: (ids) => request('PATCH', '/vehicles/bulk-confirm-financial', { ids }),
  setLeasingMensal: (id, data) => request('PUT', `/vehicles/${id}/leasing-mensal`, data),
  bulkSetLeasingMensal: (data) => request('PATCH', '/vehicles/bulk-leasing-mensal', data),
  deleteLeasingMensal: (id, mes) => request('DELETE', `/vehicles/${id}/leasing-mensal/${mes}`),
  deleteVehicle: (id) => request('DELETE', `/vehicles/${id}`),
  addMaintenance: (id, data) => request('POST', `/vehicles/${id}/maintenance`, data),
  updateMaintenance: (id, recordId, data) => request('PUT', `/vehicles/${id}/maintenance/${recordId}`, data),
  deleteMaintenance: (id, recordId) => request('DELETE', `/vehicles/${id}/maintenance/${recordId}`),

  // Expenses
  getExpenses: (params) => request('GET', `/expenses${qs(params)}`),
  createExpense: (data) => request('POST', '/expenses', data),
  updateExpense: (id, data) => request('PUT', `/expenses/${id}`, data),
  deleteExpense: (id) => request('DELETE', `/expenses/${id}`),

  // Revenues
  getRevenues: (params) => request('GET', `/revenues${qs(params)}`),
  createRevenue: (data) => request('POST', '/revenues', data),
  bulkCreateRevenue: (data) => request('POST', '/revenues/bulk', data),
  updateRevenue: (id, data) => request('PUT', `/revenues/${id}`, data),
  deleteRevenue: (id) => request('DELETE', `/revenues/${id}`),

  // Stock
  getStock: (params) => request('GET', `/stock${qs(params)}`),
  createStockItem: (data) => request('POST', '/stock', data),
  updateStockItem: (id, data) => request('PUT', `/stock/${id}`, data),
  deleteStockItem: (id) => request('DELETE', `/stock/${id}`),
  consumeStock: (data) => request('POST', '/stock/consume', data),

  // Stats
  getStatsRentabilidade: () => request('GET', '/stats/rentabilidade'),
  syncVehicleStatuses: () => request('POST', '/stats/sync-status'),

  // Vehicle attachments (multipart/form-data — caller passes a FormData object)
  addAttachment: (vehicleId, formData) => {
    const token = getToken();
    return fetch(`${BASE}/vehicles/${vehicleId}/attachments`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (res.status === 401) {
        localStorage.removeItem('cl_token');
        window.dispatchEvent(new Event('cl:logout'));
        throw new Error('Sessão expirada.');
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || res.statusText);
      return data;
    });
  },

  updateAttachmentMeta: (vehicleId, attachmentId, data) =>
    request('PUT', `/vehicles/${vehicleId}/attachments/${attachmentId}/meta`, data),
  toggleArchiveAttachment: (vehicleId, attachmentId) =>
    request('PATCH', `/vehicles/${vehicleId}/attachments/${attachmentId}/archive`),

  // Schedules
  getSchedules: (params) => request('GET', `/schedules${qs(params)}`),
  createSchedule: (data) => request('POST', '/schedules', data),
  updateSchedule: (id, data) => request('PUT', `/schedules/${id}`, data),
  deleteSchedule: (id) => request('DELETE', `/schedules/${id}`),

  // Activity logs
  getLogs: (params) => request('GET', `/logs${qs(params)}`),

  // Notifications
  getNotifications: () => request('GET', '/notifications'),

  // Users
  getUsers: () => request('GET', '/users'),
  createUser: (data) => request('POST', '/users', data),
  updateUser: (id, data) => request('PUT', `/users/${id}`, data),
  deleteUser: (id) => request('DELETE', `/users/${id}`),
};
