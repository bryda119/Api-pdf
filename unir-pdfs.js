const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Une múltiples archivos PDF en uno solo
 * @param {string[]} archivosPdf - Array con las rutas de los archivos PDF a unir
 * @param {string} nombreSalida - Nombre del archivo PDF resultante
 */
async function unirPdfs(archivosPdf, nombreSalida = 'pdf-unido.pdf') {
  try {
    // Crear un nuevo documento PDF
    const pdfUnido = await PDFDocument.create();

    // Procesar cada archivo PDF
    for (const archivo of archivosPdf) {
      console.log(`Procesando: ${archivo}...`);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(archivo)) {
        console.warn(`⚠️  El archivo ${archivo} no existe. Se omitirá.`);
        continue;
      }

      // Leer el archivo PDF
      const bytesPdf = fs.readFileSync(archivo);
      
      // Cargar el PDF
      const pdf = await PDFDocument.load(bytesPdf);
      
      // Copiar todas las páginas del PDF al documento unido
      const paginas = await pdfUnido.copyPages(pdf, pdf.getPageIndices());
      
      paginas.forEach((pagina) => {
        pdfUnido.addPage(pagina);
      });
      
      console.log(`✓ ${archivo} agregado (${pdf.getPageCount()} páginas)`);
    }

    // Guardar el PDF unido
    const pdfBytes = await pdfUnido.save();
    fs.writeFileSync(nombreSalida, pdfBytes);
    
    console.log(`\n✅ PDFs unidos exitosamente!`);
    console.log(`📄 Archivo creado: ${nombreSalida}`);
    console.log(`📊 Total de páginas: ${pdfUnido.getPageCount()}`);
    
    return nombreSalida;
  } catch (error) {
    console.error('❌ Error al unir los PDFs:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  // Obtener argumentos de la línea de comandos
  const argumentos = process.argv.slice(2);
  
  if (argumentos.length === 0) {
    console.log('📚 Unir PDFs con Node.js\n');
    console.log('Uso:');
    console.log('  node unir-pdfs.js archivo1.pdf archivo2.pdf [archivo3.pdf ...] [--output nombre-salida.pdf]');
    console.log('\nEjemplo:');
    console.log('  node unir-pdfs.js documento1.pdf documento2.pdf documento3.pdf');
    console.log('  node unir-pdfs.js doc1.pdf doc2.pdf --output resultado.pdf');
    console.log('\nO usa la función directamente en el código.');
    
    // Ejemplo de uso programático (descomentar para probar)
    /*
    const archivos = [
      'ejemplo1.pdf',
      'ejemplo2.pdf',
      'ejemplo3.pdf'
    ];
    await unirPdfs(archivos, 'resultado.pdf');
    */
    return;
  }

  // Separar archivos PDF y opciones
  const archivosPdf = [];
  let nombreSalida = 'pdf-unido.pdf';
  
  for (let i = 0; i < argumentos.length; i++) {
    if (argumentos[i] === '--output' || argumentos[i] === '-o') {
      nombreSalida = argumentos[i + 1] || 'pdf-unido.pdf';
      i++; // Saltar el siguiente argumento (el nombre del archivo)
    } else {
      archivosPdf.push(argumentos[i]);
    }
  }

  if (archivosPdf.length === 0) {
    console.error('❌ Error: Debes especificar al menos un archivo PDF para unir.');
    process.exit(1);
  }

  await unirPdfs(archivosPdf, nombreSalida);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
}

// Exportar la función para uso en otros módulos
module.exports = { unirPdfs };
