const { asyncHandler, normStr, cleanObj } = require('./utils/general');
const {getConversaciones, getConversacionById, getUltimosMensajesService} = require('../services/chat/conversacionService');
const {enviarMensajeService} = require('../services/chat/mensajesServices');

module.exports = {
  getConversaciones: asyncHandler(async (req, res) => {
    const { empresaId, empresaNombre, telefono, email, offset, limit, sort } =
      req.query;
    const base = cleanObj({
      ...(empresaNombre && { 'empresa.nombre': empresaNombre }),
      ...(empresaId && { 'empresa.id': empresaId }),
      ...(email && { 'profile.email': email }),
      ...(telefono && { 'profile.phone': telefono }),
    });
    const opciones = cleanObj({
      offset,
      limit,
      ...(sort && {
        sort:
          sort.toLowerCase() === 'asc' ? { updatedAt: 1 } : { updatedAt: -1 },
      }),
    });
    const conversaciones = await getConversaciones({
      filters: base,
      options: opciones,
    });
    return res.status(200).json(conversaciones);
  }),

  getConversacionById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit, offset, sort } = req.query;
    if (!id) return res.status(400).json({ error: 'id es requerido' });

    const sortOpt =
      sort && sort.toLowerCase() === 'asc'
        ? { createdAt: 1 }
        : { createdAt: -1 };
    const { items, total } = await getConversacionById(
      id,
      cleanObj({ limit, offset, sort: sortOpt })
    );

    if (!items)
      return res.status(404).json({ error: 'Conversacion no encontrada' });
    return res
      .status(200)
      .json({ items, total, sort: sortOpt.createdAt === 1 ? 'asc' : 'desc' });
  }),

  sendMessage: asyncHandler(async (req, res) => {
    const { userId, message } = req.body;

    console.log('Received sendMessage request', { userId, message_len: message ? message.length : 0 });
    if (!userId || !message)
    return res.status(400).json({ error: 'userId y message son requeridos' });
    await enviarMensajeService({phone:userId, text:normStr(message)});
    return res.status(200).json({ message: 'Mensaje enviado correctamente' });
  }),

  getUltimosMensajes: asyncHandler(async (req, res) => {
    const { id, phone, lid, limit, sort } = req.query;
    console.log('getUltimosMensajes called with', { id, phone, lid, limit, sort });
    const result = await getUltimosMensajesService({
      id,
      phone,
      lid,
      limit,
      sort
    });
    return res.status(200).json(result);
  }),
};
