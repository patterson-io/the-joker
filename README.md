# The Joker - Servidor HTTP en Go

Este repositorio contiene ejemplos de cómo crear un servidor HTTP básico en Go con convenciones de nomenclatura en español.

## Ejemplo de Servidor HTTP "Hola Mundo"

A continuación se muestra un ejemplo completo de cómo crear un servidor HTTP en Go que responde con "Hola Mundo":

### Código de Ejemplo

```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

// manejarHolaMundo maneja las solicitudes HTTP y responde con "Hola Mundo"
func manejarHolaMundo(escritorRespuesta http.ResponseWriter, solicitud *http.Request) {
	mensajeHola := "¡Hola Mundo desde Go!"
	fmt.Fprintf(escritorRespuesta, mensajeHola)
}

// manejarSaludo maneja las solicitudes con parámetros de consulta para saludos personalizados
func manejarSaludo(escritorRespuesta http.ResponseWriter, solicitud *http.Request) {
	nombre := solicitud.URL.Query().Get("nombre")
	if nombre == "" {
		nombre = "Invitado"
	}
	
	mensajePersonalizado := fmt.Sprintf("¡Hola %s! Bienvenido al servidor Go en español.", nombre)
	fmt.Fprintf(escritorRespuesta, mensajePersonalizado)
}

// configurarRutas configura todas las rutas del servidor HTTP
func configurarRutas() {
	http.HandleFunc("/", manejarHolaMundo)
	http.HandleFunc("/saludo", manejarSaludo)
}

// iniciarServidor inicia el servidor HTTP en el puerto especificado
func iniciarServidor(puerto string) error {
	direccionCompleta := ":" + puerto
	fmt.Printf("Iniciando servidor en http://localhost%s\n", direccionCompleta)
	
	errorServidor := http.ListenAndServe(direccionCompleta, nil)
	if errorServidor != nil {
		return fmt.Errorf("error al iniciar el servidor: %v", errorServidor)
	}
	
	return nil
}

func main() {
	// Configurar las rutas del servidor
	configurarRutas()
	
	// Puerto donde se ejecutará el servidor
	puertoServidor := "8080"
	
	// Mensaje de inicio
	fmt.Println("=== Servidor HTTP Hola Mundo ===")
	fmt.Printf("El servidor se iniciará en el puerto %s\n", puertoServidor)
	
	// Iniciar el servidor
	errorInicio := iniciarServidor(puertoServidor)
	if errorInicio != nil {
		log.Fatalf("No se pudo iniciar el servidor: %v", errorInicio)
	}
}
```

### Cómo ejecutar el código

1. **Crear un nuevo archivo Go:**
   ```bash
   touch servidor.go
   ```

2. **Copiar el código de ejemplo** en el archivo `servidor.go`

3. **Inicializar un módulo Go (opcional):**
   ```bash
   go mod init servidor-hola-mundo
   ```

4. **Ejecutar el servidor:**
   ```bash
   go run servidor.go
   ```

5. **Probar el servidor:**
   - Abrir el navegador y visitar: `http://localhost:8080`
   - Para saludos personalizados: `http://localhost:8080/saludo?nombre=TuNombre`

### Explicación del Código

#### Funciones Principales

- **`manejarHolaMundo`**: Función que maneja las solicitudes a la ruta raíz (`/`) y responde con un mensaje simple de "Hola Mundo"
- **`manejarSaludo`**: Función que maneja solicitudes con parámetros de consulta para crear saludos personalizados
- **`configurarRutas`**: Función que registra todas las rutas y sus correspondientes manejadores
- **`iniciarServidor`**: Función que inicia el servidor HTTP en el puerto especificado

#### Convenciones de Nomenclatura en Español

Este ejemplo sigue las mejores prácticas de nomenclatura en español:

- **Variables**: `mensajeHola`, `escritorRespuesta`, `puertoServidor`
- **Funciones**: `manejarHolaMundo`, `configurarRutas`, `iniciarServidor`
- **Parámetros**: `solicitud`, `escritorRespuesta`, `puerto`
- **Mensajes**: Todos los strings y mensajes de error están en español

### Rutas Disponibles

| Ruta | Descripción | Ejemplo |
|------|-------------|---------|
| `/` | Página principal con mensaje "Hola Mundo" | `http://localhost:8080/` |
| `/saludo` | Saludo personalizado con parámetro nombre | `http://localhost:8080/saludo?nombre=Juan` |

### Ejemplo de Respuestas

**Ruta principal (`/`):**
```
¡Hola Mundo desde Go!
```

**Ruta de saludo (`/saludo?nombre=María`):**
```
¡Hola María! Bienvenido al servidor Go en español.
```

**Ruta de saludo sin parámetro (`/saludo`):**
```
¡Hola Invitado! Bienvenido al servidor Go en español.
```

### Notas Adicionales

- El servidor se ejecuta por defecto en el puerto 8080
- Todos los mensajes de error y logs están en español
- El código está documentado con comentarios en español
- Las funciones siguen la convención de nomenclatura camelCase pero con palabras en español

### Requisitos

- Go 1.16 o superior
- No se requieren dependencias externas (solo la biblioteca estándar de Go)