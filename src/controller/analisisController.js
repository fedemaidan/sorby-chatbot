const service = require("../services/analisis/analisisService");

async function getAnalisis(req, res) {
    try {
        const { fechaInicio, fechaFin, empresaId, limit, offset } = req.query;
        
        const data = await service.obtenerAnalisis({ 
            fechaInicio, 
            fechaFin, 
            empresaId, 
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

module.exports = {
    getAnalisis
};
