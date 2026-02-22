import { Renderer } from './Renderer.js';

const launcher = document.getElementById('launcher');
const canvas = document.getElementById('jumbo-canvas');
const panelNuevo = document.getElementById('panel-nuevo');

// Los nuevos inputs del formulario 0.3
const inputNombre = document.getElementById('input-nombre');
const inputDesc = document.getElementById('input-desc');
const contadorJuegos = document.getElementById('contador-juegos');

const btnNuevo = document.getElementById('btn-nuevo');
const btnSalirForm = document.getElementById('btn-salir-form');
const btnCrearFinal = document.getElementById('btn-crear-final');
const btnSalirEditor = document.getElementById('btn-salir-editor');

let engine = null;
let misProyectos = JSON.parse(localStorage.getItem('jumbo_proyectos')) || [];

contadorJuegos.innerText = misProyectos.length;

// --- SISTEMA DE AUDIO UI ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function reproducirClic() {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// 1. Tocar "Nuevo Proyecto"
btnNuevo.addEventListener('click', () => {
    reproducirClic();
    panelNuevo.style.display = 'block';
    inputNombre.focus();
});

// 2. Tocar "Salir" en el formulario
btnSalirForm.addEventListener('click', () => {
    reproducirClic();
    panelNuevo.style.display = 'none';
    inputNombre.value = '';
    inputDesc.value = '';
});

// 3. Tocar "Crear" (Guarda nombre y descripción, y lanza el editor)
btnCrearFinal.addEventListener('click', async () => {
    reproducirClic();
    const nombre = inputNombre.value || "Juego Sin Nombre";
    const descripcion = inputDesc.value || "Sin descripción";

    // Guardamos toda la información en la memoria del celular
    misProyectos.push({
        id: Date.now(),
        nombre: nombre,
        descripcion: descripcion
    });
    localStorage.setItem('jumbo_proyectos', JSON.stringify(misProyectos));
    contadorJuegos.innerText = misProyectos.length;

    // Escondemos el menú y el formulario
    panelNuevo.style.display = 'none';
    launcher.style.opacity = '0';
    setTimeout(() => { launcher.style.display = 'none'; }, 400);

    // Mostramos la pantalla de WebGPU
    canvas.style.display = 'block';
    btnSalirEditor.style.display = 'block';

    // Encendemos el motor gráfico
    if (!engine) {
        engine = new Renderer(canvas);
        try {
            await engine.init();
            engine.start();
        } catch (error) {
            alert("Error WebGPU: " + error.message);
        }
    }

    // Limpiamos el formulario para la próxima vez
    inputNombre.value = '';
    inputDesc.value = '';
});

// 4. Salir del editor
btnSalirEditor.addEventListener('click', () => {
    reproducirClic();
    canvas.style.display = 'none';
    btnSalirEditor.style.display = 'none';

    launcher.style.display = 'flex';
    setTimeout(() => { launcher.style.opacity = '1'; }, 50);
});
