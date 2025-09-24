const express = require("express");
const flowsRouter = require("./flow.routes");

const router = express.Router();

// ÚNICA ruta montada hoy:
router.use("/flows", flowsRouter);
//router.use("/hola", Hola)


 /*const Hola = (req, res) => {
  res.send("Hola, MI api funciona!");
 }*/

module.exports = router;