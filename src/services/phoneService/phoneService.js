const repo = require("../../repository/flow.repository");

async function obtenerphone({ Lid }) {
console.log("Getting phone:", Lid);
  return repo.getFlowByUserId({ Lid });
}

module.exports = {
  obtenerphone
};