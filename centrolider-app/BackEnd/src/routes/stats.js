const router = require('express').Router();
const Fleet = require('../models/Fleet');
const Vehicle = require('../models/Vehicle');
const Expense = require('../models/Expense');
const Revenue = require('../models/Revenue');
const auth = require('../middleware/auth');
const { syncVehicleStatuses } = require('../utils/syncStatus');
const { fleetFilter } = require('../utils/fleetScope');

router.use(auth);

router.get('/rentabilidade', async (req, res) => {
  try {
    const fleets = await Fleet.find(fleetFilter(req.user));

    const results = await Promise.all(fleets.map(async (fleet) => {
      const vehicles = await Vehicle.find({ frotaId: fleet._id }).select('_id status rentabilidade');
      if (vehicles.length === 0) return null;

      const vehicleIds = vehicles.map((v) => v._id);

      const [expAgg, revAgg] = await Promise.all([
        Expense.aggregate([
          { $match: { vehicleId: { $in: vehicleIds } } },
          { $group: { _id: null, total: { $sum: '$valor' }, count: { $sum: 1 } } },
        ]),
        Revenue.aggregate([
          { $match: { vehicleId: { $in: vehicleIds } } },
          { $group: { _id: null, total: { $sum: '$valor' }, count: { $sum: 1 } } },
        ]),
      ]);

      const totalReceita = revAgg[0]?.total || 0;
      const totalDespesa = expAgg[0]?.total || 0;

      return {
        frotaId: fleet._id,
        frota: fleet.name,
        vehicleCount: vehicles.length,
        operacionais: vehicles.filter((v) => v.status === 'Operacional').length,
        totalReceita,
        totalDespesa,
        totalLucro: totalReceita - totalDespesa,
      };
    }));

    res.json(results.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/sync-status', async (req, res) => {
  try {
    await syncVehicleStatuses();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
