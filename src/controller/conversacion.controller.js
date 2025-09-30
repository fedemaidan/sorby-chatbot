const { asyncHandler, normStr, cleanObj } = require('./utils/general');
const enviarMensaje = require('../services/EnviarMensaje/EnviarMensaje');
const {
  getConversaciones,
  getConversacionById,
} = require('../services/conversacion/conversacionService');

module.exports = {
  getConversaciones: asyncHandler(async (req, res) => {
    const { empresaId, empresaNombre, telefono, email, page, limit } =
      req.query;

    const base = cleanObj({
      ...(empresaNombre && { 'empresa.nombre': empresaNombre }),
      ...(empresaId && { 'empresa.id': empresaId }),
      ...(email && { 'profile.email': email }),
      ...(telefono && { 'profile.phone': telefono }),
    });

    const opciones = cleanObj({ page, limit });

    const conversaciones = await getConversaciones({
      filters: base,
      options: opciones,
    });
    return res.status(200).json(conversaciones);
  }),
  getConversacionById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit, offset } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'id es requerido' });
    }

    const conversacion = await getConversacionById(
      id,
      cleanObj({
        limit,
        offset,
        sort: { createdAt: -1 },
      })
    );
    if (!conversacion) {
      return res.status(404).json({ error: 'Conversacion no encontrada' });
    }

    return res.status(200).json(conversacion);
  }),
  sendMessage: asyncHandler(async (req, res) => {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId y message son requeridos' });
    }

    await enviarMensaje(userId, normStr(message));
    return res.status(200).json({ message: 'Mensaje enviado correctamente' });
  }),
};
