// Captura errores async y delega al middleware de errores
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Helpers mínimos de parseo
const normStr = (v) => String(v ?? '').trim();
const toInt = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
};
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

const cleanObj = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined)
  );
};

const normalizeSort = (s, def = 1) => {
  const n = toInt(s, def);
  return n >= 0 ? 1 : -1;
};

const ensurePosInt = (n, def = 0) => {
  n = toInt(n, def);
  return n < 0 ? 0 : n;
};

const ensureLimit = (n, def = 150, max = 500) => {
  n = toInt(n, def);
  if (n <= 0) n = def;
  if (n > max) n = max;
  return n;
};


module.exports = {
  asyncHandler,
  normStr,
  toInt,
  isObj,
  cleanObj,
  ensureLimit,
  ensurePosInt,
  normalizeSort
};
