const FlowMapper = require('../../FlowControl/FlowMapper');
const FlowManager = require('../../FlowControl/FlowManager');
const { saveImageToStorage, saveAudioToStorage } = require('../Firebase/storageHandler');
const transcribeAudio = require('../Firebase/transcribeAudio');
const downloadMedia = require('../Firebase/DownloadMedia');


const messageResponder = async (messageType, msg, sender, displayName, senderLid) => {
    
    console.log("guardar mensaje del usuario!!! msg:", msg);


    switch (messageType) {
        case 'text':
        case 'text_extended': {
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            await FlowMapper.handleMessage(sender, text, messageType, displayName, senderLid);
            break;
        }

        case 'image': {
            try {

                if (!msg.message?.imageMessage) {
                    console.log("❌ msg.message.imageMessage está vacío");
                    return;
                }

                const ImageMessage = msg.message.imageMessage ||
                    msg.message.imageWithCaptionMessage?.message?.imageMessage;

                const urls = await saveImageToStorage(ImageMessage, sender, "image");

                await FlowMapper.handleMessage(sender, urls.imagenFirebase, messageType ,displayName, senderLid);
            } catch (error) {
                console.error("❌ Error al procesar la imagen:", error);
            }
            break;
        }

        case 'video': {
            const filePath = await downloadMedia(msg.message, 'video');
            if (filePath) {
                console.log("📁 Video descargado en:", filePath);
            } else {
                console.error("❌ Error al descargar el video.");
            }
            break;
        }

        case 'audio': {
            try {

                if (!msg.message?.audioMessage) {
                    console.error("❌ msg.message.audioMessage está vacío");
                    return;
                }

                const filePath = await downloadMedia(msg, 'audio');
                const UrlaudioStorage = await saveAudioToStorage(filePath, sender, "document");
                const transcripcion = await transcribeAudio(filePath);

                console.log("📜 Transcripción de audio:", transcripcion);
                await FlowMapper.handleMessage(sender, UrlaudioStorage, messageType, displayName, senderLid, transcripcion );
            } catch (error) {
                console.error("❌ Error al procesar el audio:", error);
            }
            break;
        }

        case 'document':
        case 'document-caption': {
            try {

                if (!msg?.message) {
                    console.error("❌ msg.message está vacío");
                    return;
                }

                const docMessage = msg.message.documentMessage ||
                    msg.message.documentWithCaptionMessage?.message?.documentMessage;

                if (!docMessage) {
                    console.error("❌ docMessage está vacío");
                    return;
                }

                const transcripcion = await saveImageToStorage(docMessage, sender, "document");
                if (!transcripcion) {
                    console.error("❌ La transcripción del documento falló.");
                    return;
                }

                await FlowMapper.handleMessage(sender, transcripcion.imagenFirebase,"document-caption", displayName, senderLid);
            } catch (error) {
                console.error("❌ Error al procesar el documento:", error);
            }
            break;
        }

        default: {
            console.log(`❌ Tipo de mensaje no soportado: ${messageType}`);
        }
    }
};

module.exports = messageResponder;
