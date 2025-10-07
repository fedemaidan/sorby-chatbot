const GetMessageType = require("../../Utiles/Mensajes/GetType");
const messageResponder = require("../../Utiles/Mensajes/messageResponder");
const autoReporter = require("baileys-status-reporter");
const { createMessage } = require("../chat/mensajesServices");
const guardarMensajeSorby = require("../chat/guardarMensajeSorby");
class SockSingleton {
    constructor() {
        if (!SockSingleton.instance) {
            this.sock = {}; // Se guardará la instancia única de sock
            SockSingleton.instance = this;
        }
        return SockSingleton.instance;
    }
    async setSock(sockInstance) {
        this.sock = sockInstance;
        
        //console.log("🟢🛑🟢 SockSingleton: Instancia de sock establecida correctamente.🟢🛑🟢");
        //autoReporter.startAutoReport(this.sock, "metal-grande", "http://localhost:4000/api/reportar");

        
        this.sock.ev.on('messages.upsert', async (message) => {
            
            if (message.type === 'notify') {
                const msg = message.messages[0];

                if (msg.key.fromMe) 
                    {
                        guardarMensajeSorby({msg:msg})
                        return;
                    }
                if (!msg.message) return;

                const sender = msg.key.remoteJid;

                const messageType = GetMessageType(msg.message);
                const displayName = msg.pushName || "Cliente";
                const senderLid = msg.key.senderLid
                
                console.log("lid del sender: ", senderLid);
                await messageResponder(messageType, msg, sender, displayName, senderLid);
            }
            else if (message.type === 'append') {
                const msg = message.messages[0];
                if (!msg.message || msg.key.fromMe) return;

                const sender = msg.key.remoteJid;
                const messageType = GetMessageType(msg.message);

                if (messageType === 'text' || messageType === 'text_extended') {
                    
                }
            }

        });
      }
    // Obtiene la instancia del sock
    getSock() {
    if (!this.sock) {
        console.error('🛑 Sock aún no está listo, espera antes de enviar el mensaje.');
        return null;
    }
    return this.sock;
}

}
module.exports = new SockSingleton();
