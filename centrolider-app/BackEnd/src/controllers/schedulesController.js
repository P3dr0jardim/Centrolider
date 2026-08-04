const Schedule = require('../models/Schedule');
const { syncVehicleStatuses } = require('../utils/syncStatus');
const { logActivity } = require('../utils/logActivity');
const { allowedVehicleIds, isVehicleAllowed } = require('../utils/fleetScope');

const TIPO_PT = {
  servico: 'Serviço', manutencao: 'Manutenção', inspecao: 'Inspeção',
  seguro: 'Seguro', outro: 'Outro',
};

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.viaturaId) {
      if (!(await isVehicleAllowed(req.user, req.query.viaturaId))) return res.status(403).json({ message: 'Access denied' });
      filter.viaturaId = req.query.viaturaId;
    } else {
      const allowed = await allowedVehicleIds(req.user);
      if (allowed !== null) filter.viaturaId = { $in: allowed };
    }
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
    if (!(await isVehicleAllowed(req.user, schedule.viaturaId?._id))) return res.status(403).json({ message: 'Access denied' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (!(await isVehicleAllowed(req.user, req.body.viaturaId))) return res.status(403).json({ message: 'Access denied' });
    const doc = await Schedule.create(req.body);
    const schedule = await doc.populate('viaturaId', 'matricula modelo frotaId');
    const mat = schedule.viaturaId?.matricula || '—';
    const tipo = TIPO_PT[schedule.tipoEvento] || schedule.tipoEvento || 'Evento';
    logActivity({
      user: req.user,
      acao: 'Agendou',
      entidade: 'Agenda',
      descricao: `Agendou ${tipo} para a viatura ${mat}`,
      referencia: mat,
      referenciaId: schedule._id,
      frotaIds: [schedule.viaturaId?.frotaId],
    });
    syncVehicleStatuses().catch(console.error);
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existing = await Schedule.findById(req.params.id).select('viaturaId');
    if (!existing) return res.status(404).json({ message: 'Schedule not found' });
    if (!(await isVehicleAllowed(req.user, existing.viaturaId))) return res.status(403).json({ message: 'Access denied' });
    if (req.body.viaturaId && !(await isVehicleAllowed(req.user, req.body.viaturaId))) return res.status(403).json({ message: 'Access denied' });

    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('viaturaId', 'matricula modelo frotaId');
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
      frotaIds: [schedule.viaturaId?.frotaId],
    });
    syncVehicleStatuses().catch(console.error);
    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const existing = await Schedule.findById(req.params.id).select('viaturaId').populate('viaturaId', 'frotaId');
    if (!existing) return res.status(404).json({ message: 'Schedule not found' });
    if (!(await isVehicleAllowed(req.user, existing.viaturaId?._id))) return res.status(403).json({ message: 'Access denied' });

    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    logActivity({
      user: req.user,
      acao: 'Eliminou',
      entidade: 'Agenda',
      descricao: `Eliminou agendamento de ${TIPO_PT[schedule.tipoEvento] || schedule.tipoEvento || 'Evento'}`,
      referenciaId: schedule._id,
      frotaIds: [existing.viaturaId?.frotaId],
    });
    syncVehicleStatuses().catch(console.error);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
