// src/controllers/flow.controller.js
const flowService = require("../services/flow/flowService"); // ajustá el path si difiere

// Captura errores async y delega al middleware de errores
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Helpers mínimos de parseo
const normStr = (v) => String(v ?? "").trim();
const toInt = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
};
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

module.exports = {
  // POST /flows
  create: asyncHandler(async (req, res) => {
    const payload = {
      userId: normStr(req.body.userId),
      flow: normStr(req.body.flow),
      step: normStr(req.body.step),
      flowData: isObj(req.body.flowData) ? req.body.flowData : {},
    };

    const created = await flowService.createFlow(payload);
    return res.status(201).json(created);
  }),

  // PATCH /flows/:userId/:flow/step
  setStep: asyncHandler(async (req, res) => {
    const payload = {
      userId: normStr(req.params.userId),
      flow: normStr(req.params.flow),
      step: normStr(req.body.step),
    };

    const updated = await flowService.setStep(payload);
    return res.json(updated);
  }),

  // GET /flows/:userId/:flow
  getByUserFlow: asyncHandler(async (req, res) => {
    const payload = {
      userId: normStr(req.params.userId),
      flow: normStr(req.params.flow),
    };

    const found = await flowService.getFlowByUserAndFlow(payload);
    if (!found) return res.status(404).json({ error: "Flow no encontrado" });
    return res.json(found);
  }),

  // GET /flows?userId=...&page=1&pageSize=20&sort=-updatedAt
  listByUser: asyncHandler(async (req, res) => {
    const payload = {
      userId: normStr(req.query.userId),
      page: toInt(req.query.page, 1),
      pageSize: toInt(req.query.pageSize, 20),
      sort: normStr(req.query.sort || "-updatedAt"),
    };

    const result = await flowService.listByUser(payload);
    return res.json(result); // { items, page, pageSize, total }
  }),
};