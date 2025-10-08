const mongoose = require("mongoose");
function now() { return new Date(); }

let colConversacionesPromise = null;
async function getConversacionesCol() {
  if (!mongoose.connection?.db) {
    throw new Error("Mongo no conectado. Llamaron al repo antes de connectToMongoDB().");
  }
  if (!colConversacionesPromise) {
    colConversacionesPromise = (async () => {
      const col = mongoose.connection.db.collection("conversaciones");

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
      await col.createIndex({ id_conversacion: 1, createdAt: -1 }, { name: "by_conv_created_desc" });
      return col;
    })();
  }
  return colMensajesPromise;
}

async function obtenerphone({ Lid }) {
  if (typeof Lid === 'undefined' || Lid === null || String(Lid) === '') {
    throw new Error('Lid es requerido');
  }
  const col = await getConversacionesCol();
  const doc = await col.findOne(
    { lid: String(Lid) },
    { projection: { wPid: 1, _id: 0 } } // ← pedimos wPid (no _id)
  );
  return doc?.wPid ?? null; // ← devolvemos el wPid (o null si no existe)
}

/** 🔎 Obtener _id por Lid (match exacto) */
async function getIdConversacionByLid({ Lid }) {
  if (typeof Lid === 'undefined' || Lid === null || String(Lid) === '') {
    throw new Error('Lid es requerido');
  }
  const col = await getConversacionesCol();
  const doc = await col.findOne({ lid: String(Lid) }, { projection: { _id: 1 } });
  return doc ? doc._id : null; // <- devolvemos _id (ObjectId)
}

/** 🔎 Obtener _id por wPid (remoteJid tal cual) */
async function getIdConversacionByWpid({ wPid }) {
  if (typeof wPid === 'undefined' || wPid === null || String(wPid) === '') {
    throw new Error('wPid es requerido');
  }
  const col = await getConversacionesCol();
  const doc = await col.findOne({ wPid: String(wPid) }, { projection: { _id: 1 } });
  return doc ? doc._id : null; // <- devolvemos _id (ObjectId)
}

/** ✅ Crear conversación nueva (sin uuid "id"; usamos _id de Mongo) */
async function createConversacion({ Lid, empresa, profile, wPid }) {

  const col = await getConversacionesCol();
  const t = now();

  const conversacion = {
    lid: String(Lid),
    wPid: wPid == null ? null : String(wPid),
    empresa: empresa ?? null,
    profile: profile ?? null,
    createdAt: t,
    updatedAt: t,
  };

  const { insertedId } = await col.insertOne(conversacion);
  return { _id: insertedId, ...conversacion }; // <- devolvemos _id real
}

/**
 * Lista conversaciones + (opcional) su último mensaje
 * Une _id(ObjectId) con mensajes.id_conversacion(string)
 */
async function listConversaciones({ filter = {}, options = {}, withUltimoMensaje = true } = {}) {
  const col = await getConversacionesCol();

  const limit = Math.max(1, Math.min(Number(options.limit ?? 150), 500));
  const offset = Math.max(0, Number(options.offset ?? 0));
  const sortDir = Number(options.sort ?? -1) === 1 ? 1 : -1;

  const query = {};
  if (filter.lid)  query.lid  = String(filter.lid);
  if (filter.wPid) query.wPid = String(filter.wPid);
  if (typeof filter.empresa !== "undefined") query.empresa = filter.empresa;

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
          let: { convId: { $toString: "$_id" } },        // <- convertimos _id → string
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
  getIdConversacionByLid,
  getIdConversacionByWpid,
  createConversacion,
  getConversacionesCol,
  obtenerphone
};
