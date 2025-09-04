# The Joker - Servidor HTTP en Español

Este repositorio contiene configuraciones de agentes y ejemplos de código siguiendo las convenciones del agente español.

## Ejemplo: Servidor HTTP "Hola Mundo"

A continuación se muestra un ejemplo completo de cómo crear un servidor HTTP que responde con "Hola Mundo" usando Node.js, siguiendo las convenciones de nomenclatura en español.

### Código del Servidor

```javascript
// servidor_http.js
const http = require('http');

// Configuración del servidor
const configuracionServidor = {
    puerto: 3000,
    host: 'localhost'
};

// Método para crear respuesta de saludo
function crearRespuestaSaludo(solicitud, respuesta) {
    const mensajeHolaMundo = 'Hola Mundo desde el servidor HTTP en español!';
    const fechaActual = new Date().toLocaleDateString('es-ES');
    
    const cuerpoRespuesta = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Servidor HTTP en Español</title>
    </head>
    <body>
        <h1>${mensajeHolaMundo}</h1>
        <p>Fecha actual: ${fechaActual}</p>
        <p>URL solicitada: ${solicitud.url}</p>
        <p>Método HTTP: ${solicitud.method}</p>
    </body>
    </html>
    `;
    
    respuesta.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Language': 'es'
    });
    respuesta.end(cuerpoRespuesta);
}

// Método para manejar errores del servidor
function manejarErrorServidor(error) {
    console.error('Error en el servidor:', error.message);
    if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${configuracionServidor.puerto} ya está en uso`);
    } else {
        console.error('Error desconocido del servidor');
    }
}

// Crear y configurar el servidor HTTP
const servidorHttp = http.createServer(crearRespuestaSaludo);

// Configurar manejo de errores
servidorHttp.on('error', manejarErrorServidor);

// Iniciar el servidor
function iniciarServidor() {
    servidorHttp.listen(configuracionServidor.puerto, configuracionServidor.host, () => {
        console.log(`Servidor HTTP iniciado exitosamente`);
        console.log(`Dirección: http://${configuracionServidor.host}:${configuracionServidor.puerto}`);
        console.log('Presiona Ctrl+C para detener el servidor');
    });
}

// Manejar cierre graceful del servidor
process.on('SIGTERM', () => {
    console.log('Cerrando servidor HTTP...');
    servidorHttp.close(() => {
        console.log('Servidor HTTP cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nRecibida señal de interrupción, cerrando servidor...');
    servidorHttp.close(() => {
        console.log('Servidor HTTP cerrado correctamente');
        process.exit(0);
    });
});

// Exportar para uso como módulo
module.exports = {
    servidorHttp,
    iniciarServidor,
    configuracionServidor
};

// Iniciar servidor si se ejecuta directamente
if (require.main === module) {
    iniciarServidor();
}
```

### Ejemplo Avanzado con Express

Para un servidor más robusto usando Express:

```javascript
// servidor_express.js
const express = require('express');
const path = require('path');

// Crear aplicación Express
const aplicacionExpress = express();
const puertoServidor = process.env.PUERTO || 3000;

// Configuración de middleware
aplicacionExpress.use(express.json());
aplicacionExpress.use(express.urlencoded({ extended: true }));

// Método para generar respuesta de saludo
function generarRespuestaSaludo(solicitud, respuesta) {
    const datosRespuesta = {
        mensaje: 'Hola Mundo desde Express en español!',
        fechaHora: new Date().toLocaleString('es-ES'),
        rutaSolicitada: solicitud.path,
        metodoHttp: solicitud.method,
        agentUsuario: solicitud.get('User-Agent') || 'No especificado'
    };
    
    respuesta.json(datosRespuesta);
}

// Método para manejar página principal
function manejarPaginaPrincipal(solicitud, respuesta) {
    const paginaHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Servidor Express en Español</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .informacion { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>¡Hola Mundo desde Express!</h1>
        <div class="informacion">
            <h2>Información del Servidor</h2>
            <p><strong>Estado:</strong> Funcionando correctamente</p>
            <p><strong>Puerto:</strong> ${puertoServidor}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
        <h2>Rutas Disponibles</h2>
        <ul>
            <li><a href="/api/saludo">GET /api/saludo</a> - Respuesta JSON</li>
            <li><a href="/estado">GET /estado</a> - Estado del servidor</li>
        </ul>
    </body>
    </html>
    `;
    
    respuesta.send(paginaHtml);
}

// Método para verificar estado del servidor
function verificarEstadoServidor(solicitud, respuesta) {
    const estadoServidor = {
        estado: 'activo',
        tiempoFuncionamiento: process.uptime(),
        memoria: process.memoryUsage(),
        version: process.version
    };
    
    respuesta.json(estadoServidor);
}

// Definir rutas
aplicacionExpress.get('/', manejarPaginaPrincipal);
aplicacionExpress.get('/api/saludo', generarRespuestaSaludo);
aplicacionExpress.get('/estado', verificarEstadoServidor);

// Manejar rutas no encontradas
aplicacionExpress.use((solicitud, respuesta) => {
    respuesta.status(404).json({
        error: 'Ruta no encontrada',
        mensaje: `La ruta ${solicitud.path} no existe en este servidor`,
        codigoEstado: 404
    });
});

// Manejar errores del servidor
aplicacionExpress.use((error, solicitud, respuesta, siguiente) => {
    console.error('Error en el servidor:', error);
    respuesta.status(500).json({
        error: 'Error interno del servidor',
        mensaje: 'Ha ocurrido un error inesperado',
        codigoEstado: 500
    });
});

// Iniciar servidor Express
function iniciarServidorExpress() {
    aplicacionExpress.listen(puertoServidor, () => {
        console.log(`Servidor Express iniciado en puerto ${puertoServidor}`);
        console.log(`Visita: http://localhost:${puertoServidor}`);
    });
}

// Exportar aplicación
module.exports = {
    aplicacionExpress,
    iniciarServidorExpress
};

// Iniciar si se ejecuta directamente
if (require.main === module) {
    iniciarServidorExpress();
}
```

## Instrucciones de Uso

### Requisitos Previos
- Node.js versión 12 o superior instalado
- Para el ejemplo con Express: `npm install express`

### Ejecución del Servidor Básico

```bash
# Guardar el código como servidor_http.js
node servidor_http.js
```

### Ejecución del Servidor Express

```bash
# Instalar dependencias
npm install express

# Guardar el código como servidor_express.js
node servidor_express.js
```

### Verificación

Una vez iniciado el servidor, abre tu navegador y visita:
- `http://localhost:3000` - Página principal
- `http://localhost:3000/api/saludo` - Respuesta JSON con saludo
- `http://localhost:3000/estado` - Estado del servidor

## Características del Código

- **Nomenclatura en español**: Todas las variables, métodos e identificadores están en español
- **Mensajes en español**: Todos los strings, errores y respuestas están en español
- **Manejo de errores**: Incluye manejo robusto de errores con mensajes descriptivos
- **Documentación**: Comentarios y documentación en español
- **Cierre graceful**: Manejo adecuado de señales de sistema para cerrar el servidor
- **Configuración flexible**: Fácil configuración de puerto y host
- **Respuestas HTML**: Incluye respuestas tanto en JSON como HTML

## Agentes Disponibles

Este repositorio incluye las siguientes configuraciones de agentes:

- **Spanish**: Nomenclatura y mensajes en español (usado en este ejemplo)
- **JavaScript Pro**: Especialista en JavaScript moderno y programación asíncrona

¡Explora los diferentes agentes en el directorio `.github/agents/` para más información!