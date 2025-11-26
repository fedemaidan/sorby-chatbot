const express = require("express");
const router = express.Router();
const controller = require("../controller/analisisController");

router.get("/", controller.getAnalisis);

module.exports = router;
