const express = require('express');
const router = express.Router();
const ctrl = require('../controller/conversacion.controller');

router.get('/', ctrl.getConversaciones);
router.get('/last', ctrl.getUltimosMensajes);
router.get('/:id/download', ctrl.downloadConversacion);
router.get('/:id', ctrl.getConversacionById);
router.post('/message', ctrl.sendMessage);


module.exports = router;
