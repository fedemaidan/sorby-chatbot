// src/Utiles/Mensajes/whatsapp.js
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode');
const express = require('express');
const sockSingleton = require('../../services/SockSingleton/sockSingleton');

const AUTH_DIR = './auth_info';
const router = express.Router();

let latestQR = null;
let sock = null;
let reconnecting = false;
let backoffMs = 5_000;

router.get('/qr', async (req, res) => {
  if (!latestQR) return res.status(503).send('QR no generado aún. Probá en 5s...');
  try {
    const url = await QRCode.toDataURL(latestQR);
    res.send(`<img src="${url}" style="width:300px">`);
  } catch {
    res.status(500).send('Error generando QR');
  }
});

async function connectToWhatsApp() {
  if (reconnecting) return sock;
  reconnecting = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    // 👉 versión/UA oficiales
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log('WA version ->', version, 'latest?', isLatest);

    sock = makeWASocket({
      version,
      auth: state,
      browser: Browsers.macOS('Google Chrome'),
      markOnlineOnConnect: false,
      syncFullHistory: false,
      connectTimeoutMs: 30_000,
      keepAliveIntervalMs: 20_000,
      printQRInTerminal: false, // mostramos por endpoint
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr, pairingCode }) => {
      if (qr) latestQR = qr;
      if (pairingCode) console.log('Pairing code:', pairingCode);

      if (connection === 'open') {
        console.log('✅ Connected to WhatsApp');
        latestQR = null;
        backoffMs = 5_000;
        reconnecting = false;
      }

      if (connection === 'close') {
        const err = lastDisconnect?.error;
        const boom = err instanceof Boom ? err : new Boom(err);
        const status = boom?.output?.statusCode || boom?.data?.statusCode || err?.status || err?.code;
        console.log('🔴 Closed. status:', status, 'msg:', boom?.message);

        const shouldReconnect = status !== 401;
        if (shouldReconnect) {
          const wait = Math.min(backoffMs, 60_000);
          console.log(`⏳ Reintentando en ${Math.round(wait / 1000)}s...`);
          setTimeout(() => {
            reconnecting = false;
            backoffMs *= 2;
            connectToWhatsApp().catch(() => {});
          }, wait);
        } else {
          // 401 => sesión inválida/expulsada: re-vincular
          reconnecting = false;
        }
      }
    });

    // 👉 dale el socket a tu singleton (tu listener vive allí)
    await sockSingleton.setSock(sock);

    return sock;
  } catch (e) {
    console.error('connectToWhatsApp error:', e?.message || e);
    reconnecting = false;
    throw e;
  }
}

function getSock() { return sock; }
module.exports = { router, connectToWhatsApp, getSock };
