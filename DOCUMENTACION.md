# Servidor HTTP en Go - Documentación Completa

Este proyecto proporciona un servidor HTTP completo implementado en Go con todas las variables, métodos y mensajes en español.

## Características Principales

- ✅ **Nombres en Español**: Todas las variables, métodos e identificadores están en español
- 🌐 **API RESTful**: Endpoints para manejo de usuarios con operaciones CRUD
- 📝 **Middleware**: Sistema de logging y CORS incorporado
- 🛡️ **Validación**: Validación de datos de entrada y manejo de errores
- ⚡ **Rendimiento**: Configuración de timeouts y optimización
- 📊 **Monitoreo**: Endpoint de salud para verificar el estado del servidor

## Instalación y Configuración

### Requisitos Previos
- Go 1.19 o superior
- Puerto 8080 disponible (configurable)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/patterson-io/the-joker.git
cd the-joker

# Inicializar módulo Go (si es necesario)
go mod init github.com/patterson-io/the-joker

# Ejecutar el servidor
go run servidor.go
```

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `PUERTO` | Puerto donde se ejecuta el servidor | `8080` |
| `DIRECCION` | Dirección IP del servidor | `localhost` |
| `TIEMPO_ESPERA` | Timeout en segundos para read/write | `30` |

### Ejemplo de Configuración

```bash
# Configurar variables de entorno
export PUERTO=3000
export DIRECCION=0.0.0.0
export TIEMPO_ESPERA=60

# Ejecutar servidor
go run servidor.go
```

## Endpoints de la API

### 1. Endpoint Principal
**GET** `/`

Devuelve información general del servidor y endpoints disponibles.

**Respuesta de Ejemplo:**
```json
{
  "exitoso": true,
  "mensaje": "¡Bienvenido al servidor HTTP en español!",
  "datos": {
    "version": "1.0.0",
    "descripcion": "Servidor HTTP completo con documentación en español",
    "endpoints_disponibles": [
      "/",
      "/usuarios", 
      "/usuarios/{id}",
      "/salud",
      "/estado"
    ]
  }
}
```

### 2. Verificación de Salud
**GET** `/salud`

Verifica el estado del servidor.

**Respuesta de Ejemplo:**
```json
{
  "exitoso": true,
  "mensaje": "El servidor está funcionando correctamente",
  "datos": {
    "tiempo_servidor": "2024-01-15 14:30:25",
    "estado": "saludable"
  }
}
```

### 3. Gestión de Usuarios

#### Obtener Todos los Usuarios
**GET** `/usuarios`

**Respuesta de Ejemplo:**
```json
{
  "exitoso": true,
  "mensaje": "Se encontraron 2 usuarios",
  "datos": [
    {
      "id": 1,
      "nombre": "María García",
      "email": "maria@ejemplo.com",
      "fecha_creado": "2024-01-15 14:25:10"
    },
    {
      "id": 2,
      "nombre": "Carlos López",
      "email": "carlos@ejemplo.com", 
      "fecha_creado": "2024-01-15 14:28:45"
    }
  ]
}
```

#### Crear Nuevo Usuario
**POST** `/usuarios`

**Cuerpo de la Petición:**
```json
{
  "nombre": "Ana Martínez",
  "email": "ana@ejemplo.com"
}
```

**Respuesta de Ejemplo:**
```json
{
  "exitoso": true,
  "mensaje": "Usuario creado exitosamente",
  "datos": {
    "id": 3,
    "nombre": "Ana Martínez", 
    "email": "ana@ejemplo.com",
    "fecha_creado": "2024-01-15 14:35:20"
  }
}
```

#### Obtener Usuario por ID
**GET** `/usuarios/{id}`

**Respuesta de Ejemplo:**
```json
{
  "exitoso": true,
  "mensaje": "Usuario encontrado",
  "datos": {
    "id": 1,
    "nombre": "María García",
    "email": "maria@ejemplo.com",
    "fecha_creado": "2024-01-15 14:25:10"
  }
}
```

## Ejemplos de Uso con cURL

### Verificar Estado del Servidor
```bash
curl -X GET http://localhost:8080/salud
```

### Crear un Nuevo Usuario
```bash
curl -X POST http://localhost:8080/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Roberto Silva",
    "email": "roberto@ejemplo.com"
  }'
