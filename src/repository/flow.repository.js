// src/repository/flow.repository.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// helpers
const now = () => new Date();
const norm = (v) => String(v ?? "").trim();
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

// devolvemos camelCase
const fromStore = (d) =>
  d && ({
    id: d.id,
    userId: d.userId,
    flow: d.flow,
    step: d.step,
    flowData: d.flowData || {},
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  });

// cache de colección + índices
let colPromise = null;
async function getCol() {
  if (!mongoose.connection?.db) {
    throw new Error("Mongo no conectado. Llamaron al repo antes de connectToMongoDB().");
  }
  if (!colPromise) {
    colPromise = (async () => {
      const col = mongoose.connection.db.collection("flows");
      await col.createIndex({ userId: 1, flow: 1 }, { unique: true, name: "uniq_user_flow" });
      await col.createIndex({ updated_at: -1 }, { name: "by_updated_at_desc" });
      return col;
    })();
  }
  return colPromise;
}

// CREATE
async function create({ userId, flow, step, flowData }) {
  const col = await getCol();
  const t = now();

  const res = await col.findOneAndUpdate(
    { userId: norm(userId), flow: norm(flow) },
    {
      $setOnInsert: {
        id: uuidv4(),
        userId: norm(userId),
        flow: norm(flow),
        step: norm(step),
        flowData: isObj(flowData) ? flowData : {},
        created_at: t,
      },
      $set: { updated_at: t },
    },
    { upsert: true, returnDocument: "after" }
  );

  return fromStore(res.value);
}

// READ por userId (si querés por userId+flow, agregamos otra)
async function getFlowByUserId({ userId }) {
  const col = await getCol();
  const doc = await col.findOne({ userId: norm(userId) });
  return fromStore(doc);
}

// LIST por userId con paginación/sort estilo "-updatedAt"
async function listAllUsers() {
  const col = await getCol();
  return col.distinct("userId");
}

// MODIFY: setStep usando selector userId+flow
async function setStep({ userId, flow, step }) {
  const col = await getCol();
  const res = await col.findOneAndUpdate(
    { userId: norm(userId) },
    { $set: { step: norm(step), flow: norm(flow), updated_at: now() } },
    { returnDocument: "after" }
  );
  return fromStore(res.value);
}

// MODIFY: merge parcial en flowData
async function mergeData({ userId, flow, patch }) {
  const col = await getCol();
  const set = { updated_at: now() };
  if (isObj(patch)) {
    for (const [k, v] of Object.entries(patch)) set[`flowData.${k}`] = v;
  }
  const res = await col.findOneAndUpdate(
    { userId: norm(userId), flow: norm(flow) },
    { $set: set },
    { returnDocument: "after" }
  );
  return fromStore(res.value);
}

// MODIFY: reemplazo completo de flowData
async function replaceData({ userId, flow, data }) {
  const col = await getCol();
  const res = await col.findOneAndUpdate(
    { userId: norm(userId), flow: norm(flow) },
    { $set: { flowData: isObj(data) ? data : {}, updated_at: now() } },
    { returnDocument: "after" }
  );
  return fromStore(res.value);
}

// DELETE por userId (si querés por userId+flow, pedímelo)
async function deleteByUserId({ userId }) {
  const col = await getCol();
  const { deletedCount } = await col.deleteOne({ userId: norm(userId) });
  return { deletedCount };
}

module.exports = {
  create,
  getFlowByUserId,
  listAllUsers,
  setStep,
  mergeData,
  replaceData,
  deleteByUserId,
};