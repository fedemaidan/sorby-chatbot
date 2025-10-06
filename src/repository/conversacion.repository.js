const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
function now() { return new Date(); }

let colConversacionesPromise = null;
async function getConversacionesCol() {
  if (!mongoose.connection?.db) {
    throw new Error("Mongo no conectado. Llamaron al repo antes de connectToMongoDB().");
  }
  if (!colConversacionesPromise) {
    colConversacionesPromise = (async () => {
      const col = mongoose.connection.db.collection("conversaciones");
      // Índices
      await col.createIndex({ id: 1 }, { unique: true, name: "uniq_conversacion_id" });
      await col.createIndex({ lid: 1 }, { unique: true, name: "uniq_lid" });
      await col.createIndex({ wPid: 1 }, { name: "by_wPid" });
      await col.createIndex({ updatedAt: -1 }, { name: "by_updatedAt_desc" });
      return col;
    })();
  }
  return colConversacionesPromise;
}

let colMensajesPromise = null;
async function getMensajesCol() {
  if (!mongoose.connection?.db) {
    throw new Error("Mongo no conectado. Llamaron al repo antes de connectToMongoDB().");
  }
  if (!colMensajesPromise) {
    colMensajesPromise = (async () => {
      const col = mongoose.connection.db.collection("mensajes");
      // Índices clave para el lookup del último mensaje:
      await col.createIndex({ id_conversacion: 1, createdAt: -1 }, { name: "by_conv_created_desc" });
      return col;
    })();
  }
  return colMensajesPromise;
}

/** ✅ Devuelve el id de la conversación asociado a un Lid (match exacto) */
async function getIdConversacion({ Lid, remoteJid }) {
  if (typeof Lid === "undefined" || Lid === null || Lid === "") {
    throw new Error("Lid es requerido");
  }
  const col = await getConversacionesCol();
  const doc = await col.findOne({ lid: String(Lid) }, { projection: { id: 1 } });
  return doc ? doc.id : null;
}

/** ✅ Crea una conversación nueva (1 conv por Lid) */
async function createConversacion({ Lid, empresa, profile, wPid }) {
  if (typeof Lid === "undefined" || Lid === null || Lid === "") {
    throw new Error("Lid es requerido");
  }
  const col = await getConversacionesCol();
  const t = now();

  const conversacion = {
    id: uuidv4(),
    lid: String(Lid),
    wPid: wPid,
    empresa: empresa ?? null,
    profile: profile ?? null,
    createdAt: t,
    updatedAt: t,
  };

  await col.insertOne(conversacion);
  return conversacion;
}
/**
 * Lista conversaciones + (opcional) su último mensaje
 * @param {Object} params
 * @param {Object} [params.filter] Filtros sobre conversaciones (lid, wPid, empresa, etc.)
 * @param {Object} [params.options] { limit, offset, sort } sort aplica a updatedAt
 * @param {boolean} [params.withUltimoMensaje=true]
 */
async function listConversaciones({ filter = {}, options = {}, withUltimoMensaje = true } = {}) {
  const col = await getConversacionesCol();

  const limit = Math.max(1, Math.min(Number(options.limit ?? 150), 500));
  const offset = Math.max(0, Number(options.offset ?? 0));
  const sortDir = Number(options.sort ?? -1) === 1 ? 1 : -1;

  // Limpieza de filtro básica
  const query = {};
  if (filter.lid) query.lid = String(filter.lid);
  if (filter.wPid) query.wPid = String(filter.wPid);
  if (typeof filter.empresa !== "undefined") query.empresa = filter.empresa;

  // Pipeline base
  const pipeline = [
    { $match: query },
    { $sort: { updatedAt: sortDir } },
    { $skip: offset },
    { $limit: limit },
  ];

  if (withUltimoMensaje) {
    pipeline.push(
      {
        $lookup: {
          from: "mensajes",
          let: { convId: "$id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$id_conversacion", "$$convId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: "ultimoMensaje"
        }
      },
      { $addFields: { ultimoMensaje: { $arrayElemAt: ["$ultimoMensaje", 0] } } }
    );
  }

  return col.aggregate(pipeline).toArray();
}

module.exports = {
  listConversaciones,
  getMensajesCol, 
  getIdConversacion,
  createConversacion
};