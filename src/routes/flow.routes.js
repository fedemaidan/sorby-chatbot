// src/routes/flow.routes.js
const express = require('express');
const { authenticate } = require('../Utiles/Firebase/firebaseUtils');
const ctrl = require('../controller/flow.controller');

const router = express.Router();

// Endpoints reales de Flow
router.post('/', authenticate, ctrl.create);
router.get('/', authenticate, ctrl.listByUser);
router.get('/:userId/:flow', authenticate, ctrl.getByUserFlow);
router.patch('/:userId/:flow/step', authenticate, ctrl.setStep);


module.exports = router;