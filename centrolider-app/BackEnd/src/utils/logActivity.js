const Log = require('../models/Log');

async function logActivity({ user, acao, entidade, descricao, referencia, referenciaId }) {
  try {
    await Log.create({
      userId:       user?._id,
      userName:     user?.name || user?.username || 'Sistema',
      acao,
      entidade,
      descricao,
      referencia:   referencia || undefined,
      referenciaId: referenciaId ? String(referenciaId) : undefined,
    });
  } catch (e) {
    console.error('[logActivity]', e.message);
  }
}

module.exports = { logActivity };
