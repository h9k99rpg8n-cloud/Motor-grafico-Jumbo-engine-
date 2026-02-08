let jumboEngine = null;

const initJumboEditor = (projectName) => {
  const editorView = document.getElementById("editorView");
  const canvas = document.getElementById("jumboCanvas");
  const exitButton = document.getElementById("exitEditor");
  const projectBadge = document.getElementById("projectBadge");
  const dashboard = document.getElementById("dashboard");
  const mainHeader = document.getElementById("mainHeader");

  if (!canvas || !editorView) {
    return;
  }

  if (jumboEngine) {
    jumboEngine.dispose();
    jumboEngine = null;
  }

  projectBadge.textContent = projectName || "Proyecto";
  editorView.classList.add("is-active");
  editorView.setAttribute("aria-hidden", "false");
  dashboard.classList.add("is-hidden");
  mainHeader.classList.add("is-hidden");

  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: true,
  });
  jumboEngine = engine;

  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera(
    "editorCamera",
    Math.PI / 2,
    Math.PI / 3,
    14,
    new BABYLON.Vector3(0, 1.5, 0),
    scene,
  );
  camera.attachControl(canvas, true);
  camera.wheelPrecision = 50;
  camera.pinchPrecision = 200;
  camera.lowerRadiusLimit = 6;
  camera.upperRadiusLimit = 30;

  const hemiLight = new BABYLON.HemisphericLight(
    "hemiLight",
    new BABYLON.Vector3(0, 1, 0),
    scene,
  );
  hemiLight.intensity = 0.9;

  const dirLight = new BABYLON.DirectionalLight(
    "dirLight",
    new BABYLON.Vector3(-0.3, -1, -0.4),
    scene,
  );
  dirLight.position = new BABYLON.Vector3(6, 12, 6);

  const ground = BABYLON.MeshBuilder.CreateGround(
    "gridGround",
    { width: 100, height: 100 },
    scene,
  );
  ground.receiveShadows = true;
  const gridMaterial = new BABYLON.GridMaterial("gridMaterial", scene);
  gridMaterial.majorUnitFrequency = 5;
  gridMaterial.minorUnitVisibility = 0.45;
  gridMaterial.gridRatio = 1;
  gridMaterial.backFaceCulling = false;
  gridMaterial.mainColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  gridMaterial.lineColor = new BABYLON.Color3(0.45, 0.45, 0.45);
  gridMaterial.opacity = 0.9;
  ground.material = gridMaterial;

  const horizonBox = BABYLON.MeshBuilder.CreateBox(
    "horizonBox",
    { size: 200 },
    scene,
  );
  const gradientTexture = new BABYLON.DynamicTexture(
    "skyGradient",
    { width: 512, height: 512 },
    scene,
  );
  const gradientContext = gradientTexture.getContext();
  const gradient = gradientContext.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#b7dbff");
  gradient.addColorStop(1, "#ffffff");
  gradientContext.fillStyle = gradient;
  gradientContext.fillRect(0, 0, 512, 512);
  gradientTexture.update();

  const skyMaterial = new BABYLON.StandardMaterial("skyMaterial", scene);
  skyMaterial.backFaceCulling = false;
  skyMaterial.disableLighting = true;
  skyMaterial.emissiveTexture = gradientTexture;
  skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
  horizonBox.material = skyMaterial;
  horizonBox.isPickable = false;
  horizonBox.infiniteDistance = true;

  const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 8;

  const previewSphere = BABYLON.MeshBuilder.CreateSphere(
    "previewSphere",
    { diameter: 1.2 },
    scene,
  );
  previewSphere.position.y = 1.1;
  previewSphere.position.x = 1.5;
  previewSphere.position.z = -1.2;
  shadowGenerator.addShadowCaster(previewSphere);

  const material = new BABYLON.StandardMaterial("previewMaterial", scene);
  material.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.9);
  previewSphere.material = material;

  engine.setHardwareScalingLevel(Math.min(window.devicePixelRatio || 1, 1.5));

  const onResize = () => {
    engine.setHardwareScalingLevel(Math.min(window.devicePixelRatio || 1, 1.5));
    engine.resize();
  };
  window.addEventListener("resize", onResize);

  engine.runRenderLoop(() => {
    scene.render();
  });

  const exitHandler = () => {
    window.removeEventListener("resize", onResize);
    engine.stopRenderLoop();
    scene.dispose();
    engine.dispose();
    jumboEngine = null;
    editorView.classList.remove("is-active");
    editorView.setAttribute("aria-hidden", "true");
    dashboard.classList.remove("is-hidden");
    mainHeader.classList.remove("is-hidden");
  };

  exitButton.onclick = exitHandler;
};

window.initJumboEditor = initJumboEditor;
