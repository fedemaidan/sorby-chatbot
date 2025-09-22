const { httpHandler, ok, created } = require("./http.utils");

// Inyectamos dependencias para testear fácil.
// Espera un objeto { flowService }.
class FlowController {
  constructor({ flowService }) {
    this.flowService = flowService;

    // bind para usarlos directo en las rutas
    this.create        = httpHandler(this.create.bind(this));
    this.upsert        = httpHandler(this.upsert.bind(this));
    this.setStep       = httpHandler(this.setStep.bind(this));
    this.mergeData     = httpHandler(this.mergeData.bind(this));
    this.replaceData   = httpHandler(this.replaceData.bind(this));
    this.getByUserFlow = httpHandler(this.getByUserFlow.bind(this));
    this.listByUser    = httpHandler(this.listByUser.bind(this));
  }

  // POST /flows
  async create(req, res) {
    const { userId, flow, step, flowData } = req.body || {};

    // Validación mínima en controller
    if (!userId || !flow || !step) {
      throw Object.assign(new Error("userId, flow y step son requeridos"), { name: "ValidationError" });
    }

    const payload = {
      userId: String(userId).trim(),
      flow: String(flow).trim(),
      step: String(step).trim(),
      flowData: flowData ?? {},
    };

    const ctx = this._buildCtx(req);
    const result = await this.flowService.create(payload, ctx);
    return created(res, result);
  }

  // PUT /flows/upsert
  async upsert(req, res) {
    const { userId, flow, step, flowData, ...rest } = req.body || {};

    if (!userId || !flow) {
      throw Object.assign(new Error("userId y flow son requeridos"), { name: "ValidationError" });
    }

    const payload = {
      userId: String(userId).trim(),
      flow: String(flow).trim(),
      ...(step ? { step: String(step).trim() } : {}),
      ...(flowData !== undefined ? { flowData } : {}),
      // cualquier otro campo permitido por negocio podría ir en rest (si el service lo soporta)
      ...rest,
    };

    const ctx = this._buildCtx(req);
    const result = await this.flowService.upsert(payload, ctx);
    return ok(res, result);
  }

  // PATCH /flows/:userId/:flow/step
  async setStep(req, res) {
    const { userId, flow } = req.params;
    const { step } = req.body || {};

    if (!step) {
      throw Object.assign(new Error("step es requerido"), { name: "ValidationError" });
    }

    const payload = {
      userId: String(userId).trim(),
      flow: String(flow).trim(),
      step: String(step).trim(),
    };

    const ctx = this._buildCtx(req);
    const result = await this.flowService.setStep(payload, ctx);
    return ok(res, result);
  }

  // PATCH /flows/:userId/:flow/data (merge)
  async mergeData(req, res) {
    const { userId, flow } = req.params;
    const patch = req.body || {}; // merge parcial

    const payload = {
      userId: String(userId).trim(),
      flow: String(flow).trim(),
      patch, // el service define cómo mergear y validar
    };

    const ctx = this._buildCtx(req);
    const result = await this.flowService.mergeData(payload, ctx);
    return ok(res, result);
  }

  // PUT /flows/:userId/:flow/data (replace)
  async replaceData(req, res) {
    const { userId, flow } = req.params;
    const newData = req.body || {};

    const payload = {
      userId: String(userId).trim(),
      flow: String(flow).trim(),
      data: newData,
    };

    const ctx = this._buildCtx(req);
    const result = await this.flowService.replaceData(payload, ctx);
    return ok(res, result);
  }

  // GET /flows/:userId/:flow
  async getByUserFlow(req, res) {
    const { userId, flow } = req.params;

    const payload = {
      userId: String(userId).trim(),
      flow: String(flow).trim(),
    };

    const ctx = this._buildCtx(req);
    const result = await this.flowService.getByUserAndFlow(payload, ctx);
    return ok(res, result);
  }

  // GET /flows?userId=...&page=1&pageSize=20&sort=-updatedAt
  async listByUser(req, res) {
    const userId = String(req.query.userId || "").trim();
    if (!userId) {
      throw Object.assign(new Error("userId es requerido"), { name: "ValidationError" });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || "20", 10)));
    const sort = String(req.query.sort || "-updatedAt"); // convención: "-campo" = desc

    const payload = { userId, page, pageSize, sort };

    const ctx = this._buildCtx(req);
    const result = await this.flowService.listByUser(payload, ctx);
    return ok(res, result); // ideal que el service devuelva {items, page, pageSize, total}
  }

  // Contexto mínimo que viaja a services
  _buildCtx(req) {
    return {
      traceId: req.id || req.headers["x-request-id"] || undefined,
      ip: req.ip,
      auth: req.user || null, // si usás passport/jwt
      userAgent: req.get("user-agent"),
    };
  }
}

module.exports = (deps) => new FlowController(deps);