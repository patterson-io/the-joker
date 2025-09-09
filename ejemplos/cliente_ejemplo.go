// Ejemplo de cliente para interactuar con el servidor HTTP
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// ClienteHTTP encapsula la lógica del cliente
type ClienteHTTP struct {
	urlBase    string
	tiempoEspera time.Duration
}

// NuevoCliente crea una nueva instancia del cliente
func NuevoCliente(urlServidor string) *ClienteHTTP {
	return &ClienteHTTP{
		urlBase:    urlServidor,
		tiempoEspera: 30 * time.Second,
	}
}

// realizarPeticion realiza una petición HTTP genérica
func (c *ClienteHTTP) realizarPeticion(metodo, endpoint string, cuerpo interface{}) ([]byte, error) {
	url := c.urlBase + endpoint
	
	var cuerpoBytes []byte
	var err error
	
	if cuerpo != nil {
		cuerpoBytes, err = json.Marshal(cuerpo)
		if err != nil {
			return nil, fmt.Errorf("error al codificar JSON: %w", err)
		}
	}
	
	peticion, err := http.NewRequest(metodo, url, bytes.NewBuffer(cuerpoBytes))
	if err != nil {
		return nil, fmt.Errorf("error al crear petición: %w", err)
	}
	
	peticion.Header.Set("Content-Type", "application/json")
	
	cliente := &http.Client{Timeout: c.tiempoEspera}
	respuesta, err := cliente.Do(peticion)
	if err != nil {
		return nil, fmt.Errorf("error al enviar petición: %w", err)
	}
	defer respuesta.Body.Close()
	
	cuerpoRespuesta, err := io.ReadAll(respuesta.Body)
	if err != nil {
		return nil, fmt.Errorf("error al leer respuesta: %w", err)
	}
	
	if respuesta.StatusCode >= 400 {
		return cuerpoRespuesta, fmt.Errorf("error HTTP %d: %s", respuesta.StatusCode, string(cuerpoRespuesta))
	}
	
	return cuerpoRespuesta, nil
}

// verificarSalud verifica el estado del servidor
func (c *ClienteHTTP) verificarSalud() error {
	respuesta, err := c.realizarPeticion("GET", "/salud", nil)
	if err != nil {
		return fmt.Errorf("error al verificar salud: %w", err)
	}
	
	var resultado map[string]interface{}
	if err := json.Unmarshal(respuesta, &resultado); err != nil {
		return fmt.Errorf("error al decodificar respuesta: %w", err)
	}
	
	fmt.Printf("✅ Estado del servidor: %s\n", resultado["mensaje"])
	return nil
}

// obtenerInformacionServidor obtiene información general del servidor
func (c *ClienteHTTP) obtenerInformacionServidor() error {
	respuesta, err := c.realizarPeticion("GET", "/", nil)
	if err != nil {
		return fmt.Errorf("error al obtener información: %w", err)
	}
	
	var resultado map[string]interface{}
	if err := json.Unmarshal(respuesta, &resultado); err != nil {
		return fmt.Errorf("error al decodificar respuesta: %w", err)
	}
	
	fmt.Printf("📊 Información del servidor:\n")
	fmt.Printf("   Mensaje: %s\n", resultado["mensaje"])
	
	if datos, ok := resultado["datos"].(map[string]interface{}); ok {
		if version, ok := datos["version"].(string); ok {
			fmt.Printf("   Versión: %s\n", version)
		}
		if descripcion, ok := datos["descripcion"].(string); ok {
			fmt.Printf("   Descripción: %s\n", descripcion)
		}
	}
	
	return nil
}

// crearUsuario crea un nuevo usuario en el servidor
func (c *ClienteHTTP) crearUsuario(nombre, email string) error {
	datosUsuario := map[string]string{
		"nombre": nombre,
		"email":  email,
	}
	
	respuesta, err := c.realizarPeticion("POST", "/usuarios", datosUsuario)
	if err != nil {
		return fmt.Errorf("error al crear usuario: %w", err)
	}
	
	var resultado map[string]interface{}
	if err := json.Unmarshal(respuesta, &resultado); err != nil {
		return fmt.Errorf("error al decodificar respuesta: %w", err)
	}
	
	fmt.Printf("👤 Usuario creado: %s\n", resultado["mensaje"])
	
	if datos, ok := resultado["datos"].(map[string]interface{}); ok {
		if id, ok := datos["id"].(float64); ok {
			fmt.Printf("   ID: %.0f\n", id)
		}
		if fechaCreado, ok := datos["fecha_creado"].(string); ok {
			fmt.Printf("   Fecha de creación: %s\n", fechaCreado)
		}
	}
	
	return nil
}

