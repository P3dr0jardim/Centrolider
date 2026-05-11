const Schedule = require('../models/Schedule');
const { syncVehicleStatuses } = require('../utils/syncStatus');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.viaturaId) filter.viaturaId = req.query.viaturaId;
    if (req.query.tipoEvento) filter.tipoEvento = req.query.tipoEvento;
    if (req.query.from || req.query.to) {
      filter.dataInicio = {};
      if (req.query.from) filter.dataInicio.$gte = new Date(req.query.from);
      if (req.query.to) filter.dataInicio.$lte = new Date(req.query.to);
    }
    const schedules = await Schedule.find(filter)
      .populate('viaturaId', 'matricula modelo')
      .sort({ dataInicio: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('viaturaId', 'matricula modelo');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const doc = await Schedule.create(req.body);
    const schedule = await doc.populate('viaturaId', 'matricula modelo');
    syncVehicleStatuses().catch(console.error);
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('viaturaId', 'matricula modelo');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    syncVehicleStatuses().catch(console.error);
    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    syncVehicleStatuses().catch(console.error);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
