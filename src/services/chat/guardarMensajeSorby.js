const { createMessageSelf } = require('./mensajesServices');
const FlowManager = require('../../FlowControl/FlowManager');
module.exports = async function guardarMensajeSorby({ msg }) {

  console.log("guardarMensajeSorby msg:", msg);
  if (!msg || !msg.message) return null;

 
  const isFromMe    = !!msg.key.fromMe;
  const phone   = msg.key.remoteJid || '';
  const displayName = msg.pushName || 'Usuario';
  const senderLid   = msg.key?.senderLid || null;

  const { message, caption, type } = extractContent(msg);

  const emisor   = isFromMe ? 'sorby'     : displayName;
  const receptor = isFromMe ? displayName : 'sorby';


   let flow = await FlowManager.getFlow(phone);

  return createMessageSelf({
    phone,
    message,
    type,
    caption: caption || '',
    emisor,
    receptor,
    senderLid: null,
    flow
  });
};

function extractContent(msg) {
  const m = msg.message || {};

  if (m.conversation)                return { message: m.conversation, caption: '', type: 'text' };
  if (m.extendedTextMessage?.text)   return { message: m.extendedTextMessage.text, caption: '', type: 'text_extended' };
  if (m.imageMessage) {
    const cap = m.imageMessage.caption || '';
    return { message: cap || '[image]', caption: cap, type: 'image' };
  }
  if (m.videoMessage) {
    const cap = m.videoMessage.caption || '';
    return { message: cap || '[video]', caption: cap, type: 'video' };
  }
  if (m.documentMessage) {
    const cap = m.documentMessage.caption || '';
    return { message: cap || '[document]', caption: cap, type: 'document' };
  }
  if (m.audioMessage)                return { message: '[audio]',   caption: '', type: 'audio'   };
  if (m.stickerMessage)              return { message: '[sticker]', caption: '', type: 'sticker' };

  return { message: '[unsupported]', caption: '', type: 'unknown' };
}