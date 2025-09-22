const express = require("express");
const router = express.Router();

// Inyectá el service real que ya tengas implementado
const flowService = require("../services/flow.service"); 
const makeFlowController = require("../controllers/flow.controller"); // el controller-puente
const flowController = makeFlowController({ flowService });

const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

// GET /flows?userId=&page=&pageSize=&sort=
router.get("/", async (req, res) => {
  try {
    const userId = String(req.query.userId || "").trim();
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId es requerido" });
    }

    req.query.page = toInt(req.query.page || "1", 1);
    req.query.pageSize = toInt(req.query.pageSize || "20", 20);
    req.query.sort = String(req.query.sort || "-updatedAt");

    return flowController.listByUser(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al listar flows",
      message: error.message,
    });
  }
});

// GET /flows/:userId/:flow
router.get("/:userId/:flow", async (req, res) => {
  try {
    return flowController.getByUserFlow(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener el flow",
      message: error.message,
    });
  }
});

// POST /flows
router.post("/", async (req, res) => {
  try {
    return flowController.create(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al crear el flow",
      message: error.message,
    });
  }
});

// PUT /flows/upsert
router.put("/upsert", async (req, res) => {
  try {
    return flowController.upsert(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al upsert del flow",
      message: error.message,
    });
  }
});

// PATCH /flows/:userId/:flow/step
router.patch("/:userId/:flow/step", async (req, res) => {
  try {
    return flowController.setStep(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al actualizar el step del flow",
      message: error.message,
    });
  }
});

// PATCH /flows/:userId/:flow/data  (merge parcial)
router.patch("/:userId/:flow/data", async (req, res) => {
  try {
    return flowController.mergeData(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al mergear datos del flow",
      message: error.message,
    });
  }
});

// PUT /flows/:userId/:flow/data (replace total)
router.put("/:userId/:flow/data", async (req, res) => {
  try {
    return flowController.replaceData(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al reemplazar datos del flow",
      message: error.message,
    });
  }
});

module.exports = router;