const FlowManager = require('../FlowControl/FlowManager');
const defaultFlow = require('../Flows/INIT/INIT');

class FlowMapper {
    async handleMessage(userId, message, messageType) {
        let flow = await FlowManager.getFlow(userId);

        if (flow && flow.flowName) {
            switch (flow.flowName) {

                case 'DEFAULT':
                    await EgresoMaterialesFlow.Handle(userId, message, flow.currentStep, messageType);
                    break;

                default:
                    await defaultFlow.handle(userId, message, messageType);
                    break;
            }
        } else {
            // Si no hay flow, arrancamos el INITFLOW
            //FlowManager.setFlow(userId, 'INITFLOW');
            await defaultFlow.Init(userId, message, messageType);
        }
    }
}
module.exports = new FlowMapper();
