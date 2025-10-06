const repo = require("../../repository/mensajes.repository");
const enviarMensaje = require("../EnviarMensaje/EnviarMensaje");
const { getFlowByUserId } = require("../flow/flowService");
const { getEmpAndprofile } = require("../profileService/profileService");
const { getIdConversacion, createConversacion } = require("./conversacionService");

async function createMessage({ phone, message, type, caption, emisor, receptor, senderLid }) {
  const flowdata = await getFlowByUserId({ phone });
  const { empresa, profile } = await getEmpAndprofile(phone);

  let id_conversacion = await getIdConversacion({ Lid: senderLid });
  if (!id_conversacion) {
    id_conversacion = await createConversacion({ senderLid, empresa, profile, phone });
  }

  const mensajeCompleto = {
    id_conversacion,           
    emisor: emisor,
    receptor: receptor,
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

async function createMessageSelf({ phone, message, type, caption, emisor, receptor, senderLid }) {
  const flowdata = await getFlowByUserId({ phone });
  const { empresa, profile } = await getEmpAndprofile(phone);

  let id_conversacion = await getIdConversacion({ Lid: senderLid });
  
  if (!id_conversacion) {
    id_conversacion = await createConversacion({ senderLid, empresa, profile, phone });
  }

  const mensajeCompleto = {
    id_conversacion,           
    emisor: emisor,
    receptor: receptor,
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

async function enviarMensajeService({ phone, text }) {
  if (!phone || !text) {
    throw new Error('phone y text son requeridos');
  }
  console.log('Sending outbound mensaje', { phone, text_len: text.length });
  return enviarMensaje(phone, text);
}

module.exports = {
  createMessage,
  enviarMensajeService,
  createMessageSelf
};