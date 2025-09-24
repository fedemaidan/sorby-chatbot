const repo = require("../../repository/flow.repository");

async function createFlow({ userId, flow, step, flowData }) {
  return repo.create({ userId, flow, step, flowData });
}

async function getFlowByUserAndFlow({ userId, flow }) {
  return repo.getByUserAndFlow({ userId, flow });
}

async function listByUser({ userId, page = 1, pageSize = 20, sort = "-updatedAt" }) {
  return repo.listByUser({ userId, page, pageSize, sort });
}

async function setStep({ userId, flow, step }) {
  return repo.setStep({ userId, flow, step });
}

async function mergeData({ userId, flow, patch }) {
  return repo.mergeData({ userId, flow, patch });
}

async function replaceData({ userId, flow, data }) {
  return repo.replaceData({ userId, flow, data });
}

async function deleteFlowByUserAndFlow({ userId, flow }) {
  return repo.deleteByUserAndFlow({ userId, flow });
}

module.exports = {
  createFlow,
  getFlowByUserAndFlow,
  listByUser,
  setStep,
};