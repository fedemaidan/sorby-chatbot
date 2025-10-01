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
      const col = mongoose.connection.db.collection("flows");
      await col.createIndex({ userId: 1, flow: 1 }, { unique: true, name: "uniq_user_flow" });
      await col.createIndex({ updatedAt: -1 }, { name: "by_updatedAt_desc" });
      return col;
    })();
  }
  return colPromise;
}

// CREATE (upsert por userId+flow)
async function create({ userId, flow, step, flowData }) {
  const col = await getCol();
  const t = now();
  
  const res = await col.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        id: uuidv4(),
        userId,
        flow,
        step,
        flowData: flowData ?? {},
        createdAt: t,
      },
      $set: { updatedAt: t },
    },
    { upsert: true, returnDocument: "after", returnOriginal: false }
  );

  return res ? res.value : null;
}

// READ por userId
async function getFlowByUserId({ userId }) {
  const col = await getCol();
  return col.findOne({ userId });
}

// LIST de userIds
async function listAllUsers() {
  const col = await getCol();
  return col.distinct("userId");
}


async function updateFlowByUserId({ userId, flow, step, flowData }) {
  const col = await getCol();

  // Set solo con campos definidos
  const set = { updatedAt: now() };
  if (typeof flow !== "undefined") set.flow = flow;
  if (typeof step !== "undefined") set.step = step;
  if (typeof flowData !== "undefined") set.flowData = flowData;

  const res = await col.findOneAndUpdate(
    { userId },                     // <- match SOLO por userId
    { $set: set },
    { returnDocument: "after", returnOriginal: false } // sin upsert
  );

  return res ? res.value : null;
}

// DELETE por userId
async function deleteFlowByUserId({ userId }) {
  const col = await getCol();
  const { deletedCount } = await col.deleteOne({ userId });
  return { deletedCount };
}

module.exports = {
  create,
  getFlowByUserId,
  listAllUsers,
  deleteFlowByUserId,
  updateFlowByUserId
};