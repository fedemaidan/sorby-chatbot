const repo = require("../../repository/conversacion.repository");

// Devuelve el id de la conversación para un Lid (o null)
async function getIdConversacion({ Lid }) {
  console.log("Getting conversacion ID for Lid:", Lid);
  const id = await repo.getIdConversacion({ Lid });
  return id ?? null;
}

// Crea la conversación usando el repo y devuelve el ID
async function createConversacion({ senderLid, empresa, profile, userId }) {


  
  const conv = await repo.createConversacion({
    Lid: senderLid,
    wPid: userId,
    empresa,
    profile,
  });
  return conv.id;
}

module.exports = {
  getIdConversacion,
  createConversacion,
};