// src/controllers/flow.controller.js
const FlowService = require("../services/flow/flowService");
const { asyncHandler, normStr, toInt, isObj } = require("./utils/general");

module.exports = {
  // POST /flows/create  (recomendado)a
  // si mantenés POST /flows, también sirve
  create: asyncHandler(async (req, res) => {
    const payload = {
      userId: normStr(req.body.userId),
      flow: normStr(req.body.flow),
      step: normStr(req.body.step),
      flowData: isObj(req.body.flowData) ? req.body.flowData : {},
    };
    const created = await FlowService.createFlow(payload);
    return res.status(201).json(created);
  }),

  // POST /flows/setStep  (en vez de PATCH /:userId/:flow/step)
  setStep: asyncHandler(async (req, res) => {
    const payload = {
      userId: normStr(req.body.userId),
      flow: normStr(req.body.flow),
      step: normStr(req.body.step),
    };
    const updated = await FlowService.setStep(payload);
    return res.json(updated);
  }),

  // POST /flows/getByUserId  (en vez de GET /:userId)
  getFlowByUserId: asyncHandler(async (req, res) => {
    const payload = {
      userId: normStr(req.body.userId),
    };
    const found = await FlowService.getFlowByUserId(payload);
    if (!found) return res.status(404).json({ error: "Flow no encontrado" });
    return res.json(found);
  }),

  // POST /flows/listByUser  (en vez de GET ?userId=...&page=...)
  listAllUsers: asyncHandler(async (req, res) => {
    const result = await FlowService.listAllUsers();
    return res.json(result); // { items, page, pageSize, total }
  }),

  // POST /flows/deleteByUserId  (en vez de DELETE /:userId)
  deleteByUserId: asyncHandler(async (req, res) => {
    const payload = {
      userId: normStr(req.body.userId),
    };
    const out = await FlowService.deleteByUserId(payload);
    return res.json(out); // { deletedCount }
  }),
};