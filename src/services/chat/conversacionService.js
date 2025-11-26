// services/chat/conversacionService.js
const repo = require("../../repository/mensajes.repository");
const repoc = require("../../repository/conversacion.repository");
const { ensureLimit, ensurePosInt, normalizeSort } = require("../../controller/utils/general");

// ---------- helpers ----------
function parseSort(raw, field = 'updatedAt', def = -1) {
  if (raw == null) return def;
  if (typeof raw === 'number') return normalizeSort(raw);
  if (typeof raw === 'string') return raw.toLowerCase() === 'asc' ? 1 : -1;
  if (typeof raw === 'object') {
    if (typeof raw[field] !== 'undefined') return normalizeSort(raw[field]);
    // fallback: si viene {createdAt:...} cuando field es updatedAt o viceversa
    const altField = field === 'updatedAt' ? 'createdAt' : 'updatedAt';
    if (typeof raw[altField] !== 'undefined') return normalizeSort(raw[altField]);
  }
  return def;
}

function pick(valA, valB, fallback) {
  return (valA ?? valB ?? fallback);
}

function toWpid(raw = '') {
  const v = String(raw || '').trim();
  if (!v) return '';
  const hasAt = /@/i.test(v);
  const isWpid = /@{1,2}s\.whatsapp\.net$/i.test(v) || /@g\.us$/i.test(v) || /@broadcast$/i.test(v);
  return hasAt ? v : `${v}@s.whatsapp.net`;
}

async function createConversacion({ senderLid, empresa, profile, phone, emisor = "Usuario", mensaje }) {  
  const conv = await repoc.createConversacion({ Lid: senderLid, wPid: phone, empresa, profile, emisor, mensaje });
  const _id = conv?._id ?? conv?.id;
  return _id ? String(_id) : null;
}

// ---------- Conversación por ID (mensajes) ----------
async function getConversacionById(id, { limit, offset, sort } = {}) {
  if (!id) throw new Error('id_conversacion es requerido');

  const sortNum = parseSort(sort, 'createdAt', -1);
  const options = {
    limit: ensureLimit(pick(limit, undefined, 100)),
    offset: ensurePosInt(pick(offset, undefined, 0)),
    sort: sortNum,
  };

  const items = await repo.getMensajesByConversacionId({
    id_conversacion: String(id),
    filter: {},
    options
  });

  const col = await repo.__getColMensajes();
  const total = await col.countDocuments({ id_conversacion: String(id) });

  return { items, total };
}

// ---------- Listado de conversaciones ----------
async function getConversaciones({
  // soportamos ambos estilos: top-level o dentro de options
  filter, filters, search, options = {}, limit, offset, sort, withUltimoMensaje = true
} = {}) {
  const finalFilter = { ...(filters || {}), ...(filter || {}) };

  const finalLimit  = ensureLimit(pick(options.limit,  limit, 150));
  const finalOffset = ensurePosInt(pick(options.offset, offset, 0));
  const rawSort     = pick(options.sort, sort, -1);
  const finalSort   = parseSort(rawSort, 'updatedAt', -1);

  return repoc.listConversaciones({
    filter: finalFilter,
    search,
    options: { limit: finalLimit, offset: finalOffset, sort: finalSort },
    withUltimoMensaje
  });
}


async function getOrCreateConversacion({ wPidFinal, lidFinal, emisor, empresa, profile }) {
  // 1) buscar conversación (doc completo)
  let conv = null;
  if (wPidFinal) conv = await repoc.getIdConversacionByWpid({ wPid: wPidFinal });
  if (!conv && lidFinal) conv = await repoc.getIdConversacionByLid({ Lid: lidFinal });

  // 2) crear si no existe
  if (!conv) {
    const idCreado = await createConversacion({
      senderLid: lidFinal ?? null,
      empresa,
      profile,
      phone: wPidFinal ?? null,
      emisor,
    });
    return String(idCreado);
  }

  // 3) completar lo que falte (solo lid / wPid)
  if (!conv.lid && lidFinal) {
    await repoc.setLidById({ id: conv._id, lid: String(lidFinal) });
  }
  if (!conv.wPid && wPidFinal) {
    await repoc.setWpidById({ id: conv._id, wPid: String(wPidFinal) });
  }

  // 4) devolver solo el id
  return conv._id;
}

async function resolveConversacionId({ id, phone, lid }) {
  if (id) return String(id).trim();

  if (phone) {
    const wpid = toWpid(phone);
    const conv = await repoc.getIdConversacionByWpid({ wPid: wpid });
    if (conv) return String(conv._id);
  }
  if (lid) {
    const conv = await repoc.getIdConversacionByLid({ Lid: String(lid).trim() });
    if (conv) return String(conv._id);
  }
  return null;
}

async function getUltimosMensajesService({ id, phone, lid, limit, sort } = {}) {
  const LIM_DEF = 10;
  const LIM_MAX = 100;

  const limNum = ensureLimit(
    Number.isFinite(+limit) ? parseInt(limit, 10) : LIM_DEF
  );
  const finalLimit = Math.min(LIM_MAX, Math.max(1, limNum));

  const sortDir = (String(sort || 'desc').toLowerCase() === 'asc') ? 1 : -1;
  const idConversacion = await resolveConversacionId({ id, phone, lid });
  if (!idConversacion) {
    return {
      error: 'No se pudo resolver la conversación. Proveé id, phone o lid válidos.'
    };
  }

  const items = await repo.getMensajesByConversacionId({
    id_conversacion: String(idConversacion),
    filter: {},
    options: { limit: finalLimit, offset: 0, sort: sortDir }
  });

  return {
    id_conversacion: String(idConversacion),
    sort: sortDir === 1 ? 'asc' : 'desc',
    limit: finalLimit,
    total: items?.length || 0,
    items
  };
}

async function actualizarMensajeConversacion({mensaje, id_conversacion }) 
  {
  if (!id_conversacion) throw new Error("id_conversacion es requerido");
  if (!mensaje) return false;

  await repoc.guardarUltimoMensaje({ id: id_conversacion, mensaje });
  return true;
  }

async function downloadConversacion(id, { fechaInicio, fechaFin }) {
    const conv = await repoc.getConversacionById(id);
    if (!conv) throw new Error("Conversación no encontrada");

    const mensajes = await repoc.getMensajesRango(id, fechaInicio, fechaFin);

    let text = `REPORTE DE CONVERSACIÓN\n`;
    text += `Fecha Inicio: ${new Date(fechaInicio).toLocaleString()}\n`;
    text += `Fecha Fin: ${new Date(fechaFin).toLocaleString()}\n`;
    text += `Empresa: ${conv.empresa?.nombre || 'N/A'} (${conv.empresa?.id || 'N/A'})\n`;
    text += `Usuario: ${conv.profile?.name || 'N/A'} (${conv.wPid || conv.lid || 'N/A'})\n`;
    text += `----------------------------------------\n\n`;

    mensajes.forEach(m => {
        const time = new Date(m.createdAt).toLocaleString();
        const sender = m.fromMe ? "BOT" : "USUARIO";
        const content = m.message || m.caption || "[Sin texto]";
        text += `[${time}] ${sender}: ${content}\n`;
    });

    const filename = `conversacion_${conv.profile?.name || 'anon'}_${new Date().getTime()}.txt`.replace(/ /g, '_');

    return {
        filename,
        content: text
    };
}

module.exports = {
  getConversaciones,
  createConversacion,
  getOrCreateConversacion,
  getConversacionById,
  getUltimosMensajesService,
  actualizarMensajeConversacion,
  downloadConversacion
};
