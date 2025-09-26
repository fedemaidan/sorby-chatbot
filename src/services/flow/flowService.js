const repo = require("../../repository/flow.repository");

async function createFlow({ userId, flow, step, flowData }) {
  return repo.create({ userId, flow, step, flowData });
}

async function getFlowByUserId({ userId }) {
  return repo.getFlowByUserId({ userId });
}

async function listAllUsers() {
  return repo.listAllUsers();
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

async function deleteByUserId({ userId, flow }) {
  return repo.deleteByUserId({ userId, flow });
}

module.exports = {
  createFlow,
  getFlowByUserId,
  listAllUsers,
  setStep,
  deleteByUserId
};