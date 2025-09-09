# The Joker - Servidor HTTP en Go

Un servidor HTTP completo implementado en Go con documentación y ejemplos comprehensivos. Todas las variables, métodos e identificadores están nombrados en español siguiendo las mejores prácticas.

## 🚀 Características

- ✅ **Código en Español**: Variables, métodos e identificadores en español
- 🌐 **API RESTful**: Endpoints completos para gestión de usuarios
- 📝 **Middleware**: Sistema de logging y CORS incorporado
- 🛡️ **Validación**: Validación robusta de datos de entrada
- ⚡ **Rendimiento**: Configuración optimizada con timeouts
- 📊 **Monitoreo**: Endpoint de salud para verificación de estado
- 🧪 **Testing**: Suite completa de tests unitarios
- 📚 **Documentación**: Documentación exhaustiva con ejemplos

## 📦 Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/patterson-io/the-joker.git
cd the-joker

# Ejecutar el servidor
go run servidor.go

# Ejecutar el cliente de ejemplo
cd ejemplos && go run cliente_ejemplo.go

# Ejecutar tests
go test -v

# O usar el Makefile para comandos automatizados
make ayuda       # Ver todos los comandos disponibles
make validar     # Ejecutar validaciones completas
make ejecutar    # Iniciar el servidor
make ejemplo     # Ejecutar cliente de ejemplo
```

## 📖 Documentación

- [Documentación Completa](DOCUMENTACION.md) - Guía detallada con ejemplos de uso
- [Especificación OpenAPI](api-specification.yaml) - Especificación completa de la API
- [Código del Servidor](servidor.go) - Implementación principal del servidor HTTP
- [Cliente de Ejemplo](ejemplos/cliente_ejemplo.go) - Ejemplos prácticos de uso de la API
- [Tests](servidor_test.go) - Suite de tests unitarios
- [Makefile](Makefile) - Comandos automatizados para desarrollo

## 🎯 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información general del servidor |
| GET | `/salud` | Verificación de estado del servidor |
| GET | `/usuarios` | Obtener todos los usuarios |
| POST | `/usuarios` | Crear nuevo usuario |
| GET | `/usuarios/{id}` | Obtener usuario por ID |

## 🔧 Configuración

El servidor se puede configurar mediante variables de entorno:

```bash
export PUERTO=8080                # Puerto del servidor (default: 8080)
export DIRECCION=localhost        # Dirección IP (default: localhost)  
export TIEMPO_ESPERA=30          # Timeout en segundos (default: 30)
```

## 📝 Ejemplo de Uso

```bash
# Verificar estado del servidor
curl http://localhost:8080/salud

# Crear un usuario
curl -X POST http://localhost:8080/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre": "María García", "email": "maria@ejemplo.com"}'

# Obtener todos los usuarios
curl http://localhost:8080/usuarios
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
go test -v

# Ejecutar tests con coverage
go test -cover -v

# Test específico
go test -run TestManejarInicio -v
```

## 🏗️ Arquitectura del Código

```
.
├── servidor.go              # Servidor HTTP principal con lógica de negocio
├── servidor_test.go         # Tests unitarios completos
├── ejemplos/
│   └── cliente_ejemplo.go   # Cliente de ejemplo para demostrar uso
├── DOCUMENTACION.md         # Documentación detallada con ejemplos
├── api-specification.yaml   # Especificación OpenAPI 3.0 completa
├── Makefile                # Comandos automatizados para desarrollo
├── README.md               # Este archivo
└── go.mod                  # Módulo Go
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Mantén las convenciones de nombres en español
2. Agrega tests para nuevas funcionalidades  
3. Actualiza la documentación según sea necesario
4. Sigue las mejores prácticas de Go

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

¿Qué le dijo un array a otro array? ¡Null-o que verte!