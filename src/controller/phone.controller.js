const { asyncHandler, normStr } = require('./utils/general');
const phoneService = require('../services/phoneService/phoneService');

module.exports = {
  obtenerPhoneByLid: asyncHandler(async (req, res) => {
    const { Lid } = req.body || {};
    if (!Lid) return res.status(400).json({ error: 'Falta Lid en el body' });

    const lid = typeof Lid === 'string' ? normStr(Lid).trim() : Lid;

    const data = await phoneService.obtenerphone(lid);
    return res.status(200).json(data);
  }),
};