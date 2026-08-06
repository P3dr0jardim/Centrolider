const Vehicle = require('../models/Vehicle');
const { logActivity } = require('../utils/logActivity');
const { vehicleFleetFilter, isFleetAllowed } = require('../utils/fleetScope');

exports.getAll = async (req, res) => {
  try {
    const filter = { ...vehicleFleetFilter(req.user) };
    if (req.query.frotaId) {
      if (!isFleetAllowed(req.user, req.query.frotaId)) return res.status(403).json({ message: 'Access denied' });
      filter.frotaId = req.query.frotaId;
    }
    if (req.query.status)  filter.status  = req.query.status;
    const vehicles = await Vehicle.find(filter).populate('frotaId', 'name').sort({ matricula: 1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('frotaId', 'name');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!isFleetAllowed(req.user, vehicle.frotaId?._id || vehicle.frotaId)) return res.status(403).json({ message: 'Access denied' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (!isFleetAllowed(req.user, req.body.frotaId)) return res.status(403).json({ message: 'Access denied' });
    const body = { ...req.body };
    if (body.km != null) body.kmInicial = Number(body.km);
    const vehicle = await Vehicle.create(body);
    logActivity({
      user: req.user,
      acao: 'Adicionou',
      entidade: 'Viatura',
      descricao: `Adicionou a viatura ${vehicle.matricula} (${vehicle.modelo})`,
      referencia: vehicle.matricula,
      referenciaId: vehicle._id,
      frotaIds: [vehicle.frotaId],
    });
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Matricula already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existing = await Vehicle.findById(req.params.id).select('frotaId');
    if (!existing) return res.status(404).json({ message: 'Vehicle not found' });
    if (!isFleetAllowed(req.user, existing.frotaId)) return res.status(403).json({ message: 'Access denied' });
    if (req.body.frotaId && !isFleetAllowed(req.user, req.body.frotaId)) return res.status(403).json({ message: 'Access denied' });

    const updateData = { ...req.body };
    // km and kmInicial are managed exclusively through maintenance records
    delete updateData.km;
    delete updateData.kmInicial;
    if (updateData.status !== undefined) {
      updateData.scheduleAutoStatus = false;
      const current = await Vehicle.findById(req.params.id).select('status');
      if (updateData.status === 'Manutenção' && current?.status !== 'Manutenção') {
        updateData.manutencaoDesde = new Date();
      } else if (updateData.status !== 'Manutenção') {
        updateData.manutencaoDesde = null;
      }
    }
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    logActivity({
      user: req.user,
      acao: 'Editou',
      entidade: 'Viatura',
      descricao: `Editou a viatura ${vehicle.matricula} (${vehicle.modelo})`,
      referencia: vehicle.matricula,
      referenciaId: vehicle._id,
      frotaIds: [vehicle.frotaId],
    });
    res.json(vehicle);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Matricula already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.bulkUpdateFinancial = async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0)
      return res.status(400).json({ message: 'updates array required' });

    const now = new Date();
    const results = await Promise.all(
      updates.map(async ({ id, leasing, seguroValor, iuc, rentabilidade }) => {
        const current = await Vehicle.findById(id).select('leasing seguroValor iuc rentabilidade frotaId');
        if (!current) return null;
        if (!isFleetAllowed(req.user, current.frotaId)) return null;

        const fields = { valoresFinanceirosEm: now };
        const histEntries = [];

        const check = (campo, incoming) => {
          if (incoming === undefined) return;
          fields[campo] = incoming;
          if (incoming !== current[campo]) {
            histEntries.push({ campo, valorAnterior: current[campo] ?? null, valorNovo: incoming, data: now });
          }
        };
        check('leasing',       leasing);
        check('seguroValor',   seguroValor);
        check('iuc',           iuc);
        check('rentabilidade', rentabilidade);

        const update = { $set: fields };
        if (histEntries.length > 0) update.$push = { historicoFinanceiro: { $each: histEntries } };

        return Vehicle.findByIdAndUpdate(id, update, { new: true, runValidators: true });
      })
    );
    res.json(results.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkConfirmFinancial = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ message: 'ids array required' });

    const allowedVehicles = await Vehicle.find({ _id: { $in: ids }, ...vehicleFleetFilter(req.user) }).select('_id');
    const allowedIds = allowedVehicles.map((v) => v._id);

    await Vehicle.updateMany({ _id: { $in: allowedIds } }, { valoresFinanceirosEm: new Date() });
    res.json({ confirmed: allowedIds.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const existing = await Vehicle.findById(req.params.id).select('frotaId');
    if (!existing) return res.status(404).json({ message: 'Vehicle not found' });
    if (!isFleetAllowed(req.user, existing.frotaId)) return res.status(403).json({ message: 'Access denied' });

    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    logActivity({
      user: req.user,
      acao: 'Eliminou',
      entidade: 'Viatura',
      descricao: `Eliminou a viatura ${vehicle.matricula} (${vehicle.modelo})`,
      referencia: vehicle.matricula,
      referenciaId: vehicle._id,
      frotaIds: [vehicle.frotaId],
    });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function recomputeKm(vehicle) {
  const readings = vehicle.historicoManutencao.map((r) => r.kms).filter((k) => k != null && k > 0);
  vehicle.km = readings.length > 0 ? Math.max(vehicle.kmInicial || 0, ...readings) : (vehicle.kmInicial || 0);
}

exports.addMaintenanceRecord = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!isFleetAllowed(req.user, vehicle.frotaId)) return res.status(403).json({ message: 'Access denied' });
    vehicle.historicoManutencao.push(req.body);
    recomputeKm(vehicle);
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMaintenanceRecord = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!isFleetAllowed(req.user, vehicle.frotaId)) return res.status(403).json({ message: 'Access denied' });
    const record = vehicle.historicoManutencao.id(req.params.recordId);
    if (!record) return res.status(404).json({ message: 'Maintenance record not found' });
    Object.assign(record, req.body);
    recomputeKm(vehicle);
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMaintenanceRecord = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!isFleetAllowed(req.user, vehicle.frotaId)) return res.status(403).json({ message: 'Access denied' });
    vehicle.historicoManutencao.pull({ _id: req.params.recordId });
    recomputeKm(vehicle);
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addAttachment = async (req, res) => {
  const fs = require('fs');
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (!isFleetAllowed(req.user, vehicle.frotaId)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(403).json({ message: 'Access denied' });
    }

    // Kept on disk (uploads/) rather than embedded in the Vehicle document — a vehicle
    // that accumulates several attachments would otherwise push the document past
    // MongoDB's 16MB per-document limit, causing save() to fail intermittently.
    vehicle.attachments.push({
      originalName: req.file.originalname,
      filename:     req.file.filename,
      mimetype:     req.file.mimetype,
      size:         req.file.size,
      description:  req.body.description || '',
      data:         req.body.data ? new Date(req.body.data) : new Date(),
      manutencaoId: req.body.manutencaoId || undefined,
    });
    await vehicle.save();

    res.json(vehicle);
  } catch (err) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    res.status(500).json({ message: err.message });
  }
};

