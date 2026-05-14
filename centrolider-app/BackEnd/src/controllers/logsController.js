const Log = require('../models/Log');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.entidade) filter.entidade = req.query.entidade;
    if (req.query.userId)   filter.userId   = req.query.userId;
    if (req.query.from || req.query.to) {
      filter.data = {};
      if (req.query.from) filter.data.$gte = new Date(req.query.from);
      if (req.query.to)   filter.data.$lte = new Date(req.query.to);
    }

    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip  = parseInt(req.query.skip) || 0;

    const [logs, total] = await Promise.all([
      Log.find(filter).sort({ data: -1 }).skip(skip).limit(limit),
      Log.countDocuments(filter),
    ]);

    res.json({ logs, total, limit, skip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
