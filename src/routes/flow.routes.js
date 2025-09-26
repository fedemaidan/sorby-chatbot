// src/routes/flow.routes.js
const express = require('express');
const { authenticate } = require('../Utiles/Firebase/firebaseUtils');
const ctrl = require('../controller/flow.controller');
const router = express.Router();

router.post('/create', authenticate, ctrl.create);                 // { userId, flow, step?, flowData? }
router.post('/getByUserId', authenticate, ctrl.getFlowByUserId);   // { userId }
router.post('/listAllUsers', authenticate, ctrl.listAllUsers);         // { userId, page?, pageSize?, sort? }
router.post('/setStep', authenticate, ctrl.setStep);               // { userId, flow, step }
router.post('/deleteByUserId', authenticate, ctrl.deleteByUserId); // { userId } (o hacé deleteByUserAndFlow)
module.exports = router;
