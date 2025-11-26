const express = require('express');
const flowsRouter = require('./flow.routes');
const conversacionesRouter = require('./conversacion.route');
const phoneroute = require('./phone.route');
const analisisRouter = require('./analisis.routes');
const router = express.Router();

// ÚNICA ruta montada hoy:
router.use('/flows', flowsRouter);
router.use('/conversaciones', conversacionesRouter);
router.use('/phone', phoneroute );
router.use('/analisis', analisisRouter);
//router.use("/hola", Hola)

//const Hola = (req, res) => {
 // res.send("Hola, MI api funciona!");
 //}

module.exports = router;
