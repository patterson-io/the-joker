// Pruebas básicas para el servidor HTTP
package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// configurarServidorPrueba configura un servidor de prueba
func configurarServidorPrueba() *ServidorHTTP {
	configuracion := &Configuracion{
		Puerto:            8080,
		DireccionServidor: "localhost",
		TiempoEspera:      30,
	}
	return NuevoServidor(configuracion)
}

// TestManejarInicio prueba el endpoint principal
func TestManejarInicio(t *testing.T) {
	servidor := configurarServidorPrueba()
	peticion, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	respuestaRecorder := httptest.NewRecorder()
	manejador := http.HandlerFunc(servidor.manejarInicio)
	manejador.ServeHTTP(respuestaRecorder, peticion)

	// Verificar código de estado
	if codigo := respuestaRecorder.Code; codigo != http.StatusOK {
		t.Errorf("Código de estado incorrecto: obtenido %v, esperado %v", codigo, http.StatusOK)
	}

	// Verificar contenido JSON
	var respuesta RespuestaJSON
	if err := json.Unmarshal(respuestaRecorder.Body.Bytes(), &respuesta); err != nil {
		t.Errorf("Error al decodificar JSON: %v", err)
	}

	if !respuesta.Exitoso {
		t.Errorf("Respuesta debería ser exitosa")
	}

	if respuesta.Mensaje == "" {
		t.Errorf("Mensaje no debería estar vacío")
	}
}

// TestManejarSalud prueba el endpoint de salud
func TestManejarSalud(t *testing.T) {
	servidor := configurarServidorPrueba()
	peticion, err := http.NewRequest("GET", "/salud", nil)
	if err != nil {
		t.Fatal(err)
	}

	respuestaRecorder := httptest.NewRecorder()
	manejador := http.HandlerFunc(servidor.manejarSalud)
	manejador.ServeHTTP(respuestaRecorder, peticion)

	// Verificar código de estado
	if codigo := respuestaRecorder.Code; codigo != http.StatusOK {
		t.Errorf("Código de estado incorrecto: obtenido %v, esperado %v", codigo, http.StatusOK)
	}

	// Verificar que el contenido type es JSON
	contentType := respuestaRecorder.Header().Get("Content-Type")
	if contentType != "application/json; charset=utf-8" {
		t.Errorf("Content-Type incorrecto: obtenido %v, esperado %v", contentType, "application/json; charset=utf-8")
	}
}

// TestCrearUsuario prueba la creación de usuarios
func TestCrearUsuario(t *testing.T) {
	servidor := configurarServidorPrueba()
	
	usuarioPrueba := map[string]string{
		"nombre": "Usuario de Prueba",
		"email":  "prueba@ejemplo.com",
	}
	
	cuerpoJSON, _ := json.Marshal(usuarioPrueba)
	peticion, err := http.NewRequest("POST", "/usuarios", bytes.NewBuffer(cuerpoJSON))
	if err != nil {
		t.Fatal(err)
	}
	peticion.Header.Set("Content-Type", "application/json")

	respuestaRecorder := httptest.NewRecorder()
	manejador := http.HandlerFunc(servidor.manejarUsuarios)
	manejador.ServeHTTP(respuestaRecorder, peticion)

	// Verificar código de estado
	if codigo := respuestaRecorder.Code; codigo != http.StatusCreated {
		t.Errorf("Código de estado incorrecto: obtenido %v, esperado %v", codigo, http.StatusCreated)
	}

	// Verificar respuesta JSON
	var respuesta RespuestaJSON
	if err := json.Unmarshal(respuestaRecorder.Body.Bytes(), &respuesta); err != nil {
		t.Errorf("Error al decodificar JSON: %v", err)
	}

	if !respuesta.Exitoso {
		t.Errorf("Respuesta debería ser exitosa")
	}

	// Verificar que el usuario se creó en la lista
	if len(servidor.usuarios) != 1 {
		t.Errorf("Debería haber 1 usuario, pero hay %d", len(servidor.usuarios))
	}
}

