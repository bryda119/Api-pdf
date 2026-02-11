# 📄 API para Unir PDFs e Imágenes

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

API REST desarrollada con Node.js y Express que permite unir múltiples archivos PDF e imágenes (PNG, JPEG) en un solo documento PDF. Incluye documentación interactiva con Swagger para facilitar las pruebas y el uso de la API.

## 👨‍💻 Creador

**Desarrollado por:** Tlgo. Brayan Cangas Vásquez  
**Fecha de creación:** Febrero 2026  
**Versión:** 1.0.0

## 🎯 ¿Para qué sirve?

Esta API REST está diseñada para **simplificar y automatizar la gestión de documentos digitales**, permitiendo combinar múltiples archivos PDF e imágenes en un solo documento de manera eficiente y programática.

### Funcionalidades principales:

- **Combinar múltiples PDFs** en un solo documento manteniendo todas las páginas
- **Convertir imágenes a PDF** automáticamente en formato A4 (PNG, JPEG)
- **Mezclar PDFs e imágenes** en un solo archivo en cualquier orden
- **Automatizar la creación de documentos** combinados desde aplicaciones web, móviles o sistemas empresariales
- **Procesar documentos** de forma programática mediante una API REST estándar
- **Optimizar flujos de trabajo** documentales sin necesidad de herramientas manuales

### Casos de uso específicos:

- 📑 **Gestión documental**: Combinar reportes, facturas, contratos o documentos administrativos
- 🖼️ **Digitalización**: Crear documentos PDF a partir de imágenes escaneadas o fotografías
- 📊 **Archivos compuestos**: Unir documentos escaneados con imágenes adicionales, gráficos o diagramas
- 📝 **Generación automática**: Crear documentos compuestos desde aplicaciones web o sistemas ERP
- 🔄 **Automatización**: Integrar en pipelines de procesamiento documental
- 📋 **Archivado**: Consolidar múltiples documentos en un solo archivo para facilitar el almacenamiento
- 🎓 **Educación**: Combinar materiales educativos, presentaciones y recursos visuales
- 🏥 **Salud**: Unir historiales médicos, resultados de exámenes e imágenes diagnósticas
- ⚖️ **Legal**: Consolidar expedientes, evidencias y documentos legales
- 🏢 **Empresarial**: Crear informes ejecutivos combinando datos, gráficos y documentos

## 🎯 Público Objetivo

Esta API está diseñada para ser utilizada por:

### 👥 Desarrolladores y Técnicos
- **Desarrolladores de software** que necesitan integrar funcionalidad de unión de PDFs en sus aplicaciones
- **Ingenieros de sistemas** que buscan automatizar procesos documentales
- **Arquitectos de software** que diseñan sistemas de gestión documental
- **Equipos de DevOps** que implementan pipelines de procesamiento de documentos

### 🏢 Empresas y Organizaciones
- **Pequeñas y medianas empresas (PYMES)** que necesitan procesar documentos de forma eficiente
- **Grandes corporaciones** con necesidades de automatización documental
- **Startups** que requieren funcionalidades de gestión de documentos sin grandes inversiones
- **Empresas de servicios** que manejan grandes volúmenes de documentos

### 🏛️ Instituciones y Sector Público

Esta API es especialmente útil para:

#### 📚 **Instituciones Educativas**
- Universidades y colegios para combinar materiales académicos
- Bibliotecas digitales para crear compilaciones de documentos
- Plataformas educativas online (e-learning)
- Sistemas de gestión académica

#### 🏥 **Instituciones de Salud**
- Hospitales y clínicas para consolidar historiales médicos
- Laboratorios clínicos para unir resultados de exámenes
- Sistemas de telemedicina
- Archivos médicos electrónicos

#### ⚖️ **Instituciones Legales y Gubernamentales**
- Despachos jurídicos para consolidar expedientes
- Tribunales y cortes para archivar casos
- Notarías para combinar documentos legales
- Organismos gubernamentales para gestión documental pública

