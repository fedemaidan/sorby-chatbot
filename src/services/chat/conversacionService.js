const repo = require("../../repository/mensajes.repository");
const repoc = require("../../repository/conversacion.repository");
const { ensureLimit, ensurePosInt, normalizeSort } = require("../../controller/utils/general");

// Devuelve el id de la conversación para un Lid (o null)
async function getIdConversacion({ Lid }) {
  console.log("Getting conversacion ID for Lid:", Lid);
  const id = await repoc.getIdConversacion({ Lid });
  return id ?? null;
}

// Crea la conversación usando el repo y devuelve el ID
async function createConversacion({ senderLid, empresa, profile, phone }) {  
  const conv = await repoc.createConversacion({
    Lid: senderLid,
    wPid: phone,
    empresa,
    profile,
  });
  return conv.id;
}

// obtiene una conversacion mediante su ID
async function getConversacionById(id, { limit, offset, sort } = {}) {
  if (!id) throw new Error('id_conversacion es requerido');

  const options = {
    limit: ensureLimit(limit ?? 100),
    offset: ensurePosInt(offset ?? 0),
    sort: normalizeSort((sort && sort.createdAt) ?? -1),
  };

  // items (ventana)
  const items = await repo.getMensajesByConversacionId({
    id_conversacion: id,
    filter: {},
    options
  });

  // total
  const col = await repo.__getColMensajes();
  const total = await col.countDocuments({ id_conversacion: String(id) });

  return { items, total };
}

// obtiene las conversaciones con su último mensaje.
async function getConversaciones({
  limit = 150,
  offset = 0,
  sort = -1,
  filter = {},
  withUltimoMensaje = true
} = {}) {
  const options = {
    limit: ensureLimit(limit),
    offset: ensurePosInt(offset),
    sort: normalizeSort(sort)
  };

  return repoc.listConversaciones({ filter, options, withUltimoMensaje });
}

module.exports = {
  getIdConversacion,
  getConversaciones,
  createConversacion,
  getConversacionById
};