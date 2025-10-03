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

module.exports = {
  asyncHandler,
  normStr,
  toInt,
  isObj,
  cleanObj,
};
