const Vehicle = require('../models/Vehicle');
const Schedule = require('../models/Schedule');
const StockItem = require('../models/StockItem');
const { vehicleFleetFilter, isFleetAllowed } = require('../utils/fleetScope');

const EVENT_LABELS = {
  inspecao:  'Inspeção',
  revisao:   'Revisão',
  manutencao: 'Manutenção',
  seguro:    'Seguro',
  reparacao: 'Reparação',
  contrato:  'Contrato',
  outro:     'Evento',
};

exports.getNotifications = async (req, res) => {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const notifications = [];

    // 1. Vehicles in maintenance — with how long they've been there
    const maintenanceVehicles = await Vehicle.find({ status: 'Manutenção', ...vehicleFleetFilter(req.user) })
      .select('matricula modelo manutencaoDesde historicoManutencao updatedAt frotaId');

    for (const v of maintenanceVehicles) {
      let sinceDate = v.manutencaoDesde || v.updatedAt;
      // Fallback: latest maintenance record date if manutencaoDesde not set
      if (!v.manutencaoDesde && v.historicoManutencao?.length > 0) {
        const sorted = [...v.historicoManutencao].sort((a, b) => new Date(b.data) - new Date(a.data));
        sinceDate = sorted[0].data;
      }
      const days = Math.max(0, Math.floor((now - new Date(sinceDate)) / (1000 * 60 * 60 * 24)));
      notifications.push({
        type: 'maintenance',
        severity: days >= 7 ? 'high' : 'medium',
        message: days === 0
          ? `${v.matricula} entrou em manutenção hoje`
          : `${v.matricula} está em manutenção há ${days} dia${days !== 1 ? 's' : ''}`,
        vehicleId: v._id,
        frotaId:   v.frotaId,
        matricula: v.matricula,
        modelo:    v.modelo,
        days,
      });
    }

    // Sort: longest in maintenance first
    notifications.sort((a, b) => (b.days || 0) - (a.days || 0));

    // 2. Upcoming schedules in the next 7 days
    const upcomingSchedules = await Schedule.find({
      dataInicio: { $gte: now, $lte: in7Days },
      tipoEvento: { $in: ['inspecao', 'revisao', 'manutencao', 'seguro', 'reparacao'] },
    })
      .populate('viaturaId', 'matricula modelo frotaId')
      .sort({ dataInicio: 1 });

    for (const s of upcomingSchedules) {
      if (!s.viaturaId) continue;
      if (!isFleetAllowed(req.user, s.viaturaId.frotaId)) continue;
      const date = new Date(s.dataInicio);
      const dateStr = date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const label = EVENT_LABELS[s.tipoEvento] || s.tipoEvento;
      notifications.push({
        type: 'upcoming',
        severity: 'info',
        message: `${s.viaturaId.matricula} tem ${label} agendada para ${dateStr}`,
        vehicleId: s.viaturaId._id,
        frotaId:   s.viaturaId.frotaId,
        matricula: s.viaturaId.matricula,
        modelo:    s.viaturaId.modelo,
        scheduleDate: s.dataInicio,
        tipoEvento: s.tipoEvento,
      });
    }

    // 3. Low stock items
    const lowStockItems = await StockItem.find({
      minimo: { $gt: 0 },
      $expr: { $lte: ['$quantidade', '$minimo'] },
    });

    for (const item of lowStockItems) {
      notifications.push({
        type: 'stock',
        severity: item.quantidade === 0 ? 'high' : 'medium',
        message: item.quantidade === 0
          ? `${item.nome} sem stock (mínimo: ${item.minimo})`
          : `Stock baixo: ${item.nome} — ${item.quantidade} un. (mínimo: ${item.minimo})`,
        itemId: item._id,
        nome: item.nome,
        quantidade: item.quantidade,
        minimo: item.minimo,
      });
    }

    res.json({ notifications, total: notifications.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
