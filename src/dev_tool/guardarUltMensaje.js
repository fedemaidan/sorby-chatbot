require('dotenv/config');
const connectToMongoDB = require("../Utiles/mongoDB/dBconnect");
const { getMensajesByConversacionId } = require('../repository/mensajes.repository');
const { getConversaciones, actualizarMensajeConversacion } = require('../services/chat/conversacionService');

async function guardarUltMensaje() {
  try {
    await connectToMongoDB();
    const conversaciones = await getConversaciones();

    for (const conv of conversaciones) {
      const id = conv._id || '';
      const mensajes= await getMensajesByConversacionId({id_conversacion: id,  options: {limit: 1, sort:  -1 } });
      console.log("====================================");
      mensajes.forEach(element => {
        console.log(element.createdAt)
      });
      
      await actualizarMensajeConversacion({mensaje: mensajes[0], id_conversacion: id});
    }



  } catch (error) {
    console.error("Error en guardarUltMensaje:", error);
  }}


guardarUltMensaje();