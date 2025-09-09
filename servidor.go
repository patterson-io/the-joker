// Paquete principal para el servidor HTTP
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

// Configuracion representa la configuración del servidor
type Configuracion struct {
	Puerto            int    `json:"puerto"`
	DireccionServidor string `json:"direccion_servidor"`
	TiempoEspera      int    `json:"tiempo_espera_segundos"`
}

// RespuestaJSON representa una respuesta JSON estándar
type RespuestaJSON struct {
	Exitoso bool        `json:"exitoso"`
	Mensaje string      `json:"mensaje"`
	Datos   interface{} `json:"datos,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// Usuario representa un usuario del sistema
type Usuario struct {
	ID       int    `json:"id"`
	Nombre   string `json:"nombre"`
	Email    string `json:"email"`
	Creado   string `json:"fecha_creado"`
}

// ServidorHTTP encapsula la lógica del servidor
type ServidorHTTP struct {
	configuracion *Configuracion
	usuarios      []Usuario
	contadorID    int
}

// NuevoServidor crea una nueva instancia del servidor
func NuevoServidor(config *Configuracion) *ServidorHTTP {
	return &ServidorHTTP{
		configuracion: config,
		usuarios:      make([]Usuario, 0),
		contadorID:    1,
	}
}

// MiddlewareRegistro registra todas las peticiones HTTP
func (s *ServidorHTTP) MiddlewareRegistro(siguiente http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		inicioTiempo := time.Now()
		log.Printf("[%s] %s %s - Iniciando petición", 
			inicioTiempo.Format("2006-01-02 15:04:05"), r.Method, r.URL.Path)
		
		siguiente.ServeHTTP(w, r)
		
		duracion := time.Since(inicioTiempo)
		log.Printf("[%s] %s %s - Completado en %v", 
			time.Now().Format("2006-01-02 15:04:05"), r.Method, r.URL.Path, duracion)
	})
}

// MiddlewareCORS agrega headers CORS
func (s *ServidorHTTP) MiddlewareCORS(siguiente http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		siguiente.ServeHTTP(w, r)
	})
}

// enviarRespuestaJSON envía una respuesta JSON al cliente
func (s *ServidorHTTP) enviarRespuestaJSON(w http.ResponseWriter, codigo int, respuesta RespuestaJSON) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(codigo)
	
	if err := json.NewEncoder(w).Encode(respuesta); err != nil {
		log.Printf("Error al codificar JSON: %v", err)
	}
}

// manejarInicio maneja la ruta de inicio
func (s *ServidorHTTP) manejarInicio(w http.ResponseWriter, r *http.Request) {
	respuesta := RespuestaJSON{
		Exitoso: true,
		Mensaje: "¡Bienvenido al servidor HTTP en español!",
		Datos: map[string]interface{}{
			"version":     "1.0.0",
			"descripcion": "Servidor HTTP completo con documentación en español",
			"endpoints_disponibles": []string{
				"/",
				"/usuarios",
				"/usuarios/{id}",
				"/salud",
				"/estado",
			},
		},
	}
	
	s.enviarRespuestaJSON(w, http.StatusOK, respuesta)
}

// manejarSalud maneja el endpoint de verificación de salud
func (s *ServidorHTTP) manejarSalud(w http.ResponseWriter, r *http.Request) {
	respuesta := RespuestaJSON{
		Exitoso: true,
		Mensaje: "El servidor está funcionando correctamente",
		Datos: map[string]interface{}{
			"tiempo_servidor": time.Now().Format("2006-01-02 15:04:05"),
			"estado":         "saludable",
		},
	}
	
	s.enviarRespuestaJSON(w, http.StatusOK, respuesta)
}

// manejarUsuarios maneja las operaciones CRUD de usuarios
func (s *ServidorHTTP) manejarUsuarios(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		s.obtenerUsuarios(w, r)
	case "POST":
		s.crearUsuario(w, r)
	default:
		respuesta := RespuestaJSON{
			Exitoso: false,
			Error:   "Método HTTP no permitido",
		}
		s.enviarRespuestaJSON(w, http.StatusMethodNotAllowed, respuesta)
	}
}

// obtenerUsuarios devuelve todos los usuarios
func (s *ServidorHTTP) obtenerUsuarios(w http.ResponseWriter, r *http.Request) {
	respuesta := RespuestaJSON{
		Exitoso: true,
		Mensaje: fmt.Sprintf("Se encontraron %d usuarios", len(s.usuarios)),
		Datos:   s.usuarios,
	}
	
	s.enviarRespuestaJSON(w, http.StatusOK, respuesta)
}

// crearUsuario crea un nuevo usuario
func (s *ServidorHTTP) crearUsuario(w http.ResponseWriter, r *http.Request) {
	var nuevoUsuario Usuario
	
	if err := json.NewDecoder(r.Body).Decode(&nuevoUsuario); err != nil {
		respuesta := RespuestaJSON{
			Exitoso: false,
			Error:   "Error al decodificar JSON: " + err.Error(),
		}
		s.enviarRespuestaJSON(w, http.StatusBadRequest, respuesta)
		return
	}
	
	// Validar datos requeridos
	if nuevoUsuario.Nombre == "" || nuevoUsuario.Email == "" {
		respuesta := RespuestaJSON{
			Exitoso: false,
			Error:   "Nombre y email son campos obligatorios",
		}
		s.enviarRespuestaJSON(w, http.StatusBadRequest, respuesta)
		return
	}
	
	// Asignar ID y fecha de creación
	nuevoUsuario.ID = s.contadorID
	nuevoUsuario.Creado = time.Now().Format("2006-01-02 15:04:05")
	s.contadorID++
	
	// Agregar usuario a la lista
	s.usuarios = append(s.usuarios, nuevoUsuario)
	
	respuesta := RespuestaJSON{
		Exitoso: true,
		Mensaje: "Usuario creado exitosamente",
		Datos:   nuevoUsuario,
	}
	
	s.enviarRespuestaJSON(w, http.StatusCreated, respuesta)
}

// manejarUsuarioPorID maneja operaciones en un usuario específico
func (s *ServidorHTTP) manejarUsuarioPorID(w http.ResponseWriter, r *http.Request) {
	// Extraer ID de la URL (simplificado para el ejemplo)
	idStr := r.URL.Path[len("/usuarios/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		respuesta := RespuestaJSON{
			Exitoso: false,
			Error:   "ID de usuario inválido",
		}
		s.enviarRespuestaJSON(w, http.StatusBadRequest, respuesta)
		return
	}
	
	// Buscar usuario
	for _, usuario := range s.usuarios {
		if usuario.ID == id {
			respuesta := RespuestaJSON{
				Exitoso: true,
				Mensaje: "Usuario encontrado",
				Datos:   usuario,
			}
			s.enviarRespuestaJSON(w, http.StatusOK, respuesta)
			return
		}
	}
	
	// Usuario no encontrado
	respuesta := RespuestaJSON{
		Exitoso: false,
		Error:   "Usuario no encontrado",
	}
	s.enviarRespuestaJSON(w, http.StatusNotFound, respuesta)
}

// configurarRutas configura todas las rutas del servidor
func (s *ServidorHTTP) configurarRutas() *http.ServeMux {
	mux := http.NewServeMux()
	
	// Rutas principales
	mux.HandleFunc("/", s.manejarInicio)
	mux.HandleFunc("/salud", s.manejarSalud)
	mux.HandleFunc("/usuarios", s.manejarUsuarios)
	mux.HandleFunc("/usuarios/", s.manejarUsuarioPorID)
	
	return mux
}

// IniciarServidor inicia el servidor HTTP
func (s *ServidorHTTP) IniciarServidor() error {
	direccionCompleta := fmt.Sprintf("%s:%d", 
		s.configuracion.DireccionServidor, s.configuracion.Puerto)
	
	mux := s.configurarRutas()
	
	// Aplicar middleware
	manejadorConMiddleware := s.MiddlewareRegistro(s.MiddlewareCORS(mux))
	
	servidor := &http.Server{
		Addr:         direccionCompleta,
		Handler:      manejadorConMiddleware,
		ReadTimeout:  time.Duration(s.configuracion.TiempoEspera) * time.Second,
		WriteTimeout: time.Duration(s.configuracion.TiempoEspera) * time.Second,
	}
	
	log.Printf("🚀 Servidor iniciado en http://%s", direccionCompleta)
	log.Printf("📚 Documentación disponible en: /")
	log.Printf("❤️  Estado de salud en: /salud")
	
	return servidor.ListenAndServe()
}

// obtenerConfiguracionDesdeEntorno obtiene la configuración desde variables de entorno
func obtenerConfiguracionDesdeEntorno() *Configuracion {
	puerto := 8080
	if puertoEnv := os.Getenv("PUERTO"); puertoEnv != "" {
		if p, err := strconv.Atoi(puertoEnv); err == nil {
			puerto = p
		}
	}
	
	direccion := "localhost"
	if direccionEnv := os.Getenv("DIRECCION"); direccionEnv != "" {
		direccion = direccionEnv
	}
	
	tiempoEspera := 30
	if tiempoEnv := os.Getenv("TIEMPO_ESPERA"); tiempoEnv != "" {
		if t, err := strconv.Atoi(tiempoEnv); err == nil {
			tiempoEspera = t
		}
	}
	
	return &Configuracion{
		Puerto:            puerto,
		DireccionServidor: direccion,
		TiempoEspera:      tiempoEspera,
	}
}

func main() {
	log.Println("🎭 Iniciando el servidor HTTP 'The Joker'...")
	
	configuracion := obtenerConfiguracionDesdeEntorno()
	servidor := NuevoServidor(configuracion)
	
	if err := servidor.IniciarServidor(); err != nil {
		log.Fatalf("❌ Error al iniciar el servidor: %v", err)
	}
}