exports.editAttachment = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!isFleetAllowed(req.user, vehicle.frotaId)) return res.status(403).json({ message: 'Access denied' });
    const att = vehicle.attachments.id(req.params.attachmentId);
    if (!att) return res.status(404).json({ message: 'Attachment not found' });
    if (req.body.description !== undefined) att.description = req.body.description;
    if (req.body.originalName !== undefined) att.originalName = req.body.originalName;
    if (req.body.data !== undefined) att.data = new Date(req.body.data);
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleArchiveAttachment = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!isFleetAllowed(req.user, vehicle.frotaId)) return res.status(403).json({ message: 'Access denied' });
    const att = vehicle.attachments.id(req.params.attachmentId);
    if (!att) return res.status(404).json({ message: 'Attachment not found' });
    att.archived = !att.archived;
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downloadAttachment = async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  try {
    // Include fileData (excluded by default via select:false)
    const vehicle = await Vehicle.findById(req.params.id).select('+attachments.fileData');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!isFleetAllowed(req.user, vehicle.frotaId)) return res.status(403).json({ message: 'Access denied' });

    const att = vehicle.attachments.id(req.params.attachmentId);
    if (!att) return res.status(404).json({ message: 'Attachment not found' });

    // Current uploads: served from disk
    const diskPath = att.filename
      ? path.join(__dirname, '../../uploads', att.filename)
      : null;

    if (diskPath && fs.existsSync(diskPath)) {
      res.set({
        'Content-Type':        att.mimetype || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(att.originalName || att.filename)}"`,
      });
      return res.sendFile(diskPath);
    }

    // Legacy uploads: some older attachments were embedded as a buffer in the Vehicle document
    if (att.fileData && att.fileData.length > 0) {
      res.set({
        'Content-Type':        att.mimetype || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(att.originalName || att.filename)}"`,
        'Content-Length':      att.fileData.length,
      });
      return res.send(att.fileData);
    }

    res.status(404).json({ message: 'File not found on disk. It may have been uploaded on a different server.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
