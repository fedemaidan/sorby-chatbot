const { analizarIntencion } = require('../../Utiles/Chatgpt/AnalizarIntencion');
const FlowManager = require('../../FlowControl/FlowManager');
const { enviarErrorPorWhatsapp } = require("../../services/Excepcion/manejoErrores");
const enviarMensaje = require("../../services/EnviarMensaje/EnviarMensaje");
const testAndSaveFlow = require('../Prueba/testAndSaveFlow');


const defaultFlow = {
    async Init(userId, message, messageType) {
        try {
            let result;

            await enviarMensaje(userId, "⏳ Analizando mensaje ⏳");

            if (messageType === "text" || messageType === "text_extended" || messageType === "audio") {
                result = await analizarIntencion(message, userId);
            } else {
                result = message;
            }

            console.log(JSON.stringify(result, null, 2));

            switch (result.accion) {
                
                case "No comprendido":
                    await enviarMensaje(userId, `🤖`);
                    FlowManager.resetFlow(userId);
                    break;

                
                case "NoRegistrado":
                    console.log("NO REGISTRADO");
                    break;

                case "TESTANDSAVE":
                    await enviarMensaje(userId, 'buen mensaje');
                    await testAndSaveFlow.start(userId, result.data);
                    break;
            }

            return;
        } catch (err) {
            console.error('❌ Error analizando la intención:', err.message);
            await enviarErrorPorWhatsapp(err, "SorbyBot_Chatbot", userId);
            return { accion: 'DESCONOCIDO' };
        }
    },

    async handle(userId, message) {
        await enviarMensaje(userId, 'No entendí tu mensaje, por favor repetilo.');
    },
};

module.exports = defaultFlow;
