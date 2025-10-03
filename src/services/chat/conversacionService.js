const repo = require("../../repository/conversacion.repository");
const { ensureLimit, ensurePosInt, normalizeSort } = require("../../controller/utils/general");

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

async function getUltmensaje({
  id_conversacion,
  sort = 1,
  filter = {},
  option = {}
}) {
  // Merge: lo que venga en option pisa a los sueltos
  const merged = {
    limit: ensureLimit(option.limit),
    offset: ensurePosInt(option.offset),
    sort: normalizeSort(option.sort ?? sort)
  };

  console.log(
    'Getting last mensaje',
    id_conversacion ? { id_conversacion } : {},
    { ...merged, hasFilter: !!filter && Object.keys(filter || {}).length > 0 }
  );

  return repo.getUltmensaje({
    id_conversacion,
    filter,
    options: merged
  });
}

module.exports = {
  getIdConversacion,
  createConversacion,
  getUltmensaje
};