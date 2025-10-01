const FlowService = require('../../../services/flow/flowService');

module.exports = async function GuardarFlow(userId, data, step, flowname) {
  try {
    // OJO: el service espera un objeto { userId }
    const flowExistente = await FlowService.getFlowByUserId({ userId });

    if (flowExistente) {
      // También pasamos objeto en el primer arg de update
      await FlowService.updateFlowByUserId({ userId },
        {
          flowData: data,
          step,
          flow: flowname,
        }
      );
    } else {
      await FlowService.createFlow({
        userId,
        flowData: data,
        step,
        flow: flowname,
      });
    }

    console.log("✅ Flow guardado correctamente.");
    return { Success: true };
  } catch (error) {
    console.error("❌ Error en GuardarFlow:", error);
    return { Success: false, msg: error.message };
  }
};