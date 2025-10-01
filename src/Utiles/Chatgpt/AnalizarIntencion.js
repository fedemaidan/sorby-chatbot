const { getByChatGpt4o } = require("./Base");

const opciones = [
    {
        accion: "TESTANDSAVE",
        descripcion: "La persona te mando un mensaje coherente, necesito guardar dicho mensaje !!!, necesito que guardes el mensaje completo que te envio el usuario",
        data: {
            mensaje: "aca va el texto del mensaje enviado por el usuario. y agregalo un comentario como, chatGPT: muy bueno, al final"
        }
    },
    {
        accion: "No comprendido",
        data: {
            Default: "El usuario envió un mensaje sin coherencia aparente."
        }
    }
];

const analizarIntencion = async (message, sender) => {
    try {
        const opcionesTxt = JSON.stringify(opciones);
        const prompt = `
Como bot de un sistema de control de hojas de ruta, quiero identificar la intención del usuario y ejecutar la acción adecuada para gestionar correctamente las operaciones posibles.

Formato de respuesta: Devuelve únicamente un JSON con los datos cargados, sin incluir explicaciones adicionales.

Advertencia: Revisa cuidadosamente el mensaje del usuario y asegúrate de coincidir exactamente con todos los detalles del producto solicitado, como tamaño, color y tipo de material. No elijas productos basándote en coincidencias parciales.

Resumen del contexto: soy bot con el propósito de ayudar a una fábrica a controlar sus envíos.

El usuario dice: "${message}"

Tienes estas acciones posibles. Debes analizar la palabra clave del usuario: ${opcionesTxt}.
`;

        const response = await getByChatGpt4o(prompt);
        const respuesta = JSON.parse(response);

        return respuesta?.json_data || respuesta;

    } catch (error) {
        console.error('Error al analizar la intención:', error.message);
        return { accion: "No comprendido" };
    }
};

module.exports = { analizarIntencion };
