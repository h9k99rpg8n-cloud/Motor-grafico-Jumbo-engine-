export function crearEscenaBase(canvas) {
  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  }, true);

  if (window.matchMedia('(pointer: coarse)').matches) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    engine.setHardwareScalingLevel(1 / ratio);
  }

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.02, 0.05, 0.11, 1);

  const camera = new BABYLON.ArcRotateCamera(
    'camara',
    -Math.PI / 2,
    Math.PI / 3,
    18,
    new BABYLON.Vector3(0, 2, 0),
    scene,
  );

  camera.lowerRadiusLimit = 6;
  camera.upperRadiusLimit = 42;
  camera.wheelDeltaPercentage = 0.01;
  camera.panningSensibility = 60;
  camera.touchAngularSensibility = 3800;
  camera.touchMoveSensibility = 210;
  camera.attachControl(canvas, true);

  const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(1, 1, 0), scene);
  hemi.intensity = 0.85;

  const dir = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(-0.4, -1, -0.2), scene);
  dir.position = new BABYLON.Vector3(8, 14, 8);
  dir.intensity = 0.7;

  const ground = BABYLON.MeshBuilder.CreateGround('suelo', { width: 60, height: 60 }, scene);
  const groundMat = new BABYLON.StandardMaterial('sueloMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.12, 0.16, 0.22);
  groundMat.specularColor = BABYLON.Color3.Black();
  ground.material = groundMat;

  return { engine, scene, camera };
}
