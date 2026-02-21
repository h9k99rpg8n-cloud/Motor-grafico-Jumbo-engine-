/**
 * Núcleo inicial del motor Jumbo Visual v1.0.
 * - Loop profesional con requestAnimationFrame + delta time
 * - Input táctil optimizado para móvil
 * - Render de un objeto de prueba
 * - Resize automático fullscreen (incluyendo cambios de orientación)
 */
(() => {
  'use strict';

  class TouchInput {
    constructor(target) {
      this.target = target;
      this.activeTouches = new Map();
      this.primary = { x: 0, y: 0, isDown: false };

      // Bind para evitar recreación de funciones en cada frame.
      this.onStart = this.onStart.bind(this);
      this.onMove = this.onMove.bind(this);
      this.onEnd = this.onEnd.bind(this);

      // preventDefault requiere passive: false en iOS Safari.
      const options = { passive: false };
      target.addEventListener('touchstart', this.onStart, options);
      target.addEventListener('touchmove', this.onMove, options);
      target.addEventListener('touchend', this.onEnd, options);
      target.addEventListener('touchcancel', this.onEnd, options);
    }

    cacheTouches(touches) {
      for (let i = 0; i < touches.length; i += 1) {
        const touch = touches[i];
        this.activeTouches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
      }

      const firstTouch = this.activeTouches.values().next().value;
      if (firstTouch) {
        this.primary.x = firstTouch.x;
        this.primary.y = firstTouch.y;
        this.primary.isDown = true;
      } else {
        this.primary.isDown = false;
      }
    }

    removeTouches(changedTouches) {
      for (let i = 0; i < changedTouches.length; i += 1) {
        this.activeTouches.delete(changedTouches[i].identifier);
      }

      const firstTouch = this.activeTouches.values().next().value;
      if (firstTouch) {
        this.primary.x = firstTouch.x;
        this.primary.y = firstTouch.y;
        this.primary.isDown = true;
      } else {
        this.primary.isDown = false;
      }
    }

    onStart(event) {
      event.preventDefault();
      this.cacheTouches(event.changedTouches);
    }

    onMove(event) {
      event.preventDefault();
      this.cacheTouches(event.changedTouches);
    }

    onEnd(event) {
      event.preventDefault();
      this.removeTouches(event.changedTouches);
    }
  }

  class JumboEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      this.dpr = Math.max(1, window.devicePixelRatio || 1);
      this.lastTime = performance.now();
      this.elapsed = 0;
      this.isRunning = false;

      this.input = new TouchInput(canvas);

      this.handleResize = this.handleResize.bind(this);
      this.loop = this.loop.bind(this);

      this.handleResize();
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('orientationchange', this.handleResize);
    }

    handleResize() {
      // Visual viewport mejora consistencia en iPhone con barra de dirección dinámica.
      const viewport = window.visualViewport;
      const width = Math.floor((viewport?.width ?? window.innerWidth));
      const height = Math.floor((viewport?.height ?? window.innerHeight));

      this.dpr = Math.max(1, window.devicePixelRatio || 1);
      this.canvas.width = Math.floor(width * this.dpr);
      this.canvas.height = Math.floor(height * this.dpr);

      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop);
    }

    loop(now) {
      if (!this.isRunning) return;

      const rawDelta = (now - this.lastTime) / 1000;
      const deltaTime = Math.min(rawDelta, 0.05); // clamp para evitar saltos grandes
      this.lastTime = now;
      this.elapsed += deltaTime;

      this.update(deltaTime);
      this.render();

      requestAnimationFrame(this.loop);
    }

    update() {
      // Hook para sistemas futuros (física, animación, etc.)
    }

    render() {
      const width = this.canvas.width / this.dpr;
      const height = this.canvas.height / this.dpr;

      // Fondo
      this.ctx.fillStyle = '#10141f';
      this.ctx.fillRect(0, 0, width, height);

      // Objeto de prueba: orbita suave si no hay toque,
      // o sigue el dedo principal si hay input táctil.
      const radius = 30;
      const autoX = width * 0.5 + Math.cos(this.elapsed * 1.4) * (width * 0.2);
      const autoY = height * 0.5 + Math.sin(this.elapsed * 1.9) * (height * 0.12);

      const x = this.input.primary.isDown ? this.input.primary.x : autoX;
      const y = this.input.primary.isDown ? this.input.primary.y : autoY;

      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#4ec9ff';
      this.ctx.fill();

      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#b7f0ff';
      this.ctx.stroke();
    }
  }

  const canvas = document.getElementById('engine-canvas');
  if (!canvas) {
    throw new Error('No se encontró #engine-canvas en el DOM.');
  }

  const engine = new JumboEngine(canvas);
  engine.start();
})();
