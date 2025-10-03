const FlowService = require('../../../services/flow/flowService');

module.exports = async function ObtenerFlow(userId) {
    try {
        if (!userId) {
            console.error("❌ Error: userId no proporcionado.");
            return { Success: false, msg: "userId no proporcionado." };
        }

        const backup = await FlowService.getFlowByUserId(userId);

        if (!backup) {
            console.log("🚫 No se encontró flow para el userId:", userId);
            return { Success: false, msg: "No se encontró flow para este usuario." };
        }

        const { flow, step } = backup;

        console.log(backup.flowData)
        
        return {
            Success: true,
            data: {
                flowData:backup.flowData,
                currentStep: step,
                flowName: flow
            }
        };
    } catch (error) {
        console.error("❌ Error en ObtenerFlow:", error);
        return { Success: false, msg: error.message };
    }
};
