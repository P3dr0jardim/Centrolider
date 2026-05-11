const Schedule = require('../models/Schedule');
const Vehicle = require('../models/Vehicle');

const WORKSHOP_TYPES = ['manutencao', 'reparacao', 'revisao', 'inspecao'];

async function syncVehicleStatuses() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // Find all workshop-type schedules whose window covers today
  const activeSchedules = await Schedule.find({
    tipoEvento: { $in: WORKSHOP_TYPES },
    dataInicio: { $lte: todayEnd },
    $or: [
      { dataFim: { $gte: today } },
      { dataFim: null },
      { dataFim: { $exists: false } },
    ],
  }).select('viaturaId');

  const activeVehicleIds = [...new Set(activeSchedules.map((s) => s.viaturaId.toString()))];

  // Set to Manutenção only vehicles that are currently Operacional
  // (never override a manual Inativo or a manually-set Manutenção)
  if (activeVehicleIds.length > 0) {
    await Vehicle.updateMany(
      { _id: { $in: activeVehicleIds }, status: 'Operacional' },
      { status: 'Manutenção', scheduleAutoStatus: true }
    );
  }

  // Revert vehicles that were auto-set but no longer have an active schedule
  await Vehicle.updateMany(
    { scheduleAutoStatus: true, _id: { $nin: activeVehicleIds } },
    { status: 'Operacional', scheduleAutoStatus: false }
  );
}

module.exports = { syncVehicleStatuses };
