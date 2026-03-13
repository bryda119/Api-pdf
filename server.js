const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const { unirPdfs } = require('./unir-pdfs');
const { convertirImagenesAPdfs } = require('./convertir-imagen-pdf');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Crear directorio para archivos temporales si no existe
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

[uploadsDir, outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Tipos MIME permitidos - Todos los formatos de imagen comunes
const tiposPermitidos = {
  'application/pdf': true,
  // Formatos de imagen comunes
  'image/png': true,
  'image/jpeg': true,
  'image/jpg': true,
  'image/gif': true,
  'image/bmp': true,
  'image/webp': true,
  'image/tiff': true,
  'image/tif': true,
  'image/x-icon': true,
  'image/vnd.microsoft.icon': true,
  'image/svg+xml': true,
  'image/heic': true,
  'image/heif': true,
  'image/avif': true,
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo por archivo
  },
  fileFilter: (req, file, cb) => {
    // Verificar por MIME type
    if (tiposPermitidos[file.mimetype]) {
      cb(null, true);
    } else {
      // También verificar por extensión como respaldo
      const extension = require('path').extname(file.originalname).toLowerCase();
      const extensionesPermitidas = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.ico', '.svg', '.heic', '.heif', '.avif'];
      
      if (extensionesPermitidas.includes(extension)) {
        cb(null, true);
      } else {
        cb(new Error(`Formato no soportado: ${file.mimetype || extension}. Formatos permitidos: PDF, PNG, JPEG, GIF, BMP, WEBP, TIFF, ICO, SVG, HEIC, HEIF, AVIF`), false);
      }
    }
  }
});

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API para Unir PDFs e Imágenes',
      version: '1.0.0',
      description: 'API REST para unir múltiples archivos PDF e imágenes en un solo PDF. Soporta todos los formatos de imagen comunes (PNG, JPEG, GIF, BMP, WEBP, TIFF, ICO, SVG, HEIC, HEIF, AVIF). Las imágenes se convierten automáticamente a PDF en formato A4 (escaladas y centradas manteniendo su proporción) antes de unirse.',
      contact: {
        name: 'Soporte API',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo',
      },
    ],
    tags: [
      {
        name: 'PDFs',
        description: 'Endpoints para operaciones con PDFs',
      },
    ],
  },
  apis: ['./server.js'], // Archivos donde están las anotaciones
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Servir Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Unir PDFs - Documentación'
}));

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API para Unir PDFs e Imágenes',
    version: '1.0.0',
    documentacion: '/api-docs',
    endpoint: '/api/unir-pdfs',
    formatosSoportados: ['PDF', 'PNG', 'JPEG', 'JPG', 'GIF', 'BMP', 'WEBP', 'TIFF', 'ICO', 'SVG', 'HEIC', 'HEIF', 'AVIF']
  });
});

/**
 * @swagger
 * /api/unir-pdfs:
 *   post:
 *     summary: Une múltiples archivos PDF e imágenes en uno solo
 *     description: Sube varios archivos PDF e imágenes (PNG, JPEG, GIF, BMP, WEBP, TIFF, ICO, SVG, HEIC, HEIF, AVIF) y recibe un único archivo PDF combinado. Las imágenes se convierten automáticamente a PDF en formato A4 (escaladas y centradas) antes de unirse.
 *     tags: [PDFs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - archivos
 *             properties:
 *               archivos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Archivos PDF o imágenes (PNG, JPEG, GIF, BMP, WEBP, TIFF, ICO, SVG, HEIC, HEIF, AVIF) a unir (mínimo 2, máximo 10)
 *               nombreSalida:
 *                 type: string
 *                 description: Nombre del archivo PDF resultante (opcional, por defecto "pdf-unido.pdf")
 *                 example: "documento-final.pdf"
 *     responses:
 *       200:
 *         description: PDFs unidos exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "PDFs unidos exitosamente"
 *                 archivo:
 *                   type: string
 *                   example: "pdf-unido.pdf"
 *                 totalPaginas:
 *                   type: number
 *                   example: 15
 *                 urlDescarga:
 *                   type: string
 *                   example: "/api/descargar/pdf-unido.pdf"
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Debes subir al menos 2 archivos (PDF o imágenes)"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al procesar los PDFs"
 */
