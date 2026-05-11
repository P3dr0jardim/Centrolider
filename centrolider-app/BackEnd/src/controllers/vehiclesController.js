const Vehicle = require('../models/Vehicle');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.frotaId) filter.frotaId = req.query.frotaId;
    if (req.query.status) filter.status = req.query.status;
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
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Matricula already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updateData = { ...req.body };
    // If status is being manually changed, prevent the sync from auto-reverting it
    if (updateData.status !== undefined) {
      updateData.scheduleAutoStatus = false;
    }
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Matricula already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMaintenanceRecord = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    vehicle.historicoManutencao.push(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addAttachment = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    vehicle.attachments.push({
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      description: req.body.description || '',
      data: req.body.data ? new Date(req.body.data) : new Date(),
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
