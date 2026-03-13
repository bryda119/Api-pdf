const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

// Dimensiones A4 en puntos (1 punto = 1/72 pulgadas)
// A4: 210mm x 297mm = 595.28 x 841.89 puntos
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

// Márgenes opcionales (en puntos)
const MARGIN = 20; // Margen de 20 puntos (aproximadamente 7mm)

/**
 * Convierte una imagen a PDF en formato A4
 * @param {string} rutaImagen - Ruta del archivo de imagen
 * @param {string} rutaSalida - Ruta donde guardar el PDF (opcional)
 * @param {Object} opciones - Opciones de conversión
 * @param {boolean} opciones.mantenerProporcion - Si true, mantiene la proporción de la imagen (default: true)
 * @param {boolean} opciones.centrar - Si true, centra la imagen en la página (default: true)
 * @param {number} opciones.margen - Margen en puntos (default: 20)
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
async function convertirImagenAPdf(rutaImagen, rutaSalida = null, opciones = {}) {
  try {
    const {
      mantenerProporcion = true,
      centrar = true,
      margen = MARGIN
    } = opciones;

    // Crear un nuevo documento PDF
    const pdf = await PDFDocument.create();
    
    // Leer y convertir la imagen usando Sharp (soporta múltiples formatos)
    let imagenBuffer;
    let esPng = false;
    
    try {
      // Usar Sharp para convertir cualquier formato de imagen a PNG o JPEG
      const extension = path.extname(rutaImagen).toLowerCase();
      
      // Para formatos que Sharp puede convertir directamente
      const imagenSharp = sharp(rutaImagen);
      const metadata = await imagenSharp.metadata();
      
      // Convertir a PNG para mejor compatibilidad (soporta transparencia)
      // O JPEG si es más eficiente para fotos
      if (extension === '.jpg' || extension === '.jpeg' || 
          metadata.format === 'jpeg' || metadata.format === 'jpg') {
        // Si ya es JPEG, mantenerlo como JPEG
        imagenBuffer = await imagenSharp.jpeg({ quality: 95 }).toBuffer();
        esPng = false;
      } else {
        // Para otros formatos (PNG, GIF, BMP, TIFF, WEBP, etc.), convertir a PNG
        imagenBuffer = await imagenSharp.png({ quality: 100 }).toBuffer();
        esPng = true;
      }
    } catch (error) {
      // Si Sharp falla, intentar leer directamente (para PNG/JPEG nativos)
      try {
        imagenBuffer = fs.readFileSync(rutaImagen);
        const extension = rutaImagen.toLowerCase();
        esPng = extension.endsWith('.png');
      } catch (readError) {
        throw new Error(`Error al procesar la imagen: ${error.message}. Formato no soportado.`);
      }
    }
    
    // Embed la imagen en el PDF
    let imagenEmbed;
    if (esPng) {
      imagenEmbed = await pdf.embedPng(imagenBuffer);
    } else {
      imagenEmbed = await pdf.embedJpg(imagenBuffer);
    }
    
    // Obtener dimensiones originales de la imagen
    const { width: imagenWidth, height: imagenHeight } = imagenEmbed.scale(1);
    
    // Crear una página A4
    const pagina = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    
    // Calcular el área disponible (A4 menos márgenes)
    const anchoDisponible = A4_WIDTH - (margen * 2);
    const altoDisponible = A4_HEIGHT - (margen * 2);
    
    // Calcular dimensiones de la imagen escalada
    let anchoFinal, altoFinal;
    
    if (mantenerProporcion) {
      // Calcular escala para que la imagen quepa en el área disponible
      const escalaAncho = anchoDisponible / imagenWidth;
      const escalaAlto = altoDisponible / imagenHeight;
      const escala = Math.min(escalaAncho, escalaAlto); // Usar la escala más pequeña para que quepa
      
      anchoFinal = imagenWidth * escala;
      altoFinal = imagenHeight * escala;
    } else {
      // Estirar la imagen para llenar el área disponible
      anchoFinal = anchoDisponible;
      altoFinal = altoDisponible;
    }
    
    // Calcular posición (centrar si está habilitado)
    let x, y;
    
    if (centrar) {
      x = (A4_WIDTH - anchoFinal) / 2;
      y = (A4_HEIGHT - altoFinal) / 2;
    } else {
      x = margen;
      y = margen;
    }
    
    // Dibujar la imagen en la página A4
    pagina.drawImage(imagenEmbed, {
      x: x,
      y: y,
      width: anchoFinal,
      height: altoFinal,
    });
    
    // Guardar el PDF
    const pdfBytes = await pdf.save();
    
    // Si se especificó una ruta de salida, guardar el archivo
    if (rutaSalida) {
      fs.writeFileSync(rutaSalida, pdfBytes);
    }
    
    return pdfBytes;
  } catch (error) {
    console.error(`Error al convertir imagen a PDF (${rutaImagen}):`, error.message);
    throw error;
  }
}

/**
 * Convierte múltiples imágenes a PDFs temporales
 * @param {string[]} rutasImagenes - Array con las rutas de las imágenes
 * @param {string} directorioTemp - Directorio temporal donde guardar los PDFs
 * @returns {Promise<string[]>} - Array con las rutas de los PDFs generados
 */
async function convertirImagenesAPdfs(rutasImagenes, directorioTemp) {
  const rutasPdfs = [];
  
  for (let i = 0; i < rutasImagenes.length; i++) {
    const rutaImagen = rutasImagenes[i];
    const nombreBase = `temp_imagen_${Date.now()}_${i}.pdf`;
    const rutaPdf = require('path').join(directorioTemp, nombreBase);
    
    await convertirImagenAPdf(rutaImagen, rutaPdf);
    rutasPdfs.push(rutaPdf);
  }
  
  return rutasPdfs;
}

module.exports = {
  convertirImagenAPdf,
  convertirImagenesAPdfs
};
