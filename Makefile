# Makefile para el proyecto The Joker - Servidor HTTP en Go

# Variables de configuración
PUERTO ?= 8080
DIRECCION ?= localhost
TIEMPO_ESPERA ?= 30

# Nombre del binario
NOMBRE_BINARIO = servidor-joker

# Rutas importantes
DIRECTORIO_EJEMPLOS = ejemplos
ARCHIVO_SERVIDOR = servidor.go
ARCHIVO_CLIENTE = $(DIRECTORIO_EJEMPLOS)/cliente_ejemplo.go

.PHONY: ayuda construccion ejecutar pruebas limpiar ejemplo salud instalar

# Target por defecto
ayuda: ## Mostrar esta ayuda
	@echo "🎭 The Joker - Servidor HTTP en Go"
	@echo "=================================="
	@echo ""
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

construccion: ## Construir el servidor
	@echo "🔨 Construyendo el servidor..."
	go build -o $(NOMBRE_BINARIO) $(ARCHIVO_SERVIDOR)
	@echo "✅ Servidor construido como '$(NOMBRE_BINARIO)'"

ejecutar: ## Ejecutar el servidor (usar PUERTO=3000 make ejecutar para cambiar puerto)
	@echo "🚀 Iniciando servidor en puerto $(PUERTO)..."
	PUERTO=$(PUERTO) DIRECCION=$(DIRECCION) TIEMPO_ESPERA=$(TIEMPO_ESPERA) go run $(ARCHIVO_SERVIDOR)

pruebas: ## Ejecutar todas las pruebas
	@echo "🧪 Ejecutando pruebas..."
	go test -v

pruebas-coverage: ## Ejecutar pruebas con cobertura
	@echo "🧪 Ejecutando pruebas con cobertura..."
	go test -cover -v

ejemplo: ## Ejecutar el cliente de ejemplo (requiere servidor activo)
	@echo "📱 Ejecutando cliente de ejemplo..."
	cd $(DIRECTORIO_EJEMPLOS) && go run cliente_ejemplo.go

salud: ## Verificar estado del servidor (requiere servidor activo)
	@echo "❤️ Verificando salud del servidor..."
	@curl -s http://$(DIRECCION):$(PUERTO)/salud | jq . || echo "Error: El servidor no está respondiendo o jq no está instalado"

usuarios: ## Mostrar usuarios actuales (requiere servidor activo)
	@echo "👥 Obteniendo usuarios actuales..."
	@curl -s http://$(DIRECCION):$(PUERTO)/usuarios | jq . || echo "Error: El servidor no está respondiendo o jq no está instalado"

crear-usuario: ## Crear usuario de ejemplo (requiere servidor activo)
	@echo "👤 Creando usuario de ejemplo..."
	@curl -s -X POST http://$(DIRECCION):$(PUERTO)/usuarios \
		-H "Content-Type: application/json" \
		-d '{"nombre": "Usuario Ejemplo", "email": "ejemplo@test.com"}' | jq . || echo "Error: No se pudo crear el usuario"

instalar: ## Instalar dependencias y herramientas necesarias
	@echo "📦 Instalando dependencias..."
	go mod tidy
	@echo "ℹ️  Verificando si jq está instalado (opcional para pruebas)..."
	@which jq > /dev/null || echo "⚠️  jq no está instalado. Instala con: sudo apt-get install jq"

limpiar: ## Limpiar archivos generados
	@echo "🧹 Limpiando archivos generados..."
	rm -f $(NOMBRE_BINARIO)
	go clean

validar: ## Ejecutar validaciones completas (construcción, pruebas, linting)
	@echo "✅ Ejecutando validaciones completas..."
	@$(MAKE) construccion
	@$(MAKE) pruebas
	@go vet ./...
	@echo "🎉 Todas las validaciones pasaron exitosamente"

demo-completa: ## Demostración completa del proyecto
	@echo "🎭 Iniciando demostración completa..."
	@echo "1. Construyendo proyecto..."
	@$(MAKE) construccion
	@echo ""
	@echo "2. Ejecutando pruebas..."
	@$(MAKE) pruebas
	@echo ""
	@echo "3. Para ejecutar el servidor: make ejecutar"
	@echo "4. Para probar el cliente: make ejemplo (en otra terminal)"
	@echo "5. Para verificar salud: make salud"
	@echo ""
	@echo "🎉 Demostración preparada. Sigue las instrucciones arriba."

# Target para desarrollo continuo
desarrollo: ## Modo desarrollo con recarga automática (requiere entr)
	@echo "🔄 Modo desarrollo activado. Guardando archivos .go recargará el servidor..."
	@which entr > /dev/null || (echo "Error: entr no instalado. Instala con: sudo apt-get install entr" && exit 1)
	ls *.go | entr -r make ejecutar