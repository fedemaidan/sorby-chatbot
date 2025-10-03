const FlowManager = require('../FlowControl/FlowManager');
const defaultFlow = require('../Flows/INIT/INIT');
const testAndSaveFlow = require('../Flows/Prueba/testAndSaveFlow');
const mensajesServices = require("../services/chat/mensajesServices");
class FlowMapper {
    async handleMessage(userId, message, messageType, displayName, senderLid) {
        
        let flow = await FlowManager.getFlow(userId);
        await mensajesServices.createMessage({ phone:userId, message, type: messageType, caption:"holi" ,displayName, senderLid, flow });

        if (flow && flow.flowName) {
            switch (flow.flowName) {

                case 'TESTANDSAVE':
                await testAndSaveFlow.Handle(userId, message, flow.currentStep, messageType);

                break;

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
