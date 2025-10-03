const express = require('express');
const router = express.Router();
const ctrl = require('../controller/conversacionMock.controller');

router.get('/', ctrl.getConversaciones);
router.get('/:id', ctrl.getConversacionById);
router.post('/message', ctrl.sendMessage);

module.exports = router;
