const repo = require("../../repository/flow.repository");

async function createFlow({ userId, flow, step, flowData }) {
console.log("Creating flow for userId:", userId,);
  return repo.create({ userId, flow, step, flowData });
}

async function getFlowByUserId({ userId }) {
console.log("Getting flow for userId:", userId);
  return repo.getFlowByUserId({ userId });
}

async function listAllUsers() {
console.log("Listing all users with flows");
  return repo.listAllUsers();
}

async function setStep({ userId, flow, step }) {
console.log("Setting step for userId:", userId, "to step:", step);
  return repo.updateFlowByUserId({ userId, flow, step });
}

async function updateFlowByUserId({ userId, flow, step, flowData }) {
console.log("Updating flow for userId:", userId, "with step:", step, "and flowData:", flowData);
  return repo.updateFlowByUserId({ userId, flow, step, flowData });
}

async function deleteFlowByUserId({ userId, flow }) {
console.log("Deleting flow for userId:", userId);
  return repo.deleteFlowByUserId({ userId, flow });
}

module.exports = {
  createFlow,
  getFlowByUserId,
  listAllUsers,
  setStep,
  deleteFlowByUserId,
  updateFlowByUserId
};