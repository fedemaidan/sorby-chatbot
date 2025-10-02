const repo = require("../../repository/mensajes.repository");
const enviarMensaje = require("../EnviarMensaje/EnviarMensaje");
const { getFlowByUserId } = require("../flow/flowService");
const { getEmpAndprofile } = require("../profileService/profileService");
const { getIdConversacion, createConversacion } = require("./conversacionService");

async function createMessage({ phone, message, type, caption, displayName, senderLid }) {
  console.log("Creating message for userId:", phone);
  console.log("LID EN SERVICIO MENSAJES:", senderLid);

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

async function getMensajesByConversacionId({ id_conversacion }) {
  console.log("Getting mensajes for conversacion:", id_conversacion);
  return repo.getMensajesByConversacionId({ id_conversacion });
}

async function getUltmensaje({ id_conversacion } = {}) {
  console.log("Getting last mensaje", id_conversacion ? { id_conversacion } : {});
  return repo.getUltmensaje({ id_conversacion });
}

async function enviarMensajeService({ userId, text }) {
  console.log("Sending outbound mensaje", { userId });
  return enviarMensaje(userId, text);
}

module.exports = {
  createMessage,
  getMensajesByConversacionId,
  getUltmensaje,
  enviarMensajeService,
};