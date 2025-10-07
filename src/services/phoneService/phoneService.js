const repo = require("../../repository/conversacion.repository");

async function obtenerphone({ Lid }) {
console.log("Getting phone:", Lid);
  return repo.obtenerphone({ Lid });
}

module.exports = {
  obtenerphone
};