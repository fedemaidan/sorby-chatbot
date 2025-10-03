const repo = require("../../repository/mensajes.repository");
const enviarMensaje = require("../EnviarMensaje/EnviarMensaje");
const { getFlowByUserId } = require("../flow/flowService");
const { getEmpAndprofile } = require("../profileService/profileService");
const { getIdConversacion, createConversacion } = require("./conversacionService");
const { ensureLimit, ensurePosInt, normalizeSort } = require("../../controller/utils/general");

async function createMessage({ phone, message, type, caption, displayName, senderLid }) {
  const flowdata = await getFlowByUserId({ phone });
  const { empresa, profile } = await getEmpAndprofile(phone);

  let id_conversacion = await getIdConversacion({ Lid: senderLid });
  if (!id_conversacion) {
    id_conversacion = await createConversacion({ senderLid, empresa, profile, phone });
  }

  const mensajeCompleto = {
    id_conversacion,           
    emisor: displayName,
    receptor: "Sorby",
    message,
    type,
    caption,
    fecha: new Date(),
    empresa,
    profile,
    flowdata: flowdata || {},
    lid: senderLid,
    phone: phone, 
  };

  return repo.create(mensajeCompleto);
}

async function getMensajesByConversacionId({
  id_conversacion,
  limit = 150,
  offset = 0,
  sort = 1,
  filter = {}
}) {
  if (!id_conversacion) {
    throw new Error('id_conversacion es requerido');
  }

  const options = {
    limit: ensureLimit(limit),
    offset: ensurePosInt(offset),
    sort: normalizeSort(sort)
  };

  console.log('Getting mensajes for conversacion:', {
    id_conversacion,
    ...options,
    hasFilter: !!filter && Object.keys(filter || {}).length > 0
  });

  // Contrato claro hacia el repo:
  // - id_conversacion
  // - filter (obj opcional)
  // - options { limit, offset, sort }
  return repo.getMensajesByConversacionId({
    id_conversacion,
    filter,
    options
  });
}

async function enviarMensajeService({ phone, text }) {
  if (!phone || !text) {
    throw new Error('phone y text son requeridos');
  }
  console.log('Sending outbound mensaje', { phone, text_len: text.length });
  return enviarMensaje(phone, text);
}

module.exports = {
  createMessage,
  getMensajesByConversacionId,
  enviarMensajeService,
};