app.post('/api/unir-pdfs', upload.any(), async (req, res) => {
  const pdfsTemporales = []; // Para limpiar PDFs generados de imágenes
  
  try {
    // Filtrar solo los archivos (pueden venir como 'archivos', 'archivos[0]', 'archivos[1]', etc.)
    const archivosSubidos = req.files.filter(file => {
      // Aceptar campos que empiecen con 'archivos' (con o sin índices)
      return file.fieldname === 'archivos' || file.fieldname.startsWith('archivos[');
    });
    
    // Validar que se hayan subido archivos
    if (!archivosSubidos || archivosSubidos.length === 0) {
      return res.status(400).json({
        error: 'No se han subido archivos'
      });
    }

    // Validar que haya al menos 2 archivos
    if (archivosSubidos.length < 2) {
      // Limpiar archivos subidos
      archivosSubidos.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({
        error: 'Debes subir al menos 2 archivos (PDF o imágenes) para unir'
      });
    }

    // Separar PDFs e imágenes
    const archivosPdf = [];
    const archivosImagen = [];
    
    archivosSubidos.forEach(file => {
      if (file.mimetype === 'application/pdf') {
        archivosPdf.push(file.path);
      } else if (file.mimetype.startsWith('image/')) {
        archivosImagen.push(file.path);
      }
    });

    // Convertir imágenes a PDFs temporales
    if (archivosImagen.length > 0) {
      console.log(`Convirtiendo ${archivosImagen.length} imagen(es) a PDF...`);
      const pdfsDeImagenes = await convertirImagenesAPdfs(archivosImagen, uploadsDir);
      pdfsTemporales.push(...pdfsDeImagenes);
      archivosPdf.push(...pdfsDeImagenes);
    }

    // Obtener nombre de salida
    const nombreSalida = req.body.nombreSalida || 'pdf-unido.pdf';
    const nombreSalidaFinal = nombreSalida.endsWith('.pdf') 
      ? nombreSalida 
      : nombreSalida + '.pdf';
    
    const rutaSalida = path.join(outputDir, nombreSalidaFinal);

    // Unir los PDFs (incluyendo los generados de imágenes)
    await unirPdfs(archivosPdf, rutaSalida);

    // Limpiar archivos temporales subidos (imágenes originales)
    archivosSubidos.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    
    // Limpiar PDFs temporales generados de imágenes
    pdfsTemporales.forEach(rutaPdf => {
      if (fs.existsSync(rutaPdf)) {
        fs.unlinkSync(rutaPdf);
      }
    });

    // Leer el archivo unido para enviarlo
    const pdfUnido = fs.readFileSync(rutaSalida);
    const totalPaginas = await obtenerTotalPaginas(rutaSalida);

    // Enviar respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreSalidaFinal}"`);
    
    // Opción 1: Enviar el PDF directamente
    if (req.query.formato === 'json') {
      // Opción 2: Enviar JSON con información y URL de descarga
      res.json({
        mensaje: 'PDFs unidos exitosamente',
        archivo: nombreSalidaFinal,
        totalPaginas: totalPaginas,
        urlDescarga: `/api/descargar/${nombreSalidaFinal}`,
        tamaño: pdfUnido.length
      });
    } else {
      res.send(pdfUnido);
    }

  } catch (error) {
    console.error('Error al unir PDFs e imágenes:', error);
    
    // Limpiar archivos en caso de error
    if (req.files && req.files.length > 0) {
      const archivosSubidos = req.files.filter(file => 
        file.fieldname === 'archivos' || file.fieldname.startsWith('archivos[')
      );
      archivosSubidos.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    // Limpiar PDFs temporales generados de imágenes
    pdfsTemporales.forEach(rutaPdf => {
      if (fs.existsSync(rutaPdf)) {
        fs.unlinkSync(rutaPdf);
      }
    });

    res.status(500).json({
      error: 'Error al procesar los archivos',
      detalle: error.message
    });
  }
});

/**
 * @swagger
 * /api/descargar/{nombreArchivo}:
 *   get:
 *     summary: Descarga un PDF unido previamente
 *     description: Descarga un archivo PDF que fue generado anteriormente
 *     tags: [PDFs]
 *     parameters:
 *       - in: path
 *         name: nombreArchivo
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del archivo PDF a descargar
 *     responses:
 *       200:
 *         description: Archivo PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Archivo no encontrado
 */
app.get('/api/descargar/:nombreArchivo', (req, res) => {
  const nombreArchivo = req.params.nombreArchivo;
  const rutaArchivo = path.join(outputDir, nombreArchivo);

  if (!fs.existsSync(rutaArchivo)) {
    return res.status(404).json({
      error: 'Archivo no encontrado'
    });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
  res.sendFile(path.resolve(rutaArchivo));
});

// Función auxiliar para obtener el total de páginas
async function obtenerTotalPaginas(rutaPdf) {
  try {
    const { PDFDocument } = require('pdf-lib');
    const bytes = fs.readFileSync(rutaPdf);
    const pdf = await PDFDocument.load(bytes);
    return pdf.getPageCount();
  } catch (error) {
    return 0;
  }
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`📄 Endpoint API: http://localhost:${PORT}/api/unir-pdfs`);
});