#### 🏦 **Instituciones Financieras**
- Bancos para consolidar estados de cuenta y documentos
- Compañías de seguros para unir pólizas y documentos
- Entidades financieras para reportes y documentación

#### 🏭 **Sector Industrial y Comercial**
- Empresas manufactureras para documentación técnica
- Comercios para facturación y documentación comercial
- Empresas de logística para consolidar documentos de envío

### 🌐 Aplicaciones y Plataformas
- **Aplicaciones web** que requieren funcionalidad de PDF
- **Aplicaciones móviles** (iOS/Android) que necesitan procesar documentos
- **Sistemas ERP/CRM** que requieren gestión documental
- **Plataformas SaaS** que ofrecen servicios de documentos
- **Sistemas de gestión de contenido (CMS)**

### 📊 Beneficios para cada público:

- **Para desarrolladores**: API simple, bien documentada, fácil de integrar
- **Para empresas**: Ahorro de tiempo, automatización, reducción de costos operativos
- **Para instituciones**: Eficiencia en gestión documental, cumplimiento normativo, mejor organización
- **Para aplicaciones**: Funcionalidad lista para usar, sin necesidad de desarrollar desde cero

## ✨ Características Principales

- ✅ **API REST** con Express.js
- ✅ **Documentación interactiva** con Swagger UI
- ✅ **Unión de múltiples PDFs** preservando todas las páginas
- ✅ **Conversión automática de imágenes** (PNG, JPEG) a PDF en formato A4
- ✅ **Mezcla de PDFs e imágenes** en una sola solicitud
- ✅ **Escalado inteligente**: Las imágenes se ajustan a A4 manteniendo su proporción
- ✅ **Centrado automático** de imágenes en páginas A4
- ✅ **Validación de archivos** antes de procesar
- ✅ **Manejo robusto de errores**
- ✅ **Limpieza automática** de archivos temporales
- ✅ **Soporte CORS** para peticiones cross-origin

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución JavaScript
- **Express.js** - Framework web para Node.js
- **pdf-lib** - Biblioteca para manipulación de PDFs
- **Multer** - Middleware para manejo de archivos multipart/form-data
- **Swagger/OpenAPI** - Documentación interactiva de la API
- **CORS** - Soporte para peticiones cross-origin
- **Sharp** - Procesamiento de imágenes (opcional)

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 12 o superior) - [Descargar Node.js](https://nodejs.org/)
- **npm** (viene incluido con Node.js)
- **Git** (opcional, para clonar el repositorio)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/bryda119/Api-pdf.git
cd Api-pdf
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias listadas en `package.json`.

### 3. Iniciar el servidor

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000` por defecto.

Para cambiar el puerto, puedes usar una variable de entorno:

```bash
PORT=8080 npm start
```

## 💻 Uso

### Interfaz Web con Swagger (Recomendado)

La forma más fácil de probar la API es usando la documentación interactiva de Swagger:

1. **Inicia el servidor**:
   ```bash
   npm start
   ```

2. **Abre tu navegador** en:
   ```
   http://localhost:3000/api-docs
   ```

3. **En la interfaz de Swagger**:
   - Expande el endpoint `POST /api/unir-pdfs`
   - Haz clic en **"Try it out"**
   - Selecciona múltiples archivos PDF o imágenes (mínimo 2, máximo 10)
   - Opcionalmente, especifica un nombre para el archivo de salida
   - Haz clic en **"Execute"**
   - Descarga el PDF unido directamente

### Desde la Línea de Comandos

También puedes usar el script de Node.js directamente:

```bash
# Unir múltiples PDFs
node unir-pdfs.js archivo1.pdf archivo2.pdf archivo3.pdf

# Especificar nombre de salida
node unir-pdfs.js archivo1.pdf archivo2.pdf --output resultado.pdf
```

### Usando cURL

```bash
# Unir PDFs
curl -X POST "http://localhost:3000/api/unir-pdfs" \
  -F "archivos=@archivo1.pdf" \
  -F "archivos=@archivo2.pdf" \
  -F "archivos=@archivo3.pdf" \
  -F "nombreSalida=resultado.pdf" \
  --output resultado.pdf

# Unir PDFs e imágenes
curl -X POST "http://localhost:3000/api/unir-pdfs" \
  -F "archivos=@documento.pdf" \
  -F "archivos=@imagen1.png" \
  -F "archivos=@imagen2.jpg" \
  -F "nombreSalida=resultado.pdf" \
  --output resultado.pdf
```

### Usando JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('archivos', fileInput1.files[0]); // PDF o imagen
formData.append('archivos', fileInput2.files[0]); // PDF o imagen
formData.append('archivos', fileInput3.files[0]); // PDF o imagen
formData.append('nombreSalida', 'resultado.pdf');

fetch('http://localhost:3000/api/unir-pdfs', {
  method: 'POST',
  body: formData
})
.then(response => response.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resultado.pdf';
  a.click();
})
.catch(error => console.error('Error:', error));
```

### Usando Axios

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('archivos', fs.createReadStream('archivo1.pdf'));
formData.append('archivos', fs.createReadStream('imagen1.png'));
formData.append('nombreSalida', 'resultado.pdf');

axios.post('http://localhost:3000/api/unir-pdfs', formData, {
  headers: formData.getHeaders(),
  responseType: 'arraybuffer'
})
.then(response => {
  fs.writeFileSync('resultado.pdf', response.data);
  console.log('PDF creado exitosamente!');
})
.catch(error => console.error('Error:', error));
```

## 📁 Estructura del Proyecto

```
Api-pdf/
│
├── server.js                 # Servidor Express y endpoints de la API
├── unir-pdfs.js              # Función para unir PDFs (uso CLI)
├── convertir-imagen-pdf.js   # Función para convertir imágenes a PDF
├── package.json              # Dependencias y scripts del proyecto
├── README.md                 # Este archivo
├── .gitignore                # Archivos ignorados por Git
│
├── uploads/                  # Directorio temporal para archivos subidos (se crea automáticamente)
└── output/                   # Directorio para PDFs generados (se crea automáticamente)
```

## 🌐 Endpoints de la API

### `GET /`
Información general de la API.

**Respuesta:**
```json
{
  "mensaje": "API para Unir PDFs e Imágenes",
  "version": "1.0.0",
  "documentacion": "/api-docs",
  "endpoint": "/api/unir-pdfs",
  "formatosSoportados": ["PDF", "PNG", "JPEG", "JPG"]
}
```

### `GET /api-docs`
Documentación interactiva de Swagger UI.

### `POST /api/unir-pdfs`
Une múltiples archivos PDF e imágenes en un solo PDF.

**Parámetros:**
- `archivos` (multipart/form-data, requerido): Array de archivos PDF o imágenes (mínimo 2, máximo 10)
- `nombreSalida` (string, opcional): Nombre del archivo PDF resultante (por defecto: "pdf-unido.pdf")

**Formatos soportados:**
- PDF: `application/pdf`
- Imágenes: `image/png`, `image/jpeg`, `image/jpg`

**Límites:**
- Tamaño máximo por archivo: 50MB
- Máximo de archivos por solicitud: 10
- Mínimo de archivos requeridos: 2

**Respuesta exitosa (200):**
- Content-Type: `application/pdf`
- El archivo PDF unido se envía directamente

**Errores:**
- `400`: Error en la solicitud (archivos inválidos, menos de 2 archivos, etc.)
- `500`: Error del servidor al procesar los archivos

### `GET /api/descargar/:nombreArchivo`
Descarga un PDF generado previamente.

**Parámetros:**
- `nombreArchivo` (path parameter): Nombre del archivo PDF a descargar

## 📝 Características Detalladas

### Conversión de Imágenes a PDF

Cuando subes una imagen (PNG o JPEG), la API:

1. **Convierte la imagen a PDF** en formato A4 (210mm x 297mm)
2. **Escala la imagen** para que quepa en la página manteniendo su proporción original
3. **Centra la imagen** en la página A4
4. **Preserva la calidad** de la imagen original

### Unión de Archivos

- Los PDFs se unen preservando todas sus páginas en el orden en que se suben
- Las imágenes convertidas se agregan como páginas individuales
- Puedes mezclar PDFs e imágenes en cualquier orden
- El resultado es un único PDF con todo el contenido combinado

## ⚙️ Configuración

### Variables de Entorno

Puedes configurar el puerto del servidor usando la variable de entorno `PORT`:

```bash
PORT=8080 npm start
```

### Límites Configurables

Los límites actuales están definidos en `server.js`:

- **Tamaño máximo por archivo**: 50MB (línea 42)
- **Máximo de archivos**: 10 (línea 170)
- **Mínimo de archivos**: 2 (validación en el código)

Puedes modificar estos valores según tus necesidades.

## 🐛 Solución de Problemas

### El puerto 3000 ya está en uso

```bash
# En Windows (PowerShell)
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# En Linux/Mac
lsof -ti:3000 | xargs kill -9

# O simplemente usa otro puerto
PORT=8080 npm start
```

### Error al instalar dependencias

Asegúrate de tener Node.js 12 o superior:

```bash
node --version
```

Si es necesario, actualiza Node.js desde [nodejs.org](https://nodejs.org/).

### Error al procesar imágenes

Verifica que los archivos sean imágenes válidas en formato PNG o JPEG. Algunos archivos pueden tener extensión `.jpg` pero ser de otro formato.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Desarrollador

**Creador:** Tlgo. Brayan Cangas Vásquez  
**Fecha de creación:** Febrero 2026  
**Versión:** 1.0.0

Este proyecto fue desarrollado para facilitar la unión y conversión de documentos PDF e imágenes mediante una API REST simple, eficiente y fácil de usar. La solución está diseñada para ser accesible tanto para desarrolladores como para instituciones y empresas que necesitan automatizar procesos de gestión documental.

### Objetivo del Proyecto

El objetivo principal es proporcionar una herramienta robusta y fácil de integrar que permita:
- Automatizar la combinación de documentos PDF
- Convertir imágenes a formato PDF estándar (A4)
- Facilitar la gestión documental en diferentes sectores
- Reducir el tiempo y esfuerzo en procesos manuales de documentación
- Ofrecer una API REST bien documentada y fácil de usar

### Características desarrolladas:

- ✅ API REST completa con Express.js
- ✅ Integración con Swagger para documentación interactiva
- ✅ Conversión automática de imágenes a PDF en formato A4
- ✅ Unión inteligente de múltiples archivos
- ✅ Manejo robusto de errores y validación de archivos
- ✅ Limpieza automática de archivos temporales
- ✅ Soporte para múltiples formatos (PDF, PNG, JPEG)
- ✅ Escalado y centrado automático de imágenes
- ✅ Documentación completa y ejemplos de uso

### Contacto

Para consultas, sugerencias o colaboraciones relacionadas con este proyecto, puedes contactar al desarrollador a través del repositorio de GitHub:

**Repositorio:** [https://github.com/bryda119/Api-pdf](https://github.com/bryda119/Api-pdf)

## 📚 Recursos Adicionales

- [Documentación de Express.js](https://expressjs.com/)
- [Documentación de pdf-lib](https://pdf-lib.js.org/)
- [Documentación de Swagger/OpenAPI](https://swagger.io/docs/)
- [Guía de Multer](https://github.com/expressjs/multer)

## 🎉 Agradecimientos

- A la comunidad de Node.js por las excelentes herramientas
- A los desarrolladores de las librerías utilizadas
- A todos los contribuidores y usuarios del proyecto

---

**¿Tienes preguntas o sugerencias?** Abre un issue en el [repositorio](https://github.com/bryda119/Api-pdf) o contacta al desarrollador: **Tlgo. Brayan Cangas Vásquez**

**⭐ Si este proyecto te fue útil, considera darle una estrella en [GitHub](https://github.com/bryda119/Api-pdf)!**
