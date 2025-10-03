const { testAndSaveSteps } = require('../Prueba/testAndSaveSteps');

const testAndSaveFlow = {

    async start(userId, data) {
        if (userId != null) {
            if (typeof testAndSaveSteps["testAndSave"] === 'function') {
                await testAndSaveSteps["testAndSave"](userId, data);
            } else {
                console.log("El step solicitado no existe");
            }
        } else {
            console.log("Ocurrio un error con los datos")
        }
    },

    async Handle(userId, message, currentStep, messageType) {

        if (userId != null) {
            if (typeof testAndSaveSteps[currentStep] === 'function') {
                await testAndSaveSteps[currentStep](userId, message);
            } else {
                console.log("El step solicitado no existe");
            }

        } else {
            console.log("Ocurrio un error con los datos")
        }
    }

}
module.exports = testAndSaveFlow