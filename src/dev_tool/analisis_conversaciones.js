require('dotenv').config();
const connectToMongoDB = require("../Utiles/mongoDB/dBconnect");
const { getMensajesCol, getConversacionesCol } = require("../repository/conversacion.repository");
const { guardarAnalisis } = require("../repository/analisis.repository");
const openai = require("../Utiles/Chatgpt/openai");
const mongoose = require("mongoose");

async function main() {
    // Parse arguments for date range
    const args = process.argv.slice(2);
    let fechaInicio, fechaFin;
    let fechaInicioStr, fechaFinStr;


    if (args.length === 0) {
        // Si no hay argumentos, usar ayer
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        fechaInicio = new Date(yesterday);
        fechaInicioStr = fechaInicio.toISOString().split('T')[0];
        
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        fechaFin = yesterdayEnd;
        fechaFinStr = fechaFin.toISOString().split('T')[0];
        
        console.log("Sin argumentos: Analizando el día de ayer.");
    } else {
        fechaInicioStr = args[0];
        fechaFinStr = args[1] || fechaInicioStr;

        fechaInicio = new Date(fechaInicioStr);
        if (fechaInicioStr.length <= 10) fechaInicio.setHours(0, 0, 0, 0);

        fechaFin = new Date(fechaFinStr);
        if (fechaFinStr.length <= 10) fechaFin.setHours(23, 59, 59, 999);
    }

    console.log(`Analizando desde ${fechaInicio.toLocaleString()} hasta ${fechaFin.toLocaleString()}...`);

    try {
        await connectToMongoDB();

        const colMensajes = await getMensajesCol();
        const colConversaciones = await getConversacionesCol();
        
        const mensajes = await colMensajes.find({
            createdAt: { $gte: fechaInicio, $lte: fechaFin }
        }).sort({ id_conversacion: 1, createdAt: 1 }).toArray();

        console.log(`Se encontraron ${mensajes.length} mensajes.`);

        if (mensajes.length === 0) {
            console.log("No hay mensajes para analizar.");
            process.exit(0);
        }

        const conversaciones = {};
        mensajes.forEach(m => {
            if (!conversaciones[m.id_conversacion]) conversaciones[m.id_conversacion] = [];
            conversaciones[m.id_conversacion].push(m);
        });

        console.log(`Se encontraron ${Object.keys(conversaciones).length} conversaciones activas.`);

        const resultados = [];
        let convIndex = 1;
        const totalConversaciones = Object.keys(conversaciones).length;

        for (const idConv in conversaciones) {
            const msgs = conversaciones[idConv];
            
            // Obtener info de la conversación
            let empresaId = "";
            let empresaNombre = "";
            let telefono = "Desconocido";
            let nombreUsuario = "";
            
            try {
                const convDoc = await colConversaciones.findOne({ _id: new mongoose.Types.ObjectId(idConv) });
                if (convDoc) {
                    telefono = convDoc.wPid || convDoc.lid || "Sin teléfono";
                    
                    if (convDoc.empresa) {
                        empresaId = convDoc.empresa._id || convDoc.empresa.id || "";
                        empresaNombre = convDoc.empresa.nombre || convDoc.empresa.razonSocial || convDoc.empresa.razon_social || "Sin nombre";
                    }
                    
                    if (convDoc.profile) {
                        const nombre = convDoc.profile.nombre || convDoc.profile.name || "";
                        const apellido = convDoc.profile.apellido || convDoc.profile.lastname || "";
                        nombreUsuario = `${nombre} ${apellido}`.trim();
                    }
                }
            } catch (e) {
                console.error(`Error buscando info de conversación ${idConv}:`, e.message);
            }

            let conversationText = "";
            msgs.forEach(m => {
                const sender = m.fromMe ? "BOT" : "USUARIO";
                const time = new Date(m.createdAt).toLocaleString();
                const content = m.message || m.caption || "[Sin texto]";
                conversationText += `[${time}] ${sender}: ${content}\n`;
            });

            const prompt = `
Analiza la siguiente conversación y extrae las métricas en formato JSON.
NO incluyas markdown, solo el JSON puro.

Métricas requeridas:
- movimientos_caja_creados (number)
- remitos_cargados (number)
- acopios_cargados (number)
- correcciones_caja (number): veces que el usuario corrigió datos sugeridos en caja
- correcciones_acopio (number): veces que el usuario corrigió datos sugeridos en acopio
- flujo_roto (number): veces que el flujo se rompió o el bot no entendió
- experiencia_cliente (number): 1-100 (sé exigente)
- resumen (string): breve resumen de lo sucedido

Conversación:
${conversationText}
            `;

            console.log(`Analizando ${convIndex}/${totalConversaciones} (ID: ${idConv})...`);

            try {
                const completion = await openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "gpt-4o",
                });

                let content = completion.choices[0].message.content;
                // Limpiar markdown si existe
                content = content.replace(/```json/g, '').replace(/```/g, '').trim();
                
                const data = JSON.parse(content);
                
                const analisisData = {
                    fecha_analisis: new Date(),
                    rango_analisis: { inicio: fechaInicio, fin: fechaFin },
                    id_conversacion: idConv,
                    empresa: { id: empresaId, nombre: empresaNombre },
                    usuario: { telefono, nombre: nombreUsuario },
                    metricas: {
                        movimientos_caja_creados: data.movimientos_caja_creados || 0,
                        remitos_cargados: data.remitos_cargados || 0,
                        acopios_cargados: data.acopios_cargados || 0,
                        correcciones_caja: data.correcciones_caja || 0,
                        correcciones_acopio: data.correcciones_acopio || 0,
                        flujo_roto: data.flujo_roto || 0,
                        experiencia_cliente: data.experiencia_cliente || 0
                    },
                    resumen: data.resumen || "",
                    raw_analysis: data
                };

                await guardarAnalisis(analisisData);
                console.log(`✅ Análisis guardado en MongoDB para conversación ${idConv}`);

            } catch (err) {
                console.error(`Error analizando conversación ${idConv}:`, err.message);
            }
            convIndex++;
        }

        console.log("\n--- Proceso finalizado ---");
        console.log("Todos los análisis han sido guardados en la colección 'analisis_conversaciones'.");

    } catch (error) {
        console.error("Error global:", error);
    } finally {
        process.exit(0);
    }
}

main();
