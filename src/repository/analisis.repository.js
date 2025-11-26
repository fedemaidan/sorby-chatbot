const mongoose = require("mongoose");

let colAnalisisPromise = null;
async function getAnalisisCol() {
  if (!mongoose.connection?.db) {
    throw new Error("Mongo no conectado.");
  }
  if (!colAnalisisPromise) {
    colAnalisisPromise = (async () => {
      const col = mongoose.connection.db.collection("analisis_conversaciones");
      // Índices para búsquedas rápidas
      await col.createIndex({ id_conversacion: 1, fecha_analisis: -1 }, { name: "by_conv_date" });
      await col.createIndex({ "rango_analisis.inicio": 1 }, { name: "by_range_start" });
      await col.createIndex({ "empresa.id": 1 }, { name: "by_empresa" });
      return col;
    })();
  }
  return colAnalisisPromise;
}

async function guardarAnalisis(data) {
    const col = await getAnalisisCol();
    return col.insertOne({
        ...data,
        created_at: new Date()
    });
}

async function getAnalisis({ fechaInicio, fechaFin, empresaId, empresaNombre, usuario, limit = 100, offset = 0 }) {
    const col = await getAnalisisCol();
    const query = {};

    if (fechaInicio && fechaFin) {
        // Buscamos análisis cuyo rango de inicio caiga en el periodo solicitado
        query["rango_analisis.inicio"] = {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin)
        };
    }

    if (empresaId) {
        query["empresa.id"] = empresaId;
    }

    if (empresaNombre) {
        query["empresa.nombre"] = { $regex: empresaNombre, $options: 'i' };
    }

    if (usuario) {
        query["$or"] = [
            { "usuario.nombre": { $regex: usuario, $options: 'i' } },
            { "usuario.telefono": { $regex: usuario, $options: 'i' } }
        ];
    }

    return col.find(query)
        .sort({ "rango_analisis.inicio": -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .toArray();
}

module.exports = { getAnalisisCol, guardarAnalisis, getAnalisis };
