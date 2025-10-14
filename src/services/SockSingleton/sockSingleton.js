// services/SockSingleton/sockSingleton.js
const GetMessageType = require('../../Utiles/Mensajes/GetType');
const messageResponder = require('../../Utiles/Mensajes/messageResponder');
const guardarMensajeSorby = require('../chat/guardarMensajeSorby');

class SockSingleton {
  constructor() {
    if (!SockSingleton.instance) {
      this.sock = null;
      SockSingleton.instance = this;
    }
    return SockSingleton.instance;
  }

  async setSock(sockInstance) {
    this.sock = sockInstance;

    // Helper para texto principal
    const extractText = (m) =>
      m?.message?.conversation ||
      m?.message?.extendedTextMessage?.text ||
      m?.message?.imageMessage?.caption ||
      m?.message?.videoMessage?.caption ||
      '';

    // Helper para JID con soporte a Alt fields (v7)
    const extractSenderJid = (key) => {
      // prioridad: participanteAlt (grupos) > remoteJidAlt > participant > remoteJid
      const raw =
        key?.participantAlt ||
        key?.remoteJidAlt ||
        key?.participant ||
        key?.remoteJid ||
        '';
      return String(raw);
    };

    // (opcional) transformar a PN si recibís LID y necesitás PN para tus flujos internos
    const resolveToPNIfLID = async (jid) => {
      try {
        if (/@lid$/.test(jid)) {
          const lidStore = this.sock?.signalRepository?.lidMapping;
          if (lidStore?.getPNForLID) {
            const pn = await lidStore.getPNForLID(jid);
            if (pn) return pn; // p.ej "54911xxxx@s.whatsapp.net"
          }
        }
      } catch (_) {}
      return jid;
    };

    this.sock.ev.on('messages.upsert', async (upsert) => {
      try {
        if (upsert.type !== 'notify') return;
        const msg = upsert.messages?.[0];
        if (!msg || !msg.message) return;

        // guardar propios si querés
        if (msg.key?.fromMe) {
          await guardarMensajeSorby({ msg });
          return;
        }

        // JIDs (LID/PN) compatibles v7
        const jidRaw = extractSenderJid(msg.key);
        const isLID = /@lid$/.test(jidRaw);
        const senderPNorLID = await resolveToPNIfLID(jidRaw); // PN si pudo resolver, sino LID
        const displayName = msg.pushName || 'Cliente';

        // tipo y body
        const messageType = GetMessageType(msg.message);
        const body = extractText(msg);

        // si tu responder necesita ambos, pasale ambos
        const senderLid = isLID ? jidRaw : null; // si viene LID, lo mandamos; sino null
        const sender = senderPNorLID;            // PN si se pudo mapear, sino el LID original

        console.log('👤 JID raw:', jidRaw, '| resolved:', sender, '| isLID:', isLID);
        await messageResponder(messageType, msg, sender, displayName, senderLid);
      } catch (err) {
        console.error('messages.upsert error:', err?.message || err);
      }
    });

    // si usás 'append' o 'messages.update', podés dejarlos como estaban o migrarlos igual
  }

  getSock() {
    if (!this.sock) {
      console.error('🛑 Sock aún no está listo, espera antes de enviar el mensaje.');
      return null;
    }
    return this.sock;
  }
}

module.exports = new SockSingleton();
