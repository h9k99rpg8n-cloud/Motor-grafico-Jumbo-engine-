function materialAleatorio(scene) {
  const mat = new BABYLON.StandardMaterial(`mat_${Date.now()}`, scene);
  mat.diffuseColor = new BABYLON.Color3(Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2);
  mat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
  return mat;
}

export function crearModelador(scene) {
  const objetos = [];
  let seleccionado = null;
  let contador = 0;

  const crear = (tipo) => {
    contador += 1;
    const nombre = `${tipo}_${String(contador).padStart(2, '0')}`;
    let mesh = null;

    if (tipo === 'caja') mesh = BABYLON.MeshBuilder.CreateBox(nombre, { size: 1.5 }, scene);
    if (tipo === 'esfera') mesh = BABYLON.MeshBuilder.CreateSphere(nombre, { diameter: 1.5, segments: 24 }, scene);
    if (tipo === 'cilindro') mesh = BABYLON.MeshBuilder.CreateCylinder(nombre, { height: 2, diameter: 1.2 }, scene);
    if (!mesh) return null;

    mesh.position = new BABYLON.Vector3((Math.random() - 0.5) * 6, 1.1, (Math.random() - 0.5) * 6);
    mesh.material = materialAleatorio(scene);
    objetos.push(mesh);
    seleccionar(mesh);
    return mesh;
  };

  const seleccionar = (mesh) => {
    seleccionado = mesh;
    objetos.forEach((o) => {
      if (o.renderOutline) o.renderOutline = false;
    });

    if (seleccionado) {
      seleccionado.outlineColor = BABYLON.Color3.White();
      seleccionado.outlineWidth = 0.05;
      seleccionado.renderOutline = true;
    }
  };

  const deseleccionar = () => {
    if (seleccionado?.renderOutline) seleccionado.renderOutline = false;
    seleccionado = null;
  };

  const eliminarSeleccionado = () => {
    if (!seleccionado) return;
    const idx = objetos.findIndex((o) => o === seleccionado);
    if (idx >= 0) objetos.splice(idx, 1);
    seleccionado.dispose();
    seleccionar(objetos[objetos.length - 1] || null);
  };

  const limpiar = () => {
    while (objetos.length) {
      const o = objetos.pop();
      o.dispose();
    }
    seleccionado = null;
  };

  const setTransform = ({ x, y, z, scale }) => {
    if (!seleccionado) return;
    seleccionado.position.set(x, y, z);
    seleccionado.scaling.set(scale, scale, scale);
  };

  return {
    crear,
    seleccionar,
    deseleccionar,
    eliminarSeleccionado,
    limpiar,
    setTransform,
    getSeleccionado: () => seleccionado,
    getObjetos: () => objetos,
  };
}
