const FlowManager = require('../../../FlowControl/FlowManager');
const { enviarErrorPorWhatsapp } = require("../../../services/Excepcion/manejoErrores");

module.exports = async function testAndSave(userId, message) {
    try {
        await FlowManager.getFlow(userId);
        FlowManager.setFlow(userId, "Termino", "SUAVE", message);
    } catch (error) {
        console.error("❌ Error en SolicitarDatos:", error);
    }
};