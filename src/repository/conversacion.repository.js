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
      const col = mongoose.connection.db.collection("conversaciones");
      // Índices
      await col.createIndex({ id: 1 }, { unique: true, name: "uniq_conversacion_id" });
      await col.createIndex({ lid: 1 }, { unique: true, name: "uniq_lid" }); // 1 conv por Lid
      await col.createIndex({ wPid: 1 }, { name: "by_wPid" });               // buscar por wPid
      await col.createIndex({ updatedAt: -1 }, { name: "by_updatedAt_desc" });
      return col;
    })();
  }
  return colPromise;
}

/**
 * Devuelve el id de la conversación asociado a un Lid (o null si no existe).
 * @param {Object} params
 * @param {string|number} params.Lid
 * @returns {Promise<string|null>}
 */
async function getIdConversacion({ Lid }) {
  if (typeof Lid === "undefined" || Lid === null || Lid === "") {
    throw new Error("Lid es requerido");
  }
  const col = await getCol();
  const doc = await col.findOne(
    { lid: String(Lid) },
    { projection: { id: 1 } }
  );
  return doc ? doc.id : null;
}

/**
 * Crea una conversación nueva.
 * NOTA: hay un índice único por lid; si ya existe, insertOne va a tirar error.
 * @param {Object} params
 * @param {string|number} params.Lid
 * @param {any} [params.empresa]
 * @param {any} [params.profile]
 * @param {string|number} [params.wPid]
 * @returns {Promise<Object>} conversacion creada
 */
async function createConversacion({ Lid, empresa, profile, wPid }) {
  if (typeof Lid === "undefined" || Lid === null || Lid === "") {
    throw new Error("Lid es requerido");
  }

  const col = await getCol();
  const t = now();

  const conversacion = {
    id: uuidv4(),         // id único de la CONVERSACIÓN
    lid: String(Lid),     // id del lead/contacto externo (WhatsApp/Messenger/etc)
    wPid: typeof wPid === "undefined" || wPid === null ? null : String(wPid),
    empresa: empresa ?? null,
    profile: profile ?? null,
    createdAt: t,
    updatedAt: t,
  };

  await col.insertOne(conversacion);
  return conversacion;
}

module.exports = {
  getIdConversacion,
  createConversacion,
};

