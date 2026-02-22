// Renderer.js - El núcleo gráfico del Jumbo Engine

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.format = null;
    }

    // Paso 1: Encender la maquinaria de WebGPU
    async init() {
        if (!navigator.gpu) {
            throw new Error("WebGPU no soportado en este navegador.");
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("No se encontró tarjeta gráfica.");
        }

        this.device = await adapter.requestDevice();
        this.context = this.canvas.getContext('webgpu');
        this.format = navigator.gpu.getPreferredCanvasFormat();

        // Ajustamos el tamaño interno del canvas a la pantalla retina de iOS
        const pixelRatio = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.clientWidth * pixelRatio;
        this.canvas.height = this.canvas.clientHeight * pixelRatio;

        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: 'premultiplied',
        });

        console.log("🐘 Jumbo Renderer inicializado con éxito.");
    }

    // Paso 2: El bucle infinito que dibuja 60 veces por segundo
    start() {
        const frame = () => {
            // 1. Creamos el "comando" para la GPU
            const commandEncoder = this.device.createCommandEncoder();
            const textureView = this.context.getCurrentTexture().createView();

            // 2. Iniciamos el "Render Pass" (la pasada de dibujo)
            // Por ahora, solo limpia la pantalla a un color sólido.
            const renderPassDescriptor = {
                colorAttachments: [{
                    view: textureView,
                    clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1.0 }, // Color de fondo (azul oscuro)
                    loadOp: 'clear',
                    storeOp: 'store',
                }]
            };

            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
            // AQUÍ IRÁN LOS OBJETOS DEL JUEGO LUEGO
            passEncoder.end();

            // 3. Enviamos el comando a la tarjeta gráfica
            this.device.queue.submit([commandEncoder.finish()]);

            // 4. Pedimos el siguiente fotograma
            requestAnimationFrame(frame);
        };

        // Arrancar el bucle
        requestAnimationFrame(frame);
    }
}
