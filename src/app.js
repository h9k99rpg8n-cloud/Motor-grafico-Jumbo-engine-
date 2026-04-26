import { crearEscenaBase } from './escena.js';
import { crearModelador } from './modelador.js';
import { configurarViewportMovil, esMovil, habilitarGestosPanel, vibrarSuave } from './mobile.js';

configurarViewportMovil();

const canvas = document.getElementById('renderCanvas');
const { engine, scene, camera } = crearEscenaBase(canvas);
const modelador = crearModelador(scene);

const ui = {
  panel: document.getElementById('sidePanel'),
  panelHandle: document.getElementById('panelHandle'),
  workspace: document.getElementById('workspace'),
  togglePanel: document.getElementById('togglePanel'),
  selectionPill: document.getElementById('selectionPill'),
  objectList: document.getElementById('objectList'),
  posX: document.getElementById('posX'),
  posY: document.getElementById('posY'),
  posZ: document.getElementById('posZ'),
  scale: document.getElementById('scale'),
  deleteBtn: document.getElementById('deleteBtn'),
  addBox: document.getElementById('addBox'),
  addSphere: document.getElementById('addSphere'),
  addCylinder: document.getElementById('addCylinder'),
  focusSel: document.getElementById('focusSel'),
  unselect: document.getElementById('unselect'),
  clearAll: document.getElementById('clearAll'),
};

habilitarGestosPanel({
  panel: ui.panel,
  panelHandle: ui.panelHandle,
  togglePanel: ui.togglePanel,
  workspace: ui.workspace,
});

if (esMovil()) {
  ui.panel.classList.remove('open');
  camera.pinchPrecision = 28;
  camera.panningSensibility = 110;
}

function refrescarUI() {
  const sel = modelador.getSeleccionado();
  const objetos = modelador.getObjetos();

  ui.selectionPill.textContent = sel ? `Seleccionado: ${sel.name}` : 'Sin selección';
  ui.objectList.innerHTML = '';

  objetos.forEach((obj) => {
    const row = document.createElement('button');
    row.className = `item ${sel === obj ? 'sel' : ''}`;
    row.innerHTML = `<span>${obj.name}</span><small>${obj.getClassName()}</small>`;
    row.onclick = () => {
      modelador.seleccionar(obj);
      cargarSlidersDesdeSeleccion();
      refrescarUI();
      vibrarSuave();
    };
    ui.objectList.appendChild(row);
  });
}

function cargarSlidersDesdeSeleccion() {
  const s = modelador.getSeleccionado();
  if (!s) return;
  ui.posX.value = s.position.x;
  ui.posY.value = s.position.y;
  ui.posZ.value = s.position.z;
  ui.scale.value = s.scaling.x;
}

function aplicarSliders() {
  modelador.setTransform({
    x: Number(ui.posX.value),
    y: Number(ui.posY.value),
    z: Number(ui.posZ.value),
    scale: Number(ui.scale.value),
  });
  refrescarUI();
}

function onAdd(tipo) {
  modelador.crear(tipo);
  cargarSlidersDesdeSeleccion();
  refrescarUI();
  vibrarSuave();
}

ui.addBox.onclick = () => onAdd('caja');
ui.addSphere.onclick = () => onAdd('esfera');
ui.addCylinder.onclick = () => onAdd('cilindro');
ui.deleteBtn.onclick = () => {
  modelador.eliminarSeleccionado();
  cargarSlidersDesdeSeleccion();
  refrescarUI();
};
ui.clearAll.onclick = () => {
  modelador.limpiar();
  refrescarUI();
};
ui.unselect.onclick = () => {
  modelador.deseleccionar();
  refrescarUI();
};
ui.focusSel.onclick = () => {
  const s = modelador.getSeleccionado();
  if (!s) return;
  camera.setTarget(s.position.clone());
};

[ui.posX, ui.posY, ui.posZ, ui.scale].forEach((input) => {
  input.addEventListener('pointerdown', () => camera.detachControl(canvas));
  input.addEventListener('pointerup', () => camera.attachControl(canvas, true));
  input.addEventListener('input', aplicarSliders);
});

scene.onPointerObservable.add((pointerInfo) => {
  if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERPICK) return;
  const pick = pointerInfo.pickInfo;
  if (pick?.hit && modelador.getObjetos().includes(pick.pickedMesh)) {
    modelador.seleccionar(pick.pickedMesh);
    cargarSlidersDesdeSeleccion();
    refrescarUI();
    return;
  }
  if (esMovil() && !ui.panel.contains(pointerInfo.event.target)) {
    modelador.deseleccionar();
    refrescarUI();
  }
});

modelador.crear('caja');
modelador.crear('esfera');
cargarSlidersDesdeSeleccion();
refrescarUI();

engine.runRenderLoop(() => scene.render());
window.addEventListener('resize', () => engine.resize());
