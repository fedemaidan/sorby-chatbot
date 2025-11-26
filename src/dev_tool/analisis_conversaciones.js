require('dotenv').config();
const connectToMongoDB = require("../Utiles/mongoDB/dBconnect");
const { getMensajesCol } = require("../repository/conversacion.repository");
const openai = require("../Utiles/Chatgpt/openai");
const mongoose = require("mongoose");

async function main() {
    // Parse arguments for date range
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Uso: node src/dev_tool/analisis_conversaciones.js <fecha_inicio> [fecha_fin]");
        console.log("Formato fecha: YYYY-MM-DD");
        process.exit(1);
    }

    const fechaInicioStr = args[0];
    const fechaFinStr = args[1] || fechaInicioStr;

    const fechaInicio = new Date(fechaInicioStr);
    // Ajustar fecha inicio a 00:00:00 si solo se pasa la fecha
    if (fechaInicioStr.length <= 10) {
        fechaInicio.setHours(0, 0, 0, 0);
    }

    const fechaFin = new Date(fechaFinStr);
    // Ajustar fecha fin a 23:59:59 si solo se pasa la fecha
    if (fechaFinStr.length <= 10) {
        fechaFin.setHours(23, 59, 59, 999);
    }

    console.log(`Analizando desde ${fechaInicio.toLocaleString()} hasta ${fechaFin.toLocaleString()}...`);

    try {
        await connectToMongoDB();

        const colMensajes = await getMensajesCol();
        
        // Fetch messages
        const mensajes = await colMensajes.find({
            createdAt: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        }).sort({ id_conversacion: 1, createdAt: 1 }).toArray();

        console.log(`Se encontraron ${mensajes.length} mensajes.`);

        if (mensajes.length === 0) {
            console.log("No hay mensajes para analizar.");
            process.exit(0);
        }

        // Agrupar por conversación
        const conversaciones = {};
        mensajes.forEach(m => {
            if (!conversaciones[m.id_conversacion]) {
                conversaciones[m.id_conversacion] = [];
            }
            conversaciones[m.id_conversacion].push(m);
        });

        console.log(`Se encontraron ${Object.keys(conversaciones).length} conversaciones activas en el periodo.`);

        let conversationText = "";
        let convIndex = 1;

        for (const idConv in conversaciones) {
            const msgs = conversaciones[idConv];
            conversationText += `\n--- Conversación ${convIndex} (ID: ${idConv}) ---\n`;
            
            msgs.forEach(m => {
                const sender = m.fromMe ? "BOT" : "USUARIO";
                const time = new Date(m.createdAt).toLocaleString();
                const content = m.message || m.caption || "[Sin texto]";
                conversationText += `[${time}] ${sender}: ${content}\n`;
            });
            convIndex++;
        }

        const prompt = `
Analiza las siguientes conversaciones entre un bot y usuarios y extrae las siguientes métricas GLOBALES (sumando todas las conversaciones):

1. Cantidad de movimientos de caja creados.
2. Cantidad de remitos cargados.
3. Cantidad de acopios cargados.
4. Cuantas veces tuvo que corregir los datos que le sugiere el bot en movimientos de caja.
5. Cuantas veces tuvo que corregir los datos que le sugiere el bot en remitos de acopio.
6. Cuantas veces el flujo quedó roto afectando la experiencia del usuario.
7. Del 1 al 100 como evaluarías la experiencia del cliente usando el bot (promedio general). Debes ser exigente.

Responde con un formato claro, listando cada punto.

Conversaciones:
${conversationText}
        `;

        console.log("Enviando a ChatGPT para análisis...");

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o",
        });

        console.log("\n--- Resultado del Análisis ---\n");
        console.log(completion.choices[0].message.content);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // Force exit because mongoose connection might keep process alive
        process.exit(0);
    }
}

main();
