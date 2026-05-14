const Schedule = require('../models/Schedule');
const { syncVehicleStatuses } = require('../utils/syncStatus');
const { logActivity } = require('../utils/logActivity');

const TIPO_PT = {
  servico: 'Serviço', manutencao: 'Manutenção', inspecao: 'Inspeção',
  seguro: 'Seguro', outro: 'Outro',
};

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
    const mat = schedule.viaturaId?.matricula || '—';
    const tipo = TIPO_PT[schedule.tipoEvento] || schedule.tipoEvento || 'Evento';
    logActivity({
      user: req.user,
      acao: 'Agendou',
      entidade: 'Agenda',
      descricao: `Agendou ${tipo} para a viatura ${mat}`,
      referencia: mat,
      referenciaId: schedule._id,
    });
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
    const mat = schedule.viaturaId?.matricula || '—';
    const tipo = TIPO_PT[schedule.tipoEvento] || schedule.tipoEvento || 'Evento';
    logActivity({
      user: req.user,
      acao: 'Editou',
      entidade: 'Agenda',
      descricao: `Editou agendamento de ${tipo} para a viatura ${mat}`,
      referencia: mat,
      referenciaId: schedule._id,
    });
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
    logActivity({
      user: req.user,
      acao: 'Eliminou',
      entidade: 'Agenda',
      descricao: `Eliminou agendamento de ${TIPO_PT[schedule.tipoEvento] || schedule.tipoEvento || 'Evento'}`,
      referenciaId: schedule._id,
    });
    syncVehicleStatuses().catch(console.error);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
