const FlowManager = require('../../../FlowControl/FlowManager');
const { enviarErrorPorWhatsapp } = require("../../../services/Excepcion/manejoErrores");
const enviarMensaje = require('../../../services/EnviarMensaje/EnviarMensaje');

module.exports = async function testAndSave(userId, message) {
    try {
        await FlowManager.getFlow(userId);
        FlowManager.setFlow(userId, "Termino", "SUAVE", message);
        await enviarMensaje(userId, "Tu mensaje fue guardado correctamente. procede a usar postman");
    } catch (error) {
        console.error("❌ Error en SolicitarDatos:", error);
    }
};