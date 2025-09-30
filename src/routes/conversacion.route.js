const express = require('express');
const router = express.Router();
const ctrl = require('../controller/conversacion.controller');

router.get('/', ctrl.getConversaciones);
router.get('/:id', ctrl.getConversacionById);
router.post('/message', ctrl.sendMessage);

module.exports = router;
