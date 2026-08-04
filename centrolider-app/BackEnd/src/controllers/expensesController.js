const Expense = require('../models/Expense');
const { logActivity } = require('../utils/logActivity');
const { allowedVehicleIds, isVehicleAllowed } = require('../utils/fleetScope');

const TIPO_PT = {
  manutencao: 'Manutenção', reparacao: 'Reparação', combustivel: 'Combustível',
  portagem: 'Portagem', seguro: 'Seguro', inspecao: 'Inspeção',
  multa: 'Multa', outro: 'Outro',
};

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
    const expenses = await Expense.find(filter).populate('vehicleId', 'matricula modelo').sort({ data: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('vehicleId', 'matricula modelo');
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (!(await isVehicleAllowed(req.user, expense.vehicleId?._id))) return res.status(403).json({ message: 'Access denied' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (!(await isVehicleAllowed(req.user, req.body.vehicleId))) return res.status(403).json({ message: 'Access denied' });
    const expense = await Expense.create(req.body);
    await expense.populate('vehicleId', 'matricula modelo frotaId');
    const mat = expense.vehicleId?.matricula || '—';
    logActivity({
      user: req.user,
      acao: 'Registou',
      entidade: 'Despesa',
      descricao: `Registou despesa de ${TIPO_PT[expense.tipo] || expense.tipo} (€${expense.valor}) na viatura ${mat}`,
      referencia: mat,
      referenciaId: expense._id,
      frotaIds: [expense.vehicleId?.frotaId],
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existing = await Expense.findById(req.params.id).select('vehicleId');
    if (!existing) return res.status(404).json({ message: 'Expense not found' });
    if (!(await isVehicleAllowed(req.user, existing.vehicleId))) return res.status(403).json({ message: 'Access denied' });
    if (req.body.vehicleId && !(await isVehicleAllowed(req.user, req.body.vehicleId))) return res.status(403).json({ message: 'Access denied' });

    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('vehicleId', 'matricula modelo frotaId');
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    const mat = expense.vehicleId?.matricula || '—';
    logActivity({
      user: req.user,
      acao: 'Editou',
      entidade: 'Despesa',
      descricao: `Editou despesa de ${TIPO_PT[expense.tipo] || expense.tipo} (€${expense.valor}) na viatura ${mat}`,
      referencia: mat,
      referenciaId: expense._id,
      frotaIds: [expense.vehicleId?.frotaId],
    });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const existing = await Expense.findById(req.params.id).select('vehicleId').populate('vehicleId', 'frotaId');
    if (!existing) return res.status(404).json({ message: 'Expense not found' });
    if (!(await isVehicleAllowed(req.user, existing.vehicleId?._id))) return res.status(403).json({ message: 'Access denied' });

    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    logActivity({
      user: req.user,
      acao: 'Eliminou',
      entidade: 'Despesa',
      descricao: `Eliminou despesa de ${TIPO_PT[expense.tipo] || expense.tipo} (€${expense.valor})`,
      referenciaId: expense._id,
      frotaIds: [existing.vehicleId?.frotaId],
    });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
