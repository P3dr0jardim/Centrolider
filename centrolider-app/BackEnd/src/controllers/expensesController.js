const Expense = require('../models/Expense');
const { logActivity } = require('../utils/logActivity');

const TIPO_PT = {
  manutencao: 'Manutenção', reparacao: 'Reparação', combustivel: 'Combustível',
  portagem: 'Portagem', seguro: 'Seguro', inspecao: 'Inspeção',
  multa: 'Multa', outro: 'Outro',
};

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vehicleId) filter.vehicleId = req.query.vehicleId;
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
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    await expense.populate('vehicleId', 'matricula modelo');
    const mat = expense.vehicleId?.matricula || '—';
    logActivity({
      user: req.user,
      acao: 'Registou',
      entidade: 'Despesa',
      descricao: `Registou despesa de ${TIPO_PT[expense.tipo] || expense.tipo} (€${expense.valor}) na viatura ${mat}`,
      referencia: mat,
      referenciaId: expense._id,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('vehicleId', 'matricula modelo');
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    const mat = expense.vehicleId?.matricula || '—';
    logActivity({
      user: req.user,
      acao: 'Editou',
      entidade: 'Despesa',
      descricao: `Editou despesa de ${TIPO_PT[expense.tipo] || expense.tipo} (€${expense.valor}) na viatura ${mat}`,
      referencia: mat,
      referenciaId: expense._id,
    });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    logActivity({
      user: req.user,
      acao: 'Eliminou',
      entidade: 'Despesa',
      descricao: `Eliminou despesa de ${TIPO_PT[expense.tipo] || expense.tipo} (€${expense.valor})`,
      referenciaId: expense._id,
    });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
