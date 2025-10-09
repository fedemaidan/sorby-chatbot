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
  if (typeof Lid === 'undefined' || Lid === null || String(Lid) === '') {
  }
  const col = await getConversacionesCol();
  const doc = await col.findOne({ lid: String(Lid) });
  return doc || null;
}


let colConversacionesPromise = null;
async function getConversacionesCol() {
  if (!mongoose.connection?.db) {
    throw new Error("Mongo no conectado. Llamaron al repo antes de connectToMongoDB().");
  }
  if (!colConversacionesPromise) {
    colConversacionesPromise = (async () => {
      const col = mongoose.connection.db.collection("conversaciones");
      await col.createIndex({ lid: 1 }, { name: "uniq_lid" });
      await col.createIndex({ wPid: 1 }, { name: "by_wPid" });
      await col.createIndex({ updatedAt: -1 }, { name: "by_updatedAt_desc" });
      return col;
    })();
  }
  return colConversacionesPromise;
}

/** 🔎 Conversación completa por wPid (remoteJid tal cual) */
async function getIdConversacionByWpid({ wPid }) {
  const col = await getConversacionesCol();
  const doc = await col.findOne({ wPid: String(wPid) });
  return doc || null;
}

async function createConversacion({ senderLid, empresa, profile, phone, emisor = "Usuario" }) {  
  const conv = await repoc.createConversacion({ Lid: senderLid, wPid: phone, empresa, profile, emisor });
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


async function getOrCreateConversacion({ wPidFinal, lidFinal, emisor, empresa, profile }) {
  // 1) buscar conversación (doc completo)
  let conv = null;
  if (wPidFinal) conv = await repoc.getIdConversacionByWpid({ wPid: wPidFinal });
  if (!conv && lidFinal) conv = await repoc.getIdConversacionByLid({ Lid: lidFinal });

  // 2) crear si no existe
  if (!conv) {
    const idCreado = await createConversacion({
      senderLid: lidFinal ?? null,
      empresa,
      profile,
      phone: wPidFinal ?? null,
      emisor
    });
    return String(idCreado);
  }

  // 3) completar lo que falte (solo lid / wPid)
  if (!conv.lid && lidFinal) {
    await repoc.setLidById({ id: conv._id, lid: String(lidFinal) });
  }
  if (!conv.wPid && wPidFinal) {
    await repoc.setWpidById({ id: conv._id, wPid: String(wPidFinal) });
  }

  // 4) devolver solo el id
  return conv._id;
}

module.exports = {
  getIdConversacionByLid,
  getIdConversacionByWpid,
  getConversaciones,
  createConversacion,
  getOrCreateConversacion,
  getConversacionById
};
