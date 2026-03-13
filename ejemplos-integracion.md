# 🔌 Ejemplos de Integración - API Unir PDFs

Este archivo contiene ejemplos prácticos para integrar la API en diferentes sistemas.

## 📋 Índice

- [JavaScript/Node.js](#javascriptnodejs)
- [Python](#python)
- [PHP](#php)
- [Java](#java)
- [C#](#c)
- [React](#react)
- [Vue.js](#vuejs)
- [Angular](#angular)

---

## JavaScript/Node.js

### Ejemplo Completo con Manejo de Errores

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class PdfMergerClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async unirPdfs(archivos, nombreSalida = 'resultado.pdf') {
    const formData = new FormData();
    
    // Agregar archivos
    archivos.forEach((rutaArchivo) => {
      if (!fs.existsSync(rutaArchivo)) {
        throw new Error(`Archivo no encontrado: ${rutaArchivo}`);
      }
      formData.append('archivos', fs.createReadStream(rutaArchivo));
    });
    
    formData.append('nombreSalida', nombreSalida);

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/unir-pdfs`,
        formData,
        {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer',
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      // Guardar el PDF
      const rutaSalida = path.join(process.cwd(), nombreSalida);
      fs.writeFileSync(rutaSalida, response.data);
      
      return {
        exito: true,
        archivo: rutaSalida,
        tamaño: response.data.length
      };
    } catch (error) {
      if (error.response) {
        // Error de la API
        const errorMessage = Buffer.from(error.response.data).toString('utf-8');
        return {
          exito: false,
          error: JSON.parse(errorMessage).error || 'Error desconocido'
        };
      }
      return {
        exito: false,
        error: error.message
      };
    }
  }

  async unirPdfsConInfo(archivos, nombreSalida = 'resultado.pdf') {
    const formData = new FormData();
    
    archivos.forEach((rutaArchivo) => {
      formData.append('archivos', fs.createReadStream(rutaArchivo));
    });
    formData.append('nombreSalida', nombreSalida);

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/unir-pdfs?formato=json`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );

      return {
        exito: true,
        ...response.data
      };
    } catch (error) {
      return {
        exito: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
}

// Uso
(async () => {
  const client = new PdfMergerClient();
  
  const resultado = await client.unirPdfs([
    'archivo1.pdf',
    'imagen1.png',
    'imagen2.jpg'
  ], 'documento-final.pdf');
  
  if (resultado.exito) {
    console.log(`✅ PDF creado: ${resultado.archivo}`);
    console.log(`📊 Tamaño: ${resultado.tamaño} bytes`);
  } else {
    console.error(`❌ Error: ${resultado.error}`);
  }
})();
```

---

## Python

### Clase Cliente Completa

```python
import requests
from typing import List, Dict, Optional
import os

class PdfMergerClient:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
    
    def unir_pdfs(
        self, 
        archivos: List[str], 
        nombre_salida: str = "resultado.pdf"
    ) -> Dict:
        """
        Une múltiples PDFs e imágenes y descarga el resultado.
        
        Args:
            archivos: Lista de rutas de archivos a unir
            nombre_salida: Nombre del archivo PDF resultante
            
        Returns:
            Dict con 'exito', 'archivo', 'tamaño' o 'error'
        """
        url = f"{self.base_url}/api/unir-pdfs"
        
        # Verificar que los archivos existan
        for archivo in archivos:
            if not os.path.exists(archivo):
                return {
                    "exito": False,
                    "error": f"Archivo no encontrado: {archivo}"
                }
        
        # Preparar archivos
        files = []
        for archivo in archivos:
            mime_type = self._detectar_mime_type(archivo)
            files.append(
                ('archivos', (os.path.basename(archivo), 
                             open(archivo, 'rb'), 
                             mime_type))
            )
        
        data = {'nombreSalida': nombre_salida}
        
        try:
            response = requests.post(url, files=files, data=data, timeout=300)
            response.raise_for_status()
            
            # Guardar el PDF
            with open(nombre_salida, 'wb') as f:
                f.write(response.content)
            
            return {
                "exito": True,
                "archivo": nombre_salida,
                "tamaño": len(response.content)
            }
        except requests.exceptions.RequestException as e:
            return {
                "exito": False,
                "error": str(e)
            }
        finally:
            # Cerrar archivos
            for _, file_tuple in files:
                file_tuple[1].close()
    
    def unir_pdfs_con_info(
        self, 
        archivos: List[str], 
        nombre_salida: str = "resultado.pdf"
    ) -> Dict:
        """Obtiene información del PDF antes de descargarlo."""
        url = f"{self.base_url}/api/unir-pdfs?formato=json"
        
        files = []
        for archivo in archivos:
            mime_type = self._detectar_mime_type(archivo)
            files.append(
                ('archivos', (os.path.basename(archivo), 
                             open(archivo, 'rb'), 
                             mime_type))
            )
        
        data = {'nombreSalida': nombre_salida}
        
        try:
            response = requests.post(url, files=files, data=data)
            response.raise_for_status()
            return {
                "exito": True,
                **response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                "exito": False,
                "error": str(e)
            }
        finally:
            for _, file_tuple in files:
                file_tuple[1].close()
    
    def _detectar_mime_type(self, archivo: str) -> str:
        """Detecta el tipo MIME del archivo."""
        extension = os.path.splitext(archivo)[1].lower()
        mime_types = {
            '.pdf': 'application/pdf',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp',
            '.tiff': 'image/tiff',
            '.tif': 'image/tiff',
        }
        return mime_types.get(extension, 'application/octet-stream')

# Uso
if __name__ == "__main__":
    client = PdfMergerClient()
    
    resultado = client.unir_pdfs([
        'archivo1.pdf',
        'imagen1.png',
        'imagen2.jpg'
    ], 'documento-final.pdf')
    
    if resultado["exito"]:
        print(f"✅ PDF creado: {resultado['archivo']}")
        print(f"📊 Tamaño: {resultado['tamaño']} bytes")
    else:
        print(f"❌ Error: {resultado['error']}")
```

---

## React (Hook Personalizado)

```jsx
import { useState } from 'react';

export const usePdfMerger = (apiUrl = 'http://localhost:3000') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unirPdfs = async (files, nombreSalida = 'resultado.pdf') => {
    setLoading(true);
    setError(null);

    if (!files || files.length < 2) {
      setError('Debes seleccionar al menos 2 archivos');
      setLoading(false);
      return null;
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('archivos', file);
    });
    formData.append('nombreSalida', nombreSalida);

    try {
      const response = await fetch(`${apiUrl}/api/unir-pdfs`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar');
      }

      const blob = await response.blob();
      return blob;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const descargarPdf = (blob, nombreArchivo = 'resultado.pdf') => {
    if (!blob) return;
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return {
    unirPdfs,
    descargarPdf,
    loading,
    error
  };
};

// Uso en componente
function PdfMergerComponent() {
  const { unirPdfs, descargarPdf, loading, error } = usePdfMerger();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files);
    const blob = await unirPdfs(files, 'mi-documento.pdf');
    if (blob) {
      descargarPdf(blob, 'mi-documento.pdf');
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleSubmit}
        disabled={loading}
      />
      {loading && <p>Procesando...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}
```

---

## Notas Importantes

### Manejo de Errores

Siempre incluye manejo de errores en tus integraciones:

```javascript
try {
  // Tu código de integración
} catch (error) {
  if (error.response) {
    // Error de la API (400, 500, etc.)
    console.error('Error de API:', error.response.data);
  } else if (error.request) {
    // Error de red
    console.error('Error de red:', error.message);
  } else {
    // Otro error
    console.error('Error:', error.message);
  }
}
```

### Límites y Restricciones

- **Máximo de archivos**: 10 por solicitud
- **Mínimo de archivos**: 2 por solicitud
- **Tamaño máximo por archivo**: 50MB
- **Timeout recomendado**: 5 minutos para archivos grandes

### Variables de Entorno

Para producción, usa variables de entorno:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

```python
import os
API_URL = os.getenv('API_URL', 'http://localhost:3000')
```
