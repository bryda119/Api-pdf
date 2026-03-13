# 🔌 Integración con PHP - API Unir PDFs

Guía completa para integrar la API de unión de PDFs e imágenes en aplicaciones PHP.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Ejemplos Básicos](#ejemplos-básicos)
- [Clase Cliente Completa](#clase-cliente-completa)
- [Integración con Frameworks](#integración-con-frameworks)
- [Manejo de Errores](#manejo-de-errores)
- [Casos de Uso Avanzados](#casos-de-uso-avanzados)

---

## ⚠️ Error Común: "CURLFile could not be converted to string"

**Si estás obteniendo este error**, es porque estás usando un array anidado con objetos CURLFile. 

**Solución**: Usa índices numéricos en el nombre del campo:

```php
// ❌ INCORRECTO - Causa el error
$postData['archivos'][] = new CURLFile(...);

// ✅ CORRECTO - Usa índices en el nombre
$postData["archivos[0]"] = new CURLFile(...);
$postData["archivos[1]"] = new CURLFile(...);
```

Ver la sección [Solución de Problemas](#solución-de-problemas) para más detalles.

---

## Requisitos

- PHP 7.4 o superior
- Extensión `curl` habilitada
- Extensión `json` habilitada
- (Opcional) Composer para gestionar dependencias

### Verificar Extensiones

```php
<?php
// Verificar que las extensiones estén habilitadas
if (!extension_loaded('curl')) {
    die('La extensión cURL no está habilitada');
}

if (!extension_loaded('json')) {
    die('La extensión JSON no está habilitada');
}

echo "✅ Todas las extensiones están disponibles\n";
?>
```

---

## Instalación

### Opción 1: Sin Composer (PHP Nativo)

No requiere instalación adicional, solo usar las funciones nativas de PHP.

### Opción 2: Con Composer (Recomendado)

```bash
composer require guzzlehttp/guzzle
```

O agregar en `composer.json`:

```json
{
    "require": {
        "guzzlehttp/guzzle": "^7.0"
    }
}
```

---

## Ejemplos Básicos

### Ejemplo 1: Unir PDFs con cURL (PHP Nativo)

```php
<?php
/**
 * Une múltiples PDFs e imágenes usando cURL
 * 
 * @param array $archivos Rutas de los archivos a unir
 * @param string $nombreSalida Nombre del archivo PDF resultante
 * @param string $apiUrl URL de la API
 * @return array Resultado con 'exito', 'archivo', 'tamaño' o 'error'
 */
function unirPdfs($archivos, $nombreSalida = 'resultado.pdf', $apiUrl = 'http://localhost:3000') {
    $url = $apiUrl . '/api/unir-pdfs';
    
    // Verificar que los archivos existan
    foreach ($archivos as $archivo) {
        if (!file_exists($archivo)) {
            return [
                'exito' => false,
                'error' => "Archivo no encontrado: $archivo"
            ];
        }
    }
    
    // Preparar archivos para CURLFile
    // IMPORTANTE: Usar índices numéricos para evitar error de conversión
    $postData = [];
    foreach ($archivos as $index => $archivo) {
        $mimeType = mime_content_type($archivo);
        // Usar índice en el nombre del campo: "archivos[0]", "archivos[1]", etc.
        $postData["archivos[{$index}]"] = new CURLFile(
            realpath($archivo),
            $mimeType,
            basename($archivo)
        );
    }
    $postData['nombreSalida'] = $nombreSalida;
    
    // Inicializar cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 300); // 5 minutos timeout
    
    // Ejecutar petición
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    // Manejar respuesta
    if ($error) {
        return [
            'exito' => false,
            'error' => "Error de cURL: $error"
        ];
    }
    
    if ($httpCode === 200) {
        // Guardar el PDF
        file_put_contents($nombreSalida, $response);
        return [
            'exito' => true,
            'archivo' => $nombreSalida,
            'tamaño' => strlen($response)
        ];
    } else {
        // Error de la API
        $errorData = json_decode($response, true);
        return [
            'exito' => false,
            'error' => $errorData['error'] ?? "Error HTTP $httpCode"
        ];
    }
}

// Uso
$resultado = unirPdfs([
    'archivo1.pdf',
    'imagen1.png',
    'imagen2.jpg'
], 'documento-final.pdf');

if ($resultado['exito']) {
    echo "✅ PDF creado: {$resultado['archivo']}\n";
    echo "📊 Tamaño: {$resultado['tamaño']} bytes\n";
} else {
    echo "❌ Error: {$resultado['error']}\n";
}
?>
```

### Ejemplo 2: Obtener Información JSON

```php
<?php
/**
 * Une PDFs y obtiene información en formato JSON
 */
function unirPdfsConInfo($archivos, $nombreSalida = 'resultado.pdf', $apiUrl = 'http://localhost:3000') {
    $url = $apiUrl . '/api/unir-pdfs?formato=json';
    
    // IMPORTANTE: Usar índices numéricos para múltiples archivos
    $postData = [];
    foreach ($archivos as $index => $archivo) {
        $mimeType = mime_content_type($archivo);
        // Usar índice en el nombre: "archivos[0]", "archivos[1]", etc.
        $postData["archivos[{$index}]"] = new CURLFile(
            realpath($archivo),
            $mimeType,
            basename($archivo)
        );
    }
    $postData['nombreSalida'] = $nombreSalida;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); // Array plano, no anidado
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 300);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        
        // Descargar el PDF usando la URL proporcionada
        $downloadUrl = $apiUrl . $data['urlDescarga'];
        $pdfContent = file_get_contents($downloadUrl);
        file_put_contents($data['archivo'], $pdfContent);
        
        return [
            'exito' => true,
            ...$data
        ];
    } else {
        $errorData = json_decode($response, true);
        return [
            'exito' => false,
            'error' => $errorData['error'] ?? "Error HTTP $httpCode"
        ];
    }
}

// Uso
$resultado = unirPdfsConInfo([
    'archivo1.pdf',
    'imagen1.png'
], 'mi-documento.pdf');

if ($resultado['exito']) {
    echo "✅ PDF: {$resultado['archivo']}\n";
    echo "📄 Páginas: {$resultado['totalPaginas']}\n";
    echo "📊 Tamaño: {$resultado['tamaño']} bytes\n";
}
?>
```

### Ejemplo 3: Con Guzzle HTTP (Composer)

```php
<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

function unirPdfsConGuzzle($archivos, $nombreSalida = 'resultado.pdf', $apiUrl = 'http://localhost:3000') {
    $client = new Client([
        'base_uri' => $apiUrl,
        'timeout' => 300.0
    ]);
    
    // Preparar multipart
    $multipart = [];
    foreach ($archivos as $archivo) {
        $multipart[] = [
            'name' => 'archivos',
            'contents' => fopen($archivo, 'r'),
            'filename' => basename($archivo)
        ];
    }
    $multipart[] = [
        'name' => 'nombreSalida',
        'contents' => $nombreSalida
    ];
    
    try {
        $response = $client->post('/api/unir-pdfs', [
            'multipart' => $multipart
        ]);
        
        // Guardar el PDF
        file_put_contents($nombreSalida, $response->getBody());
        
        return [
            'exito' => true,
            'archivo' => $nombreSalida,
            'tamaño' => $response->getBody()->getSize()
        ];
    } catch (GuzzleException $e) {
        return [
            'exito' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Uso
$resultado = unirPdfsConGuzzle([
    'archivo1.pdf',
    'imagen1.png'
], 'resultado.pdf');

if ($resultado['exito']) {
    echo "✅ PDF creado exitosamente!\n";
} else {
    echo "❌ Error: {$resultado['error']}\n";
}
?>
```

---

## Clase Cliente Completa

```php
<?php
/**
 * Cliente PHP para la API de Unión de PDFs
 * 
 * @author Tu Nombre
 * @version 1.0.0
 */
class PdfMergerClient {
    private $apiUrl;
    private $timeout;
    
    /**
     * Constructor
     * 
     * @param string $apiUrl URL base de la API
     * @param int $timeout Timeout en segundos (default: 300)
     */
    public function __construct($apiUrl = 'http://localhost:3000', $timeout = 300) {
        $this->apiUrl = rtrim($apiUrl, '/');
        $this->timeout = $timeout;
    }
    
    /**
     * Une múltiples PDFs e imágenes
     * 
     * @param array $archivos Array de rutas de archivos
     * @param string $nombreSalida Nombre del archivo resultante
     * @return array Resultado de la operación
     */
    public function unirPdfs($archivos, $nombreSalida = 'resultado.pdf') {
        // Validar archivos
        $validacion = $this->validarArchivos($archivos);
        if (!$validacion['valido']) {
            return [
                'exito' => false,
                'error' => $validacion['error']
            ];
        }
        
        // Preparar datos
        $postData = $this->prepararArchivos($archivos);
        $postData['nombreSalida'] = $nombreSalida;
        
        // Realizar petición
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->apiUrl . '/api/unir-pdfs');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Solo para desarrollo
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        // Manejar respuesta
        if ($error) {
            return [
                'exito' => false,
                'error' => "Error de conexión: $error"
            ];
        }
        
        if ($httpCode === 200) {
            // Guardar PDF
            $rutaCompleta = realpath('.') . '/' . $nombreSalida;
            file_put_contents($rutaCompleta, $response);
            
            return [
                'exito' => true,
                'archivo' => $rutaCompleta,
                'tamaño' => strlen($response),
                'tamañoFormateado' => $this->formatearTamaño(strlen($response))
            ];
        } else {
            $errorData = json_decode($response, true);
            return [
                'exito' => false,
                'error' => $errorData['error'] ?? "Error HTTP $httpCode",
                'codigo' => $httpCode
            ];
        }
    }
    
    /**
     * Une PDFs y obtiene información detallada
     * 
     * @param array $archivos Array de rutas de archivos
     * @param string $nombreSalida Nombre del archivo resultante
     * @return array Resultado con información detallada
     */
    public function unirPdfsConInfo($archivos, $nombreSalida = 'resultado.pdf') {
        $validacion = $this->validarArchivos($archivos);
        if (!$validacion['valido']) {
            return [
                'exito' => false,
                'error' => $validacion['error']
            ];
        }
        
        $postData = $this->prepararArchivos($archivos);
        $postData['nombreSalida'] = $nombreSalida;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->apiUrl . '/api/unir-pdfs?formato=json');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            
            // Descargar el PDF
            $downloadUrl = $this->apiUrl . $data['urlDescarga'];
            $pdfContent = file_get_contents($downloadUrl);
            file_put_contents($data['archivo'], $pdfContent);
            
            return [
                'exito' => true,
                ...$data
            ];
        } else {
            $errorData = json_decode($response, true);
            return [
                'exito' => false,
                'error' => $errorData['error'] ?? "Error HTTP $httpCode",
                'codigo' => $httpCode
            ];
        }
    }
    
    /**
     * Valida que los archivos existan y cumplan requisitos
     * 
     * @param array $archivos Array de rutas
     * @return array Resultado de validación
     */
    private function validarArchivos($archivos) {
        if (count($archivos) < 2) {
            return [
                'valido' => false,
                'error' => 'Debes proporcionar al menos 2 archivos'
            ];
        }
        
        if (count($archivos) > 10) {
            return [
                'valido' => false,
                'error' => 'Máximo 10 archivos permitidos'
            ];
        }
        
        foreach ($archivos as $archivo) {
            if (!file_exists($archivo)) {
                return [
                    'valido' => false,
                    'error' => "Archivo no encontrado: $archivo"
                ];
            }
            
            // Verificar tamaño (50MB máximo)
            if (filesize($archivo) > 50 * 1024 * 1024) {
                return [
                    'valido' => false,
                    'error' => "Archivo demasiado grande: $archivo (máximo 50MB)"
                ];
            }
        }
        
        return ['valido' => true];
    }
    
    /**
     * Prepara los archivos para la petición
     * IMPORTANTE: Usa índices numéricos para evitar el error "CURLFile could not be converted to string"
     * 
     * @param array $archivos Array de rutas
     * @return array Datos preparados para POST
     */
    private function prepararArchivos($archivos) {
        $postData = [];
        
        foreach ($archivos as $index => $archivo) {
            $mimeType = mime_content_type($archivo);
            if (!$mimeType) {
                $mimeType = $this->detectarMimeType($archivo);
            }
            
            // Usar índice numérico en el nombre del campo para evitar error de conversión
            $postData["archivos[{$index}]"] = new CURLFile(
                realpath($archivo),
                $mimeType,
                basename($archivo)
            );
        }
        
        return $postData;
    }
    
    /**
     * Detecta el tipo MIME por extensión
     * 
     * @param string $archivo Ruta del archivo
     * @return string Tipo MIME
     */
    private function detectarMimeType($archivo) {
        $extension = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));
        
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'bmp' => 'image/bmp',
            'webp' => 'image/webp',
            'tiff' => 'image/tiff',
            'tif' => 'image/tiff',
            'ico' => 'image/x-icon',
            'svg' => 'image/svg+xml',
        ];
        
        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }
    
    /**
     * Formatea el tamaño en bytes a formato legible
     * 
     * @param int $bytes Tamaño en bytes
     * @return string Tamaño formateado
     */
    private function formatearTamaño($bytes) {
        $unidades = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($unidades) - 1);
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $unidades[$pow];
    }
}

// Uso de la clase
$client = new PdfMergerClient('http://localhost:3000');

$resultado = $client->unirPdfs([
    'archivo1.pdf',
    'imagen1.png',
    'imagen2.jpg'
], 'documento-final.pdf');

if ($resultado['exito']) {
    echo "✅ PDF creado exitosamente!\n";
    echo "📄 Archivo: {$resultado['archivo']}\n";
    echo "📊 Tamaño: {$resultado['tamañoFormateado']}\n";
} else {
    echo "❌ Error: {$resultado['error']}\n";
    if (isset($resultado['codigo'])) {
        echo "Código HTTP: {$resultado['codigo']}\n";
    }
}
?>
```

---

## Integración con Frameworks

### Laravel

#### Service (Recomendado para Laravel)

```php
<?php
namespace App\Services;

use Illuminate\Support\Facades\Log;

class PdfMergerService
{
    private $apiUrl;
    private $timeout;
    
    public function __construct()
    {
        $this->apiUrl = config('services.pdf_merger.url', 'http://localhost:3000');
        $this->timeout = config('services.pdf_merger.timeout', 300);
    }
    
    /**
     * Une múltiples PDFs e imágenes
     * 
     * @param array $archivos Array de rutas de archivos o instancias de UploadedFile
     * @param string $nombreSalida Nombre del archivo resultante
     * @return array Resultado con 'exito', 'archivo', 'tamaño' o 'error'
     */
    public function unirPdfs($archivos, $nombreSalida = 'resultado.pdf')
    {
        try {
            // Preparar datos para cURL - IMPORTANTE: usar índices numéricos
            $postData = [];
            
            foreach ($archivos as $index => $archivo) {
                // Si es una instancia de UploadedFile (Laravel)
                if (is_object($archivo) && method_exists($archivo, 'getRealPath')) {
                    $postData["archivos[{$index}]"] = new \CURLFile(
                        $archivo->getRealPath(),
                        $archivo->getMimeType(),
                        $archivo->getClientOriginalName()
                    );
                } 
                // Si es una ruta de archivo
                elseif (is_string($archivo) && file_exists($archivo)) {
                    $mimeType = mime_content_type($archivo);
                    $postData["archivos[{$index}]"] = new \CURLFile(
                        realpath($archivo),
                        $mimeType,
                        basename($archivo)
                    );
                } else {
                    return [
                        'exito' => false,
                        'error' => "Archivo inválido en índice {$index}"
                    ];
                }
            }
            
            $postData['nombreSalida'] = $nombreSalida;
            
            // Realizar petición
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $this->apiUrl . '/api/unir-pdfs');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); // Array plano con índices
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            if ($curlError) {
                Log::error('Error cURL en PdfMergerService', ['error' => $curlError]);
                return [
                    'exito' => false,
                    'error' => "Error de conexión: {$curlError}"
                ];
            }
            
            if ($httpCode === 200) {
                return [
                    'exito' => true,
                    'contenido' => $response,
                    'tamaño' => strlen($response),
                    'nombreSalida' => $nombreSalida
                ];
            } else {
                $errorData = json_decode($response, true);
                Log::error('Error API en PdfMergerService', [
                    'httpCode' => $httpCode,
                    'error' => $errorData
                ]);
                return [
                    'exito' => false,
                    'error' => $errorData['error'] ?? "Error HTTP {$httpCode}",
                    'codigo' => $httpCode
                ];
            }
        } catch (\Exception $e) {
            Log::error('Excepción en PdfMergerService', [
                'mensaje' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'exito' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
```

#### Controlador

```php
<?php
namespace App\Http\Controllers;

use App\Services\PdfMergerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PdfMergerController extends Controller
{
    private $pdfMergerService;
    
    public function __construct(PdfMergerService $pdfMergerService)
    {
        $this->pdfMergerService = $pdfMergerService;
    }
    
    public function unirPdfs(Request $request)
    {
        $request->validate([
            'archivos' => 'required|array|min:2|max:10',
            'archivos.*' => 'required|file|max:51200', // 50MB
            'nombreSalida' => 'nullable|string|max:255'
        ]);
        
        $archivos = $request->file('archivos');
        $nombreSalida = $request->input('nombreSalida', 'resultado.pdf');
        
        $resultado = $this->pdfMergerService->unirPdfs($archivos, $nombreSalida);
        
        if ($resultado['exito']) {
            // Guardar en storage
            $ruta = 'pdfs/' . $nombreSalida;
            Storage::put($ruta, $resultado['contenido']);
            
            // Retornar descarga
            return response()->download(
                storage_path('app/' . $ruta),
                $nombreSalida
            )->deleteFileAfterSend(true);
        }
        
        return response()->json([
            'error' => $resultado['error'] ?? 'Error al procesar los archivos'
        ], $resultado['codigo'] ?? 500);
    }
}
```

#### Ruta

```php
// routes/web.php
Route::post('/unir-pdfs', [PdfMergerController::class, 'unirPdfs']);
```

#### Configuración

```php
// config/services.php
return [
    'pdf_merger' => [
        'url' => env('PDF_MERGER_URL', 'http://localhost:3000'),
    ],
];
```

```env
# .env
PDF_MERGER_URL=http://localhost:3000
```

### CodeIgniter

```php
<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Pdf_merger extends CI_Controller {
    
    private $api_url = 'http://localhost:3000';
    
    public function unir() {
        $this->load->library('upload');
        
        $config['upload_path'] = './uploads/temp/';
        $config['allowed_types'] = 'pdf|png|jpg|jpeg|gif|bmp|webp';
        $config['max_size'] = 51200; // 50MB
        
        $archivos = [];
        foreach ($_FILES as $key => $file) {
            if (!empty($file['name'])) {
                $this->upload->initialize($config);
                if ($this->upload->do_upload($key)) {
                    $archivos[] = $this->upload->data()['full_path'];
                }
            }
        }
        
        if (count($archivos) < 2) {
            $this->output
                ->set_status_header(400)
                ->set_output(json_encode(['error' => 'Mínimo 2 archivos requeridos']));
            return;
        }
        
        $postData = [];
        foreach ($archivos as $archivo) {
            $postData['archivos'][] = new CURLFile(
                $archivo,
                mime_content_type($archivo),
                basename($archivo)
            );
        }
        $postData['nombreSalida'] = 'resultado.pdf';
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->api_url . '/api/unir-pdfs');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 300);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        // Limpiar archivos temporales
        foreach ($archivos as $archivo) {
            unlink($archivo);
        }
        
        if ($httpCode === 200) {
            $this->output
                ->set_content_type('application/pdf')
                ->set_output($response);
        } else {
            $this->output
                ->set_status_header($httpCode)
                ->set_output($response);
        }
    }
}
```

---

## Manejo de Errores

### Clase de Excepciones Personalizada

```php
<?php
class PdfMergerException extends Exception {
    private $httpCode;
    private $apiError;
    
    public function __construct($message, $httpCode = 0, $apiError = null) {
        parent::__construct($message);
        $this->httpCode = $httpCode;
        $this->apiError = $apiError;
    }
    
    public function getHttpCode() {
        return $this->httpCode;
    }
    
    public function getApiError() {
        return $this->apiError;
    }
}

// Uso con manejo de errores
try {
    $client = new PdfMergerClient();
    $resultado = $client->unirPdfs(['archivo1.pdf', 'archivo2.pdf']);
    
    if (!$resultado['exito']) {
        throw new PdfMergerException(
            $resultado['error'],
            $resultado['codigo'] ?? 0,
            $resultado
        );
    }
    
    echo "✅ PDF creado: {$resultado['archivo']}\n";
    
} catch (PdfMergerException $e) {
    echo "❌ Error: {$e->getMessage()}\n";
    if ($e->getHttpCode()) {
        echo "Código HTTP: {$e->getHttpCode()}\n";
    }
} catch (Exception $e) {
    echo "❌ Error inesperado: {$e->getMessage()}\n";
}
?>
```

---

## Casos de Uso Avanzados

### Procesamiento Asíncrono con Cola

```php
<?php
// Ejemplo con sistema de colas (usando Redis/Database)
class PdfMergerJob {
    private $archivos;
    private $nombreSalida;
    private $callback;
    
    public function __construct($archivos, $nombreSalida, $callback = null) {
        $this->archivos = $archivos;
        $this->nombreSalida = $nombreSalida;
        $this->callback = $callback;
    }
    
    public function procesar() {
        $client = new PdfMergerClient();
        $resultado = $client->unirPdfs($this->archivos, $this->nombreSalida);
        
        if ($this->callback) {
            call_user_func($this->callback, $resultado);
        }
        
        return $resultado;
    }
}

// Uso
$job = new PdfMergerJob(
    ['archivo1.pdf', 'imagen1.png'],
    'resultado.pdf',
    function($resultado) {
        if ($resultado['exito']) {
            // Enviar email, notificación, etc.
            mail('usuario@example.com', 'PDF Listo', 'Tu PDF está listo!');
        }
    }
);

// Agregar a cola
// $queue->push($job);
?>
```

### Integración con Formulario HTML

```php
<?php
// procesar.php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['archivos'])) {
    $archivos = [];
    
    foreach ($_FILES['archivos']['tmp_name'] as $key => $tmpName) {
        if ($_FILES['archivos']['error'][$key] === UPLOAD_ERR_OK) {
            $archivos[] = $tmpName;
        }
    }
    
    if (count($archivos) >= 2) {
        $client = new PdfMergerClient();
        $nombreSalida = $_POST['nombreSalida'] ?? 'resultado.pdf';
        $resultado = $client->unirPdfs($archivos, $nombreSalida);
        
        if ($resultado['exito']) {
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $nombreSalida . '"');
            readfile($resultado['archivo']);
            exit;
        } else {
            echo json_encode(['error' => $resultado['error']]);
        }
    } else {
        echo json_encode(['error' => 'Mínimo 2 archivos requeridos']);
    }
}
?>

<!-- formulario.html -->
<form action="procesar.php" method="POST" enctype="multipart/form-data">
    <input type="file" name="archivos[]" multiple required>
    <input type="text" name="nombreSalida" placeholder="Nombre del PDF" value="resultado.pdf">
    <button type="submit">Unir PDFs</button>
</form>
```

### Procesamiento por Lotes

```php
<?php
class ProcesadorLotes {
    private $client;
    
    public function __construct() {
        $this->client = new PdfMergerClient();
    }
    
    public function procesarLote($lotes) {
        $resultados = [];
        
        foreach ($lotes as $indice => $lote) {
            $nombreSalida = "lote_{$indice}_" . date('Y-m-d_H-i-s') . '.pdf';
            $resultado = $this->client->unirPdfs($lote['archivos'], $nombreSalida);
            $resultados[] = [
                'lote' => $indice,
                'resultado' => $resultado
            ];
        }
        
        return $resultados;
    }
}

// Uso
$procesador = new ProcesadorLotes();
$lotes = [
    ['archivos' => ['doc1.pdf', 'img1.png']],
    ['archivos' => ['doc2.pdf', 'img2.jpg']],
    ['archivos' => ['doc3.pdf', 'img3.gif']],
];

$resultados = $procesador->procesarLote($lotes);
foreach ($resultados as $item) {
    if ($item['resultado']['exito']) {
        echo "✅ Lote {$item['lote']} procesado\n";
    }
}
?>
```

---

## Mejores Prácticas

### 1. Validación de Archivos

```php
private function validarArchivo($archivo) {
    $extensionesPermitidas = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
    $extension = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));
    
    if (!in_array($extension, $extensionesPermitidas)) {
        return false;
    }
    
    if (filesize($archivo) > 50 * 1024 * 1024) {
        return false;
    }
    
    return true;
}
```

### 2. Timeout Configurable

```php
$client = new PdfMergerClient('http://localhost:3000', 600); // 10 minutos
```

### 3. Logging

```php
function logPdfMerger($mensaje, $datos = []) {
    $log = date('Y-m-d H:i:s') . " - $mensaje\n";
    if (!empty($datos)) {
        $log .= "Datos: " . json_encode($datos) . "\n";
    }
    file_put_contents('pdf_merger.log', $log, FILE_APPEND);
}
```

### 4. Variables de Entorno

```php
// .env
PDF_MERGER_URL=http://localhost:3000
PDF_MERGER_TIMEOUT=300

// config.php
define('PDF_MERGER_URL', getenv('PDF_MERGER_URL') ?: 'http://localhost:3000');
define('PDF_MERGER_TIMEOUT', (int)getenv('PDF_MERGER_TIMEOUT') ?: 300);
```

---

## Solución de Problemas

### Error: "Object of class CURLFile could not be converted to string"

**Problema**: Este error ocurre cuando intentas pasar un array anidado con objetos CURLFile a `curl_setopt`.

**Causa**: Cuando tienes múltiples archivos con el mismo nombre de campo, no puedes usar un array anidado como `$postData['archivos'][]`.

**Solución**: Usar índices numéricos en el nombre del campo:

```php
// ❌ INCORRECTO - Causa el error
$postData = [];
foreach ($archivos as $archivo) {
    $postData['archivos'][] = new CURLFile(...); // Array anidado
}
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); // Error aquí

// ✅ CORRECTO - Usar índices en el nombre
$postData = [];
foreach ($archivos as $index => $archivo) {
    $postData["archivos[{$index}]"] = new CURLFile(...); // Array plano
}
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); // Funciona correctamente
```

**Ejemplo completo corregido**:

```php
<?php
function unirPdfsCorregido($archivos, $nombreSalida = 'resultado.pdf') {
    $url = 'http://localhost:3000/api/unir-pdfs';
    
    // Preparar datos con índices numéricos
    $postData = [];
    foreach ($archivos as $index => $archivo) {
        $mimeType = mime_content_type($archivo);
        // Usar índice en el nombre del campo
        $postData["archivos[{$index}]"] = new CURLFile(
            realpath($archivo),
            $mimeType,
            basename($archivo)
        );
    }
    $postData['nombreSalida'] = $nombreSalida;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); // Array plano, no anidado
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 300);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        file_put_contents($nombreSalida, $response);
        return ['exito' => true, 'archivo' => $nombreSalida];
    }
    
    return ['exito' => false, 'error' => "Error HTTP $httpCode"];
}
?>
```

### Error: "cURL error 28: Operation timed out"

**Solución**: Aumentar el timeout

```php
curl_setopt($ch, CURLOPT_TIMEOUT, 600); // 10 minutos
```

### Error: "File size exceeds limit"

**Solución**: Verificar tamaño de archivos antes de enviar

```php
if (filesize($archivo) > 50 * 1024 * 1024) {
    // Archivo demasiado grande
}
```

### Error: "Memory limit exceeded"

**Solución**: Aumentar memory_limit en php.ini

```ini
memory_limit = 256M
```

---

## Recursos Adicionales

- [Documentación de cURL en PHP](https://www.php.net/manual/es/book.curl.php)
- [Documentación de Guzzle](https://docs.guzzlephp.org/)
- [CURLFile Class](https://www.php.net/manual/es/class.curlfile.php)

---

## Soporte

Para más información o ayuda, consulta:
- Repositorio: [https://github.com/bryda119/Api-pdf](https://github.com/bryda119/Api-pdf)
- Documentación completa: Ver README.md

---

**Última actualización**: Febrero 2026
