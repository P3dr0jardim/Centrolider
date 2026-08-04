const Revenue = require('../models/Revenue');
const { logActivity } = require('../utils/logActivity');
const { allowedVehicleIds, isVehicleAllowed } = require('../utils/fleetScope');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vehicleId) {
      if (!(await isVehicleAllowed(req.user, req.query.vehicleId))) return res.status(403).json({ message: 'Access denied' });
      filter.vehicleId = req.query.vehicleId;
    } else {
      const allowed = await allowedVehicleIds(req.user);
      if (allowed !== null) filter.vehicleId = { $in: allowed };
    }
    if (req.query.tipo) filter.tipo = req.query.tipo;
    if (req.query.from || req.query.to) {
      filter.data = {};
      if (req.query.from) filter.data.$gte = new Date(req.query.from);
      if (req.query.to)   filter.data.$lte = new Date(req.query.to);
    }
    const revenues = await Revenue.find(filter).populate('vehicleId', 'matricula modelo').sort({ data: -1 });
    res.json(revenues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const revenue = await Revenue.findById(req.params.id).populate('vehicleId', 'matricula modelo');
    if (!revenue) return res.status(404).json({ message: 'Revenue not found' });
    if (!(await isVehicleAllowed(req.user, revenue.vehicleId?._id))) return res.status(403).json({ message: 'Access denied' });
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (!(await isVehicleAllowed(req.user, req.body.vehicleId))) return res.status(403).json({ message: 'Access denied' });
    const revenue = await Revenue.create(req.body);
    await revenue.populate('vehicleId', 'matricula modelo frotaId');
    const mat = revenue.vehicleId?.matricula || '—';
    logActivity({
      user: req.user,
      acao: 'Registou',
      entidade: 'Receita',
      descricao: `Registou receita de €${revenue.valor} na viatura ${mat}`,
      referencia: mat,
      referenciaId: revenue._id,
      frotaIds: [revenue.vehicleId?.frotaId],
    });
    res.status(201).json(revenue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existing = await Revenue.findById(req.params.id).select('vehicleId');
    if (!existing) return res.status(404).json({ message: 'Revenue not found' });
    if (!(await isVehicleAllowed(req.user, existing.vehicleId))) return res.status(403).json({ message: 'Access denied' });
    if (req.body.vehicleId && !(await isVehicleAllowed(req.user, req.body.vehicleId))) return res.status(403).json({ message: 'Access denied' });

    const revenue = await Revenue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('vehicleId', 'matricula modelo frotaId');
    if (!revenue) return res.status(404).json({ message: 'Revenue not found' });
    const mat = revenue.vehicleId?.matricula || '—';
    logActivity({
      user: req.user,
      acao: 'Editou',
      entidade: 'Receita',
      descricao: `Editou receita de €${revenue.valor} na viatura ${mat}`,
      referencia: mat,
      referenciaId: revenue._id,
      frotaIds: [revenue.vehicleId?.frotaId],
    });
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const existing = await Revenue.findById(req.params.id).select('vehicleId').populate('vehicleId', 'frotaId');
    if (!existing) return res.status(404).json({ message: 'Revenue not found' });
    if (!(await isVehicleAllowed(req.user, existing.vehicleId?._id))) return res.status(403).json({ message: 'Access denied' });

    const revenue = await Revenue.findByIdAndDelete(req.params.id);
    if (!revenue) return res.status(404).json({ message: 'Revenue not found' });
    logActivity({
      user: req.user,
      acao: 'Eliminou',
      entidade: 'Receita',
      descricao: `Eliminou receita de €${revenue.valor}`,
      referenciaId: revenue._id,
      frotaIds: [existing.vehicleId?.frotaId],
    });
    res.json({ message: 'Revenue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
