// Agente Español Test
// Este archivo demuestra el uso de identificadores en español según el agente Español

/**
 * Ejemplo de código JavaScript con nombres en español
 * Todas las variables, métodos e identificadores están en español
 */

class ProcesadorDeDatos {
    constructor(urlApi) {
        this.urlApi = urlApi;
        this.cacheDeDatos = new Map();
        this.configuracion = {
            tiempoEspera: 5000,
            intentosMaximos: 3
        };
    }

    async obtenerDatosUsuario(idUsuario) {
        try {
            if (this.cacheDeDatos.has(idUsuario)) {
                return this.cacheDeDatos.get(idUsuario);
            }

            const respuesta = await fetch(`${this.urlApi}/usuarios/${idUsuario}`);
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: estado ${respuesta.status}`);
            }

            const datosUsuario = await respuesta.json();
            
            const datosProcessados = {
                id: datosUsuario.id,
                nombre: datosUsuario.nombre,
                correoElectronico: datosUsuario.correoElectronico,
                fechaCreacion: datosUsuario.fechaCreacion,
                estaActivo: datosUsuario.estaActivo
            };

            this.cacheDeDatos.set(idUsuario, datosProcessados);
            return datosProcessados;

        } catch (error) {
            console.error('Error al obtener datos del usuario en español:', error.message);
            throw new Error(`No se pudieron obtener los datos del usuario en español: ${error.message}`);
        }
    }

    async procesarListaUsuarios(listaIds) {
        const resultados = [];
        
        for (const idUsuario of listaIds) {
            try {
                const datosUsuario = await this.obtenerDatosUsuario(idUsuario);
                resultados.push({
                    exito: true,
                    datos: datosUsuario
                });
            } catch (error) {
                resultados.push({
                    exito: false,
                    idUsuario,
                    mensajeError: `Error en español: ${error.message}`
                });
            }
        }
        
        return resultados;
    }

    obtenerEstadisticasCache() {
        return {
            totalElementos: this.cacheDeDatos.size,
            claves: Array.from(this.cacheDeDatos.keys()),
            memoria: JSON.stringify(Array.from(this.cacheDeDatos.entries())).length
        };
    }

    limpiarCache() {
        const elementosEliminados = this.cacheDeDatos.size;
        this.cacheDeDatos.clear();
        console.log(`Se eliminaron ${elementosEliminados} elementos del caché`);
        return elementosEliminados;
    }
}

// Función auxiliar en español
const validarCorreoElectronico = (correo) => {
    const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patronCorreo.test(correo);
};

const formatearNombreCompleto = (nombre, apellido) => {
    if (!nombre || !apellido) {
        throw new Error('El nombre y apellido son requeridos en español');
    }
    return `${apellido.toUpperCase()}, ${nombre}`;
};

// Exportaciones del módulo
export { ProcesadorDeDatos, validarCorreoElectronico, formatearNombreCompleto };
export default ProcesadorDeDatos;