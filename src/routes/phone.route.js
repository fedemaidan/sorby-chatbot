const express = require('express');
const router = express.Router();
const ctrl = require('../controller/phone.controller');

router.get('/', ctrl.obtenerPhoneByLid);

module.exports = router;
