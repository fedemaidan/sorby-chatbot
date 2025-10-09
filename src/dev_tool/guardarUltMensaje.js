require('dotenv/config');
const connectToMongoDB = require("../Utiles/mongoDB/dBconnect");
const { getConversaciones } = require('../services/chat/conversacionService');

async function guardarUltMensaje() {
  try {
    await connectToMongoDB();
    const conversaciones = await getConversaciones();

    for (const conv of conversaciones.items) {
      const id = conv._id || '';
      console.log(`ID de la conversación: ${id}`);
    }





  } catch (error) {
    console.error("Error en guardarUltMensaje:", error);
  }}


guardarUltMensaje();