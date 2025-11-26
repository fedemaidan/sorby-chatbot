const repo = require("../../repository/analisis.repository");
const convRepo = require("../../repository/conversacion.repository");

async function obtenerAnalisis({ fechaInicio, fechaFin, empresaId, empresaNombre, usuario, limit, offset }) {
    return await repo.getAnalisis({ fechaInicio, fechaFin, empresaId, empresaNombre, usuario, limit, offset });
}

async function exportarConversacion(analisisId) {
    const analisis = await repo.getAnalisisById(analisisId);
    if (!analisis) throw new Error("Análisis no encontrado");

    const mensajes = await convRepo.getMensajesRango(
        analisis.id_conversacion,
        analisis.rango_analisis.inicio,
        analisis.rango_analisis.fin
    );

    let text = `REPORTE DE CONVERSACIÓN\n`;
    text += `Fecha: ${new Date(analisis.rango_analisis.inicio).toLocaleDateString()}\n`;
    text += `Empresa: ${analisis.empresa?.nombre || 'N/A'} (${analisis.empresa?.id || 'N/A'})\n`;
    text += `Usuario: ${analisis.usuario?.nombre || 'N/A'} (${analisis.usuario?.telefono || 'N/A'})\n`;
    text += `----------------------------------------\n\n`;

    mensajes.forEach(m => {
        const time = new Date(m.createdAt).toLocaleTimeString();
        const sender = m.fromMe ? "BOT" : "USUARIO";
        const content = m.message || m.caption || "[Sin texto]";
        text += `[${time}] ${sender}: ${content}\n`;
    });

    return {
        filename: `conversacion_${analisis.usuario?.telefono || 'anon'}_${new Date(analisis.rango_analisis.inicio).toISOString().split('T')[0]}.txt`,
        content: text
    };
}

module.exports = {
    obtenerAnalisis,
    exportarConversacion
};
