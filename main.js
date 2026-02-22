// main.js - El punto de entrada de tu juego
// Importamos la clase Renderer desde el otro archivo
import { Renderer } from './Renderer.js';

async function iniciarJumbo() {
    // 1. Buscamos el lienzo en el HTML
    const canvas = document.getElementById('jumbo-canvas');

    // 2. Creamos una nueva instancia del motor gráfico
    const engine = new Renderer(canvas);

    try {
        // 3. Intentamos encenderlo
        console.log("Iniciando sistemas...");
        await engine.init();

        // 4. Si todo sale bien, arrancamos el bucle de dibujo
        console.log("Sistemas listos. Arrancando motor.");
        engine.start();

    } catch (error) {
        // Si algo falla (ej. no hay WebGPU), lo mostramos en la pantalla
        document.body.innerHTML = `<h1 style="color:red; text-align:center; margin-top:50px;">❌ Error: ${error.message}</h1>`;
        console.error(error);
    }
}

// Ejecutamos la función principal
iniciarJumbo();
