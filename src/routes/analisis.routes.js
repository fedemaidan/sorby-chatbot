const express = require("express");
const router = express.Router();
const controller = require("../controller/analisisController");

router.get("/", controller.getAnalisis);
router.get("/:id/export", controller.exportConversacion);

module.exports = router;
