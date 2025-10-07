const fs = require('fs');
const path = require('path');
const os = require('os');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { convertPdfToJpeg } = require('../Firebase/convertPdfToJpeg');
const { admin } = require('../Firebase/firebaseUtils');

async function saveImageToStorage(message, senderPhone, messageType) {
    try {
        console.log('📥 Procesando archivo...');

        if (!messageType) {
            throw new Error('❌ No se encontró contenido multimedia en el mensaje.');
        }

        const mediaContent = message; // Ya es el contenido correcto

        if (!mediaContent) {
            throw new Error('❌ No se encontró contenido multimedia en el mensaje.');
        }

        const enrichedMessage = {
            key: message.key || { remoteJid: 'unknown', id: 'unknown', fromMe: false },
            message: { [`${messageType}Message`]: mediaContent },
        };

        const buffer = await downloadMediaMessage(enrichedMessage, 'buffer');

        console.log('📂 Archivo descargado');
        
        // Generar nombre único
        const randomNumber = Math.floor(Math.random() * 1000000);
        const downloadsDir = path.join(__dirname, '../downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        if (mediaContent.mimetype === 'application/pdf') {
            // Guardar PDF temporalmente
            const pdfPath = path.join(downloadsDir, `${randomNumber}.pdf`);
            fs.writeFileSync(pdfPath, buffer);
            console.log(`✅ PDF guardado en: ${pdfPath}`);

            // Convertir PDF a imágenes
            const outputDir = path.join(os.tmpdir(), `pdf_images_${randomNumber}`);
            fs.mkdirSync(outputDir, { recursive: true });
            const { outputPrefix, pageCount } = await convertPdfToJpeg(pdfPath, outputDir);

            if (pageCount === 0) {
                console.error('❌ No se generaron imágenes del PDF.');
                return null;
            }

            // Obtener primera imagen generada
            const firstPagePath = `${outputPrefix}-1.jpeg`;
            if (!fs.existsSync(firstPagePath)) {
                console.error('❌ No se encontró la imagen generada.');
                return null;
            }

            //FIREBASE
            const date = new Date().toISOString().split('T')[0];
            const filePath = `metal/remitos/${senderPhone}/${date}/${randomNumber}.jpeg`;
            const imageBuffer = fs.readFileSync(firstPagePath);


            const storageResult = await saveFileToStorage(imageBuffer, `${randomNumber}.jpeg`, filePath, 'image/jpeg');
            //------

            return { imagenlocal: firstPagePath, imagenFirebase: storageResult.signedUrl };
        } else 
        {
            // Forzar extensión según mimetype
            let forcedExt = '.jpg';
            let mimeType = 'image/jpeg';
            if (mediaContent.mimetype === 'image/png') {
                forcedExt = '.png';
                mimeType = 'image/png';
            }

            const localImagePath = path.join(downloadsDir, `${randomNumber}${forcedExt}`);
            fs.writeFileSync(localImagePath, buffer);
            const date = new Date().toISOString().split('T')[0];
            const filePath = `metal/remitos/${senderPhone}/${date}/${randomNumber}${forcedExt}`;
            const imageBuffer = fs.readFileSync(localImagePath);
            const storageResult = await saveFileToStorage(imageBuffer, `${randomNumber}${forcedExt}`, filePath, mimeType);
            console.log(`✅ Imagen guardada en: ${localImagePath}`);
            return { imagenlocal: localImagePath, imagenFirebase: storageResult.signedUrl };          
        }
    } catch (error) {
        console.error('❌ Error procesando el archivo:', error.message);
        throw error
    }
}

async function saveFileToStorage(buffer, fileName, filePath, mimeType) {
    const bucket = admin.storage().bucket();
    try {
        const file = bucket.file(filePath);
        await file.save(buffer, { metadata: { contentType: mimeType } });

        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
        });

        console.log(`Archivo subido: ${signedUrl}`);
        return { success: true, signedUrl };
    } catch (error) {
        console.error('Error al guardar archivo en Firebase:', error.message);
        return { success: false, error: error.message };
    }
}

async function GuardarArchivoFire(absolutePath, userId, useRandomName = false) {
    try {
        // Leer el archivo en buffer
        const buffer = fs.readFileSync(absolutePath);
        const fileName = useRandomName
            ? `file-${Date.now()}-${Math.floor(Math.random() * 1000)}.pdf`
            : path.basename(absolutePath);

        // Estructura la ruta de Firebase
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const filePath = `metal/remitos/${userId}/${date}/${fileName}`;

        const bucket = admin.storage().bucket();
        const file = bucket.file(filePath);
        await file.save(buffer, { metadata: { contentType: 'application/pdf' } });

        // Obtener el URL firmado para acceder al archivo
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
        });

        console.log(`✅ Archivo subido con éxito: ${signedUrl}`);
        return { success: true, signedUrl };
    } catch (error) {
        console.error('🚨 Error al guardar archivo en Firebase:', error.message);
        return { success: false, error: error.message };
    }
}

async function saveAudioToStorage(absolutePath, userId, useRandomName = false) {
  try {
    if (!absolutePath || !userId) {
      throw new Error('absolutePath y userId son requeridos');
    }

    // leer archivo local
    const buffer = fs.readFileSync(absolutePath);

    // nombre y extensión
    const parsed = path.parse(absolutePath);
    const baseName = useRandomName
      ? `audio-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      : (parsed.name || `audio-${Date.now()}`);
    let ext = (parsed.ext || '').toLowerCase();

    // default si no viene extensión
    if (!ext) ext = '.ogg';

    // mimetype por extensión (fallback octet-stream)
    const mimeByExt = {
      '.ogg': 'audio/ogg',
      '.opus': 'audio/ogg',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.amr': 'audio/amr',
    };
    const mimeType = mimeByExt[ext] || 'application/octet-stream';

    const fileName = `${baseName}${ext}`;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filePath = `metal/audios/${userId}/${date}/${fileName}`;

    // subir a Firebase Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);
    await file.save(buffer, { metadata: { contentType: mimeType } });

    // URL firmado (larga duración)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491',
    });

    return signedUrl; // ← devolvemos SOLO la URL web
  } catch (error) {
    console.error('🚨 Error al guardar audio en Firebase:', error.message);
    throw error;
  }
}

module.exports = { saveImageToStorage, GuardarArchivoFire, saveAudioToStorage };