// TestCrearUsuarioSinDatos prueba la validación de datos requeridos
func TestCrearUsuarioSinDatos(t *testing.T) {
	servidor := configurarServidorPrueba()
	
	usuarioIncompleto := map[string]string{
		"nombre": "", // Nombre vacío debería fallar
		"email":  "prueba@ejemplo.com",
	}
	
	cuerpoJSON, _ := json.Marshal(usuarioIncompleto)
	peticion, err := http.NewRequest("POST", "/usuarios", bytes.NewBuffer(cuerpoJSON))
	if err != nil {
		t.Fatal(err)
	}
	peticion.Header.Set("Content-Type", "application/json")

	respuestaRecorder := httptest.NewRecorder()
	manejador := http.HandlerFunc(servidor.manejarUsuarios)
	manejador.ServeHTTP(respuestaRecorder, peticion)

	// Debería devolver Bad Request
	if codigo := respuestaRecorder.Code; codigo != http.StatusBadRequest {
		t.Errorf("Código de estado incorrecto: obtenido %v, esperado %v", codigo, http.StatusBadRequest)
	}
}

// TestObtenerUsuarios prueba la obtención de la lista de usuarios
func TestObtenerUsuarios(t *testing.T) {
	servidor := configurarServidorPrueba()
	
	// Agregar un usuario de prueba
	servidor.usuarios = append(servidor.usuarios, Usuario{
		ID:     1,
		Nombre: "Usuario Test",
		Email:  "test@ejemplo.com",
		Creado: "2024-01-15 10:00:00",
	})

	peticion, err := http.NewRequest("GET", "/usuarios", nil)
	if err != nil {
		t.Fatal(err)
	}

	respuestaRecorder := httptest.NewRecorder()
	manejador := http.HandlerFunc(servidor.manejarUsuarios)
	manejador.ServeHTTP(respuestaRecorder, peticion)

	// Verificar código de estado
	if codigo := respuestaRecorder.Code; codigo != http.StatusOK {
		t.Errorf("Código de estado incorrecto: obtenido %v, esperado %v", codigo, http.StatusOK)
	}

	// Verificar respuesta JSON
	var respuesta RespuestaJSON
	if err := json.Unmarshal(respuestaRecorder.Body.Bytes(), &respuesta); err != nil {
		t.Errorf("Error al decodificar JSON: %v", err)
	}

	if !respuesta.Exitoso {
		t.Errorf("Respuesta debería ser exitosa")
	}
}

// TestMiddlewareCORS prueba que los headers CORS se agregan correctamente
func TestMiddlewareCORS(t *testing.T) {
	servidor := configurarServidorPrueba()
	
	manejadorSimple := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	
	middlewareConCORS := servidor.MiddlewareCORS(manejadorSimple)

	peticion, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	respuestaRecorder := httptest.NewRecorder()
	middlewareConCORS.ServeHTTP(respuestaRecorder, peticion)

	// Verificar headers CORS
	if origen := respuestaRecorder.Header().Get("Access-Control-Allow-Origin"); origen != "*" {
		t.Errorf("Header CORS incorrecto: obtenido %v, esperado %v", origen, "*")
	}

	metodosPermitidos := respuestaRecorder.Header().Get("Access-Control-Allow-Methods")
	if metodosPermitidos == "" {
		t.Errorf("Header Access-Control-Allow-Methods no debería estar vacío")
	}
}

// TestPeticionOPTIONS prueba que las peticiones OPTIONS se manejan correctamente
func TestPeticionOPTIONS(t *testing.T) {
	servidor := configurarServidorPrueba()
	
	manejadorSimple := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound) // No debería llegarse aquí
	})
	
	middlewareConCORS := servidor.MiddlewareCORS(manejadorSimple)

	peticion, err := http.NewRequest("OPTIONS", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	respuestaRecorder := httptest.NewRecorder()
	middlewareConCORS.ServeHTTP(respuestaRecorder, peticion)

	// Las peticiones OPTIONS deberían devolver 200 OK
	if codigo := respuestaRecorder.Code; codigo != http.StatusOK {
		t.Errorf("Código de estado incorrecto para OPTIONS: obtenido %v, esperado %v", codigo, http.StatusOK)
	}
}

// TestObtenerConfiguracionDesdeEntorno prueba la configuración desde variables de entorno
func TestObtenerConfiguracionDesdeEntorno(t *testing.T) {
	// Esta prueba verifica que la función no falle
	configuracion := obtenerConfiguracionDesdeEntorno()
	
	if configuracion.Puerto <= 0 {
		t.Errorf("Puerto debería ser positivo, obtenido: %d", configuracion.Puerto)
	}
	
	if configuracion.DireccionServidor == "" {
		t.Errorf("Dirección del servidor no debería estar vacía")
	}
	
	if configuracion.TiempoEspera <= 0 {
		t.Errorf("Tiempo de espera debería ser positivo, obtenido: %d", configuracion.TiempoEspera)
	}
}