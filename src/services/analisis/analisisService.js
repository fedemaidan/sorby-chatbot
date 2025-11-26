const repo = require("../../repository/analisis.repository");

async function obtenerAnalisis({ fechaInicio, fechaFin, empresaId, limit, offset }) {
    return await repo.getAnalisis({ fechaInicio, fechaFin, empresaId, limit, offset });
}

module.exports = {
    obtenerAnalisis
};
