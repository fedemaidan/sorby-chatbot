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

/**
 * Crea un mensaje. Vos tenés que pasar id_conversacion.
 * Campos mínimos: { id_conversacion }
 * Otros campos son libres y opcionales (message, type, caption, emisor, receptor, etc).
 */
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

    // timestamps de servidor
    createdAt: t,
    updatedAt: t,
  };

  await col.insertOne(doc);
  return doc;
}

/**
 * Lista mensajes por conversación.
 * @param {string} id_conversacion
 * @param {number} limit - default 100
 * @param {1|-1} sort - 1 asc (antiguos→nuevos), -1 desc (nuevos→antiguos)
 */
async function getMensajesByConversacionId({ id_conversacion, limit = 30, sort = 1 }) {
  if (!id_conversacion) throw new Error("id_conversacion es requerido");
  const col = await getCol();

  return col
    .find({ id_conversacion: String(id_conversacion) })
    .sort({ createdAt: sort })
    .limit(limit)
    .toArray();
}

/**
 * Devuelve el último mensaje global o de una conversación (si se pasa id_conversacion)
 */
async function getUltmensaje({ id_conversacion } = {}) {
  const col = await getCol();
  const query = id_conversacion ? { id_conversacion: String(id_conversacion) } : {};
  const doc = await col.find(query).sort({ createdAt: -1 }).limit(1).next();
  return doc ?? null;
}

module.exports = {
  create,
  getMensajesByConversacionId,
  getUltmensaje,
};