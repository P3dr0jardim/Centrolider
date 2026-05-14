const Fleet = require('../models/Fleet');
const Vehicle = require('../models/Vehicle');
const { logActivity } = require('../utils/logActivity');

exports.getAll = async (req, res) => {
  try {
    const fleets = await Fleet.find().sort({ name: 1 });
    const withStats = await Promise.all(
      fleets.map(async (fleet) => {
        const vehicles = await Vehicle.find({ frotaId: fleet._id });
        return {
          ...fleet.toObject(),
          totalVehicles: vehicles.length,
          activeVehicles: vehicles.filter((v) => v.status === 'Operacional').length,
          maintenanceAlerts: vehicles.filter((v) => v.status === 'Manutenção').length,
        };
      })
    );
    res.json(withStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const fleet = await Fleet.findById(req.params.id);
    if (!fleet) return res.status(404).json({ message: 'Fleet not found' });
    res.json(fleet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const fleet = await Fleet.create(req.body);
    logActivity({
      user: req.user,
      acao: 'Criou',
      entidade: 'Frota',
      descricao: `Criou a frota "${fleet.name}"`,
      referencia: fleet.name,
      referenciaId: fleet._id,
    });
    res.status(201).json(fleet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const fleet = await Fleet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!fleet) return res.status(404).json({ message: 'Fleet not found' });
    logActivity({
      user: req.user,
      acao: 'Editou',
      entidade: 'Frota',
      descricao: `Editou a frota "${fleet.name}"`,
      referencia: fleet.name,
      referenciaId: fleet._id,
    });
    res.json(fleet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const vehicleCount = await Vehicle.countDocuments({ frotaId: req.params.id });
    if (vehicleCount > 0) {
      return res.status(400).json({ message: 'Cannot delete fleet with assigned vehicles' });
    }
    const fleet = await Fleet.findByIdAndDelete(req.params.id);
    if (!fleet) return res.status(404).json({ message: 'Fleet not found' });
    logActivity({
      user: req.user,
      acao: 'Eliminou',
      entidade: 'Frota',
      descricao: `Eliminou a frota "${fleet.name}"`,
      referenciaId: fleet._id,
    });
    res.json({ message: 'Fleet deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
