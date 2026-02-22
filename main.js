// main.js - El controlador del Launcher y el Motor
import { Renderer } from './Renderer.js';

// Variables de la interfaz
const launcher = document.getElementById('launcher');
const canvas = document.getElementById('jumbo-canvas');
const btnNuevo = document.getElementById('btn-nuevo');
const btnSalir = document.getElementById('btn-salir');

// Instancia del motor (apagada al principio)
let engine = null;

// Cuando tocamos "Nuevo Proyecto"
btnNuevo.addEventListener('click', async () => {
    // 1. Ocultar el launcher con una animación
    launcher.style.opacity = '0';
    setTimeout(() => { launcher.style.display = 'none'; }, 500);

    // 2. Mostrar el lienzo de la gráfica y el botón de salir
    canvas.style.display = 'block';
    btnSalir.style.display = 'block';

    // 3. Encender el motor Jumbo solo si no estaba encendido ya
    if (!engine) {
        engine = new Renderer(canvas);
        try {
            console.log("🐘 Arrancando Jumbo Engine...");
            await engine.init();
            engine.start();
        } catch (error) {
            alert("Error al cargar la tarjeta gráfica: " + error.message);
        }
    }
});

// Cuando tocamos "Salir" para volver al Launcher
btnSalir.addEventListener('click', () => {
    // Escondemos el juego
    canvas.style.display = 'none';
    btnSalir.style.display = 'none';
    
    // Mostramos el menú
    launcher.style.display = 'flex';
    setTimeout(() => { launcher.style.opacity = '1'; }, 50);
});