// obtenerUsuarios obtiene todos los usuarios del servidor
func (c *ClienteHTTP) obtenerUsuarios() error {
	respuesta, err := c.realizarPeticion("GET", "/usuarios", nil)
	if err != nil {
		return fmt.Errorf("error al obtener usuarios: %w", err)
	}
	
	var resultado map[string]interface{}
	if err := json.Unmarshal(respuesta, &resultado); err != nil {
		return fmt.Errorf("error al decodificar respuesta: %w", err)
	}
	
	fmt.Printf("👥 %s\n", resultado["mensaje"])
	
	if datos, ok := resultado["datos"].([]interface{}); ok && len(datos) > 0 {
		for _, usuario := range datos {
			if u, ok := usuario.(map[string]interface{}); ok {
				fmt.Printf("   - ID: %.0f, Nombre: %s, Email: %s\n", 
					u["id"], u["nombre"], u["email"])
			}
		}
	} else {
		fmt.Println("   No hay usuarios registrados")
	}
	
	return nil
}

// obtenerUsuarioPorID obtiene un usuario específico por su ID
func (c *ClienteHTTP) obtenerUsuarioPorID(id int) error {
	endpoint := fmt.Sprintf("/usuarios/%d", id)
	respuesta, err := c.realizarPeticion("GET", endpoint, nil)
	if err != nil {
		return fmt.Errorf("error al obtener usuario por ID: %w", err)
	}
	
	var resultado map[string]interface{}
	if err := json.Unmarshal(respuesta, &resultado); err != nil {
		return fmt.Errorf("error al decodificar respuesta: %w", err)
	}
	
	fmt.Printf("🔍 %s\n", resultado["mensaje"])
	
	if datos, ok := resultado["datos"].(map[string]interface{}); ok {
		fmt.Printf("   ID: %.0f\n", datos["id"])
		fmt.Printf("   Nombre: %s\n", datos["nombre"])
		fmt.Printf("   Email: %s\n", datos["email"])
		fmt.Printf("   Fecha de creación: %s\n", datos["fecha_creado"])
	}
	
	return nil
}

// ejemploCompletoDeUso demuestra todas las funcionalidades del cliente
func ejemploCompletoDeUso() {
	fmt.Println("🎭 Iniciando ejemplo completo del cliente HTTP...")
	fmt.Println("=" + string(make([]byte, 50)) + "=")
	
	cliente := NuevoCliente("http://localhost:8080")
	
	// 1. Verificar salud del servidor
	fmt.Println("\n1. Verificando salud del servidor...")
	if err := cliente.verificarSalud(); err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		return
	}
	
	// 2. Obtener información del servidor
	fmt.Println("\n2. Obteniendo información del servidor...")
	if err := cliente.obtenerInformacionServidor(); err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		return
	}
	
	// 3. Crear algunos usuarios de ejemplo
	fmt.Println("\n3. Creando usuarios de ejemplo...")
	usuariosEjemplo := []map[string]string{
		{"nombre": "María González", "email": "maria@ejemplo.com"},
		{"nombre": "Carlos Rodríguez", "email": "carlos@ejemplo.com"},
		{"nombre": "Ana Martínez", "email": "ana@ejemplo.com"},
	}
	
	for _, usuario := range usuariosEjemplo {
		if err := cliente.crearUsuario(usuario["nombre"], usuario["email"]); err != nil {
			fmt.Printf("❌ Error al crear usuario %s: %v\n", usuario["nombre"], err)
		}
		time.Sleep(100 * time.Millisecond) // Pequeña pausa entre creaciones
	}
	
	// 4. Obtener todos los usuarios
	fmt.Println("\n4. Obteniendo todos los usuarios...")
	if err := cliente.obtenerUsuarios(); err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		return
	}
	
	// 5. Obtener usuario específico
	fmt.Println("\n5. Obteniendo usuario específico (ID: 1)...")
	if err := cliente.obtenerUsuarioPorID(1); err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		return
	}
	
	// 6. Intentar obtener usuario que no existe
	fmt.Println("\n6. Intentando obtener usuario inexistente (ID: 999)...")
	if err := cliente.obtenerUsuarioPorID(999); err != nil {
		fmt.Printf("⚠️  Error esperado: %v\n", err)
	}
	
	fmt.Println("\n✅ Ejemplo completo terminado exitosamente!")
}

func main() {
	ejemploCompletoDeUso()
}