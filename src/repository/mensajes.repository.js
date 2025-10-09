const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const now = () => new Date();

let colPromise = null;
async function getCol() {
  if (!mongoose.connection?.db) {
    throw new Error("Mongo no conectado. Llamaron al repo antes de connectToMongoDB().");
  }
  if (!colPromise) {
    colPromise = (async () => {
      const col = mongoose.connection.db.collection("mensajes");
      // Índices útiles para timeline y búsquedas
      await col.createIndex({ id_conversacion: 1, createdAt: 1 }, { name: "by_conv_createdAt_asc" });
      await col.createIndex({ id_conversacion: 1, createdAt: -1 }, { name: "by_conv_createdAt_desc" });
      await col.createIndex({ createdAt: -1 }, { name: "by_createdAt_desc" });
      await col.createIndex({ id: 1 }, { unique: true, name: "uniq_msg_id" });
      return col;
    })();
  }
  return colPromise;
}

async function create(mensaje = {}) {
  if (!mensaje.id_conversacion) {
    throw new Error("id_conversacion es obligatorio para crear un mensaje");
  }

  const col = await getCol();
  const t = now();

  const doc = {
    id: uuidv4(),                 // id único del MENSAJE (no es la conversación)
    id_conversacion: String(mensaje.id_conversacion),

    // payload/contactos opcionales
    emisor: mensaje.emisor ?? null,
    receptor: mensaje.receptor ?? null,
    message: mensaje.message ?? null,
    type: mensaje.type ?? null,
    caption: mensaje.caption ?? null,
    fecha: mensaje.fecha ?? t,    // cuando ocurrió el evento (si no mandan, uso ahora)

    // blobs/objetos extra libres (si llegan, se guardan)
    empresa: mensaje.empresa ?? null,
    profile: mensaje.profile ?? null,
    flowdata: mensaje.flowdata ?? null,
    lid: mensaje.lid ?? null,
    fromMe: mensaje.fromMe,

    // timestamps de servidor
    createdAt: t,
    updatedAt: t,
  };

  await col.insertOne(doc);
  return doc;
}


async function getMensajesByConversacionId({ id_conversacion, filter = {}, options = {} }) {
  if (!id_conversacion) throw new Error("id_conversacion es requerido");
  const col = await getCol();

  const { id_conversacion: _ignore, ...safeFilter } = filter || {};
  const query = { id_conversacion: String(id_conversacion), ...safeFilter };

  const limit = Number.isFinite(+options.limit) ? +options.limit : 150;
  const offset = Number.isFinite(+options.offset) ? +options.offset : 0;
  const sort = (+options.sort || 1) >= 0 ? 1 : -1;

  return col.find(query).sort({ createdAt: sort }).skip(offset).limit(limit).toArray();
}

module.exports = {
  create,
  getMensajesByConversacionId,
  __getColMensajes: getCol,
};
