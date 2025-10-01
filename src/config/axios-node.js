// src/config/axios-node.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_URL,      // o la que uses
  headers: { 'Content-Type': 'application/json' },
  timeout: 1000 * 60,                // 1 minuto
});

// Token en memoria para este proceso (simple y suficiente en la mayoría de casos).
let _authToken = null;

/**
 * Setea el token Bearer que se adjuntará a TODAS las requests nuevas.
 * Llamalo cuando tengas el ID token del usuario.
 */
export function setAuthToken(token) {
  _authToken = token || null;
}

/** Limpia el token global (opcional) */
export function clearAuthToken() {
  _authToken = null;
}

// Interceptor: si hay token seteado, lo agrega como Authorization.
api.interceptors.request.use(
  (config) => {
    if (_authToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${_authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;