// src/config/axiosConfig.js
const axios = require('axios');
// 👇 tu config es ESM; para CJS hay que tomar el default
const config = require('./config').default; // <— ESTE detalle

const baseURL = process.env.API_URL || config.apiUrl; // ej: http://localhost:3003/api
if (!baseURL || !/^https?:\/\//.test(baseURL)) {
  throw new Error(`API baseURL inválida: "${baseURL}". Configurá process.env.API_URL o config.apiUrl`);
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
});

// Token opcional
let _authToken = null;
function setAuthToken(t) { _authToken = t || null; }
function clearAuthToken() { _authToken = null; }

api.interceptors.request.use((cfg) => {
  if (_authToken) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${_authToken}`;
  }
  return cfg;
});

module.exports = { api, setAuthToken, clearAuthToken };