```

### Obtener Todos los Usuarios
```bash
curl -X GET http://localhost:8080/usuarios
```

### Obtener Usuario Específico
```bash
curl -X GET http://localhost:8080/usuarios/1
```

## Ejemplos de Uso con JavaScript

### Cliente Básico con Fetch API

```javascript
// Configuración base
const urlBase = 'http://localhost:8080';

// Clase para interactuar con la API
class ClienteAPI {
  constructor(urlServidor) {
    this.urlBase = urlServidor;
  }

  async realizarPeticion(endpoint, opciones = {}) {
    try {
      const respuesta = await fetch(`${this.urlBase}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...opciones.headers
        },
        ...opciones
      });

      const datos = await respuesta.json();
      return datos;
    } catch (error) {
      console.error('Error en petición:', error);
      throw error;
    }
  }

  async verificarSalud() {
    return await this.realizarPeticion('/salud');
  }

  async obtenerUsuarios() {
    return await this.realizarPeticion('/usuarios');
  }

  async crearUsuario(datosUsuario) {
    return await this.realizarPeticion('/usuarios', {
      method: 'POST',
      body: JSON.stringify(datosUsuario)
    });
  }

  async obtenerUsuarioPorId(id) {
    return await this.realizarPeticion(`/usuarios/${id}`);
  }
}

// Ejemplo de uso
async function ejemploUso() {
  const cliente = new ClienteAPI('http://localhost:8080');

  try {
    // Verificar salud del servidor
    const salud = await cliente.verificarSalud();
    console.log('Estado del servidor:', salud);

    // Crear nuevo usuario
    const nuevoUsuario = {
      nombre: 'Elena Rodríguez',
      email: 'elena@ejemplo.com'
    };
    
    const usuarioCreado = await cliente.crearUsuario(nuevoUsuario);
    console.log('Usuario creado:', usuarioCreado);

    // Obtener todos los usuarios
    const usuarios = await cliente.obtenerUsuarios();
    console.log('Todos los usuarios:', usuarios);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar ejemplo
ejemploUso();
```

## Estructura del Código

### Tipos Principales

```go
// Configuración del servidor
type Configuracion struct {
    Puerto            int    `json:"puerto"`
    DireccionServidor string `json:"direccion_servidor"`
    TiempoEspera      int    `json:"tiempo_espera_segundos"`
}

// Respuesta JSON estándar
type RespuestaJSON struct {
    Exitoso bool        `json:"exitoso"`
    Mensaje string      `json:"mensaje"`
    Datos   interface{} `json:"datos,omitempty"`
    Error   string      `json:"error,omitempty"`
}

// Modelo de usuario
type Usuario struct {
    ID       int    `json:"id"`
    Nombre   string `json:"nombre"`
    Email    string `json:"email"`
    Creado   string `json:"fecha_creado"`
}
```

### Middleware Disponible

1. **MiddlewareRegistro**: Registra todas las peticiones HTTP con timestamps
2. **MiddlewareCORS**: Agrega headers CORS para permitir peticiones cross-origin

## Manejo de Errores

El servidor proporciona respuestas de error consistentes en español:

```json
{
  "exitoso": false,
  "error": "Descripción del error en español"
}
```

### Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| 400 | Datos de entrada inválidos |
| 404 | Recurso no encontrado |
| 405 | Método HTTP no permitido |
| 500 | Error interno del servidor |

## Logging

El servidor incluye logging detallado:

```
[2024-01-15 14:30:25] GET / - Iniciando petición
[2024-01-15 14:30:25] GET / - Completado en 2.456ms
```

## Consideraciones de Seguridad

- ✅ Validación de entrada de datos
- ✅ Headers CORS configurables
- ✅ Timeouts configurados para prevenir ataques DoS
- ✅ Logging de todas las peticiones para auditoría

## Extensiones Futuras

- [ ] Autenticación JWT
- [ ] Base de datos persistente
- [ ] Rate limiting
- [ ] Métricas de rendimiento
- [ ] Documentación OpenAPI/Swagger

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b nueva-caracteristica`
3. Mantén las convenciones de nombres en español
4. Agrega tests para nuevas funcionalidades
5. Envía un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

---

¿Por qué los programadores prefieren el dark mode? ¡Porque la luz atrae bugs!