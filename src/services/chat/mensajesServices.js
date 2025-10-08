const repo = require("../../repository/mensajes.repository");
const enviarMensaje = require("../EnviarMensaje/EnviarMensaje");
const { getFlowByUserId } = require("../flow/flowService");
const { getEmpAndprofile } = require("../profileService/profileService");
const { createConversacion, getIdConversacionByLid, getIdConversacionByWpid } = require("./conversacionService");

async function createMessage({ phone, message, type, caption, emisor, receptor, senderLid }) {
  // 1) ordenar IDs: cuál es @lid y cuál es @s.whatsapp.net
  const { wPid: wPidFinal, lid: lidFinal } = parametrizar(senderLid, phone);

  // 2) resto de tu lógica intacta
  const flowdata = await getFlowByUserId({ phone });
  const { empresa, profile } = await getEmpAndprofile(phone);

  let id_conversacion = null;
  if (wPidFinal) {
    id_conversacion = await getIdConversacionByWpid({ wPid: wPidFinal });
  }
  if (!id_conversacion && lidFinal) {
    id_conversacion = await getIdConversacionByLid({ Lid: lidFinal });
  }

  // 4) si no existe, crearla usando los valores ya clasificados
  if (!id_conversacion) {
    id_conversacion = await createConversacion({
      senderLid: lidFinal,     // <- el @lid correcto
      empresa,
      profile,
      phone: wPidFinal,        // <- el @s.whatsapp.net correcto
      emisor
    });
  }

  id_conversacion = String(id_conversacion); // asegurar string para mensajes

  // 5) persistir el mensaje con los IDs correctos
  const mensajeCompleto = {
    id_conversacion,
    emisor,
    receptor,
    message,
    type,
    caption,
    fecha: new Date(),
    empresa,
    profile,
    flowdata: flowdata || {},
    lid:   lidFinal ?? senderLid,  // guardar el @lid correcto
    phone: wPidFinal ?? phone      // guardar el @wp correcto
  };

  return repo.create(mensajeCompleto);
}



async function createMessageSelf({ phone, message, type, caption, emisor, receptor, senderLid }) {
  // 1) Ordenar quién es @lid y quién es @s.whatsapp.net
  const { wPid: wPidFinal, lid: lidFinal } = parametrizar(senderLid, phone);

  // 2) Lógica existente
  const flowdata = await getFlowByUserId({ phone });
  const { empresa, profile } = await getEmpAndprofile(phone);

  // 3) Buscar conversación por wPid y, si no existe, por lid
  let id_conversacion = null;
  if (wPidFinal) {
    id_conversacion = await getIdConversacionByWpid({ wPid: wPidFinal });
  }
  if (!id_conversacion && lidFinal) {
    id_conversacion = await getIdConversacionByLid({ Lid: lidFinal });
  }

  // 4) Crear si no existe, usando los valores ya clasificados
  if (!id_conversacion) {
    id_conversacion = await createConversacion({
      senderLid: lidFinal,   
      empresa,
      profile,
      phone: wPidFinal, 
      emisor
    });
  }

  id_conversacion = String(id_conversacion);

  // 5) Persistir con los IDs correctos
  const mensajeCompleto = {
    id_conversacion,
    emisor,
    receptor,
    message,
    type,
    caption,
    fecha: new Date(),
    empresa,
    profile,
    flowdata: flowdata || {},
    lid:   lidFinal ?? senderLid, // guardar el @lid correcto
    phone: wPidFinal ?? phone     // guardar el @wp correcto
  };

  return repo.create(mensajeCompleto);
}

function parametrizar(lidInput, wPidInput) {
  const norm = v => (v == null ? '' : String(v).trim());

  const a = norm(lidInput);
  const b = norm(wPidInput);

  // matchers (case-insensitive)
  const isLid   = v => /@lid$/i.test(v);
  const isWpid  = v => /@{1,2}s\.whatsapp\.net$/i.test(v) || /@g\.us$/i.test(v) || /@broadcast$/i.test(v);

  let lid  = null;
  let wPid = null;

  // clasificar primer parámetro (supuesto lid)
  if (a) {
    if (isLid(a))      lid  = a;
    else if (isWpid(a)) wPid = a;
    else                lid  = a;          // ambiguo: respetamos el origen del param
  }

  // clasificar segundo parámetro (supuesto wPid)
  if (b) {
    if (isWpid(b))      wPid = wPid ?? b;
    else if (isLid(b))  lid  = lid  ?? b;
    else if (!wPid)     wPid = b;          // ambiguo: respetamos el origen del param
    else if (!lid)      lid  = b;
  }

  return { wPid, lid };
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
