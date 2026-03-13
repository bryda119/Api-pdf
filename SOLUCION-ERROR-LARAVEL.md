# 🔧 Solución: Error "CURLFile could not be converted to string" en Laravel

## ❌ El Problema

Cuando intentas pasar múltiples archivos usando `CURLFile` en Laravel, obtienes este error:

```
Object of class CURLFile could not be converted to string
```

Esto ocurre porque estás usando un **array anidado** con objetos CURLFile.

## ✅ La Solución

Usa **índices numéricos en el nombre del campo** en lugar de un array anidado.

## 📝 Código Corregido para Laravel

### Service (PdfMergerService.php)

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
     * @param array $archivos Array de rutas o instancias de UploadedFile
     * @param string $nombreSalida Nombre del archivo resultante
     * @return array Resultado con 'exito', 'contenido', 'tamaño' o 'error'
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

### Controller (ValidacionController.php o tu controlador)

```php
<?php
namespace App\Http\Controllers;

use App\Services\PdfMergerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ValidacionController extends Controller
{
    private $pdfMergerService;
    
    public function __construct(PdfMergerService $pdfMergerService)
    {
        $this->pdfMergerService = $pdfMergerService;
    }
    
    public function previewAfterSave($id)
    {
        // Obtener archivos (ejemplo)
        $archivos = [
            storage_path('app/archivo1.pdf'),
            storage_path('app/imagen1.png'),
            // ... más archivos
        ];
        
        $nombreSalida = 'F-VAL-01-011.pdf';
        
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

## 🔑 Puntos Clave

### ❌ INCORRECTO (Causa el error)

```php
$postData = [];
foreach ($archivos as $archivo) {
    $postData['archivos'][] = new CURLFile(...); // Array anidado
}
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); // ❌ Error aquí
```

### ✅ CORRECTO (Funciona)

```php
$postData = [];
foreach ($archivos as $index => $archivo) {
    $postData["archivos[{$index}]"] = new CURLFile(...); // Array plano con índices
}
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); // ✅ Funciona
```

## 📋 Configuración (config/services.php)

```php
<?php
return [
    'pdf_merger' => [
        'url' => env('PDF_MERGER_URL', 'http://localhost:3000'),
        'timeout' => env('PDF_MERGER_TIMEOUT', 300),
    ],
];
```

## 🔧 Variables de Entorno (.env)

```env
PDF_MERGER_URL=http://localhost:3000
PDF_MERGER_TIMEOUT=300
```

## 🧪 Prueba Rápida

```php
// En tinker o un test
$service = app(PdfMergerService::class);
$resultado = $service->unirPdfs([
    storage_path('app/test1.pdf'),
    storage_path('app/test2.png')
], 'test-resultado.pdf');

if ($resultado['exito']) {
    Storage::put('pdfs/test-resultado.pdf', $resultado['contenido']);
    echo "✅ PDF creado exitosamente!";
} else {
    echo "❌ Error: " . $resultado['error'];
}
```

## 📚 Más Información

- Ver `INTEGRACION-PHP.md` para ejemplos completos
- Ver `README.md` para documentación general de la API

---

**Última actualización**: Febrero 2026
