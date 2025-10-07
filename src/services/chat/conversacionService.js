// services/chat/conversacionService.js
const repo = require("../../repository/mensajes.repository");
const repoc = require("../../repository/conversacion.repository");
const { ensureLimit, ensurePosInt, normalizeSort } = require("../../controller/utils/general");

// ---------- helpers ----------
function parseSort(raw, field = 'updatedAt', def = -1) {
  if (raw == null) return def;
  if (typeof raw === 'number') return normalizeSort(raw);
  if (typeof raw === 'string') return raw.toLowerCase() === 'asc' ? 1 : -1;
  if (typeof raw === 'object') {
    if (typeof raw[field] !== 'undefined') return normalizeSort(raw[field]);
    // fallback: si viene {createdAt:...} cuando field es updatedAt o viceversa
    const altField = field === 'updatedAt' ? 'createdAt' : 'updatedAt';
    if (typeof raw[altField] !== 'undefined') return normalizeSort(raw[altField]);
  }
  return def;
}

function pick(valA, valB, fallback) {
  return (valA ?? valB ?? fallback);
}

// ---------- IDs: devolvemos siempre string del _id ----------
async function getIdConversacionByLid({ Lid }) {
  const _id = await repoc.getIdConversacionByLid({ Lid });
  return _id ? String(_id) : null;
}

async function getIdConversacionByWpid({ wPid }) {
  const _id = await repoc.getIdConversacionByWpid({ wPid });
  return _id ? String(_id) : null;
}

async function createConversacion({ senderLid, empresa, profile, phone }) {  
  const conv = await repoc.createConversacion({ Lid: senderLid, wPid: phone, empresa, profile });
  const _id = conv?._id ?? conv?.id;
  return _id ? String(_id) : null;
}

// ---------- Conversación por ID (mensajes) ----------
async function getConversacionById(id, { limit, offset, sort } = {}) {
  if (!id) throw new Error('id_conversacion es requerido');

  const sortNum = parseSort(sort, 'createdAt', -1);
  const options = {
    limit: ensureLimit(pick(limit, undefined, 100)),
    offset: ensurePosInt(pick(offset, undefined, 0)),
    sort: sortNum,
  };

  const items = await repo.getMensajesByConversacionId({
    id_conversacion: String(id),
    filter: {},
    options
  });

  const col = await repo.__getColMensajes();
  const total = await col.countDocuments({ id_conversacion: String(id) });

  return { items, total };
}

// ---------- Listado de conversaciones ----------
async function getConversaciones({
  // soportamos ambos estilos: top-level o dentro de options
  filter, filters, options = {}, limit, offset, sort, withUltimoMensaje = true
} = {}) {
  const finalFilter = { ...(filters || {}), ...(filter || {}) };

  const finalLimit  = ensureLimit(pick(options.limit,  limit, 150));
  const finalOffset = ensurePosInt(pick(options.offset, offset, 0));
  const rawSort     = pick(options.sort, sort, -1);
  const finalSort   = parseSort(rawSort, 'updatedAt', -1);

  return repoc.listConversaciones({
    filter: finalFilter,
    options: { limit: finalLimit, offset: finalOffset, sort: finalSort },
    withUltimoMensaje
  });
}

module.exports = {
  getIdConversacionByLid,
  getIdConversacionByWpid,
  getConversaciones,
  createConversacion,
  getConversacionById
};
