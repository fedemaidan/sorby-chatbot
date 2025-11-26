const service = require("../services/analisis/analisisService");

async function getAnalisis(req, res) {
    try {
        const { fechaInicio, fechaFin, empresaId, empresaNombre, usuario, limit, offset } = req.query;
        
        const data = await service.obtenerAnalisis({ 
            fechaInicio, 
            fechaFin, 
            empresaId, 
            empresaNombre,
            usuario,
            limit, 
            offset 
        });
        
        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        console.error("Error en getAnalisis:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function exportConversacion(req, res) {
    try {
        const { id } = req.params;
        const { filename, content } = await service.exportarConversacion(id);
        
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'text/plain');
        res.send(content);
    } catch (error) {
        console.error("Error en exportConversacion:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    getAnalisis,
    exportConversacion
};
