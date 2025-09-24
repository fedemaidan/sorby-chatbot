// src/repositories/flow.repository.js
const { v4: uuidv4 } = require("uuid");

const norm = (v) => String(v ?? "").trim();
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

// mapeo camelCase <-> snake_case para persistencia
const fromStore = (doc) => {
  if (!doc) return null;
  return {
    id: doc.id,
    userId: doc.userId,
    flow: doc.flow,
    step: doc.step,
    flowData: doc.flowData || {},
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
};

const toStore = (obj) => ({
  id: obj.id,
  userId: obj.userId,
  flow: obj.flow,
  step: obj.step,
  flowData: obj.flowData || {},
  created_at: obj.createdAt,
  updated_at: obj.updatedAt,
});

class FlowRepository {
  /**
   * @param {import('mongodb').Db} db - instancia de DB (driver nativo)
   * @param {string} [collectionName="flows"]
   */
  constructor(db, collectionName = "flows") {
    this.col = db.collection(collectionName);
  }

  async init() {
    await this.col.createIndex({ userId: 1, flow: 1 }, { unique: true, name: "uniq_user_flow" });
    await this.col.createIndex({ updated_at: -1 }, { name: "by_updated_at_desc" });
  }

  _now() { return new Date(); }

  // CREATE
  async create({ userId, flow, step, flowData = {} }) {
    const now = this._now();
    const doc = toStore({
      id: uuidv4(),
      userId: norm(userId),
      flow: norm(flow),
      step: norm(step),
      flowData: isObj(flowData) ? flowData : {},
      createdAt: now,
      updatedAt: now,
    });
    await this.col.insertOne(doc);
    return fromStore(doc);
  }

  // READ
  async getByUserAndFlow({ userId, flow }) {
    const doc = await this.col.findOne({ userId: norm(userId), flow: norm(flow) });
    return fromStore(doc);
  }

  // LIST
  async listByUser({ userId, page = 1, pageSize = 20, sort = "-updatedAt" }) {
    const key = String(sort || "-updatedAt");
    const by = key.startsWith("-") ? key.slice(1) : key;
    const dir = key.startsWith("-") ? -1 : 1;
    const map = { updatedAt: "updated_at", createdAt: "created_at" };
    const sortField = map[by] || "updated_at";

    const filter = { userId: norm(userId) };
    const skip = Math.max(0, (Number(page) - 1) * Number(pageSize));

    const [items, total] = await Promise.all([
      this.col.find(filter).sort({ [sortField]: dir }).skip(skip).limit(Number(pageSize)).toArray(),
      this.col.countDocuments(filter),
    ]);

    return {
      items: items.map(fromStore),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    };
  }

  // MODIFY
  async setStep({ userId, flow, step }) {
    const updated_at = this._now();
    const res = await this.col.findOneAndUpdate(
      { userId: norm(userId), flow: norm(flow) },
      { $set: { step: norm(step), updated_at } },
      { returnDocument: "after" }
    );
    return fromStore(res.value);
  }

  async mergeData({ userId, flow, patch }) {
    const updated_at = this._now();
    const set = { updated_at };
    if (isObj(patch)) {
      for (const [k, v] of Object.entries(patch)) {
        set[`flowData.${k}`] = v;
      }
    }
    const res = await this.col.findOneAndUpdate(
      { userId: norm(userId), flow: norm(flow) },
      { $set: set },
      { returnDocument: "after" }
    );
    return fromStore(res.value);
  }

  async replaceData({ userId, flow, data }) {
    const updated_at = this._now();
    const res = await this.col.findOneAndUpdate(
      { userId: norm(userId), flow: norm(flow) },
      { $set: { flowData: isObj(data) ? data : {}, updated_at } },
      { returnDocument: "after" }
    );
    return fromStore(res.value);
  }

  // DELETE
  async deleteByUserAndFlow({ userId, flow }) {
    const res = await this.col.deleteOne({ userId: norm(userId), flow: norm(flow) });
    return { deletedCount: res.deletedCount };
  }
}

module.exports = { FlowRepository };