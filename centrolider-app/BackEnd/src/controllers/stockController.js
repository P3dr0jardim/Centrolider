const StockItem = require('../models/StockItem');
const { logActivity } = require('../utils/logActivity');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.categoria) filter.categoria = req.query.categoria;
    if (req.query.lowStock === 'true') {
      filter.$expr = { $lte: ['$quantidade', '$minimo'] };
    }
    const items = await StockItem.find(filter).sort({ categoria: 1, nome: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await StockItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Stock item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await StockItem.create(req.body);
    logActivity({
      user: req.user,
      acao: 'Adicionou',
      entidade: 'Stock',
      descricao: `Adicionou item de stock: ${item.nome} (${item.quantidade} un)`,
      referencia: item.nome,
      referenciaId: item._id,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await StockItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Stock item not found' });
    logActivity({
      user: req.user,
      acao: 'Editou',
      entidade: 'Stock',
      descricao: `Editou item de stock: ${item.nome}`,
      referencia: item.nome,
      referenciaId: item._id,
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await StockItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Stock item not found' });
    logActivity({
      user: req.user,
      acao: 'Eliminou',
      entidade: 'Stock',
      descricao: `Eliminou item de stock: ${item.nome}`,
      referenciaId: item._id,
    });
    res.json({ message: 'Stock item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/stock/consume
// Decrements stock for known items; creates new item for unknowns; records history for both.
exports.consume = async (req, res) => {
  try {
    const { vehicleId, matricula, modelo, data, descricao, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items array required' });
    }

    const histEntry = (qty) => ({
      vehicleId,
      matricula,
      modelo,
      quantidade: qty,
      data: data ? new Date(data) : new Date(),
      descricao: descricao || '',
    });

    const results = [];

    for (const item of items) {
      if (item.stockItemId) {
        const doc = await StockItem.findById(item.stockItemId);
        if (doc) {
          doc.quantidade = Math.max(0, doc.quantidade - item.quantidade);
          doc.historico.push(histEntry(item.quantidade));
          await doc.save();
          results.push(doc);
        }
      } else {
        const doc = await StockItem.create({
          nome: item.nome,
          categoria: item.categoria || 'outros',
          quantidade: 0,
          minimo: 0,
          historico: [histEntry(item.quantidade)],
        });
        results.push(doc);
      }
    }

    const nomes = items.map(i => i.nome).join(', ');
    logActivity({
      user: req.user,
      acao: 'Consumiu',
      entidade: 'Stock',
      descricao: `Consumiu stock para viatura ${matricula || '—'}: ${nomes}`,
      referencia: matricula,
      referenciaId: vehicleId,
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
