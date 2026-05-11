const Revenue = require('../models/Revenue');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vehicleId) filter.vehicleId = req.query.vehicleId;
    if (req.query.tipo) filter.tipo = req.query.tipo;
    if (req.query.from || req.query.to) {
      filter.data = {};
      if (req.query.from) filter.data.$gte = new Date(req.query.from);
      if (req.query.to) filter.data.$lte = new Date(req.query.to);
    }
    const revenues = await Revenue.find(filter)
      .populate('vehicleId', 'matricula modelo')
      .sort({ data: -1 });
    res.json(revenues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const revenue = await Revenue.findById(req.params.id).populate('vehicleId', 'matricula modelo');
    if (!revenue) return res.status(404).json({ message: 'Revenue not found' });
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const revenue = await Revenue.create(req.body);
    res.status(201).json(revenue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const revenue = await Revenue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!revenue) return res.status(404).json({ message: 'Revenue not found' });
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const revenue = await Revenue.findByIdAndDelete(req.params.id);
    if (!revenue) return res.status(404).json({ message: 'Revenue not found' });
    res.json({ message: 'Revenue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
