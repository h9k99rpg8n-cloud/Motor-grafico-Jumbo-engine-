export function esMovil() {
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 880;
}

export function configurarViewportMovil() {
  const setAppHeight = () => {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  };

  setAppHeight();
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);

  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
}

export function vibrarSuave() {
  if (typeof navigator.vibrate === 'function') navigator.vibrate(12);
}

export function habilitarGestosPanel({ panel, panelHandle, togglePanel, workspace }) {
  if (!panel || !panelHandle || !togglePanel) return;

  let startY = 0;
  panelHandle.addEventListener('pointerdown', (e) => {
    startY = e.clientY;
  });

  panelHandle.addEventListener('pointerup', (e) => {
    const delta = e.clientY - startY;
    if (delta > 25) panel.classList.remove('open');
    if (delta < -25) panel.classList.add('open');
  });

  togglePanel.addEventListener('click', () => panel.classList.toggle('open'));

  workspace?.addEventListener('pointerdown', (e) => {
    if (!esMovil()) return;
    const clickedInsidePanel = panel.contains(e.target);
    if (!clickedInsidePanel && panel.classList.contains('open')) {
      panel.classList.remove('open');
    }
  });
}
