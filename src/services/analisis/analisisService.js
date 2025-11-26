const repo = require("../../repository/analisis.repository");

async function obtenerAnalisis({ fechaInicio, fechaFin, empresaId, empresaNombre, usuario, limit, offset }) {
    return await repo.getAnalisis({ fechaInicio, fechaFin, empresaId, empresaNombre, usuario, limit, offset });
}

module.exports = {
    obtenerAnalisis
};
