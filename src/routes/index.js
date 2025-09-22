const express = require("express");
const flowsRouter = require("./flows.routes.js");

const router = express.Router();

// ÚNICA ruta montada hoy:
router.use("/flows", flowsRouter);

module.exports = router;