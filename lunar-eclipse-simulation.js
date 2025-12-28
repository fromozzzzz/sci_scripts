let canvas;
let engine;
let scene;
let camera;
let sun;
let earth;
let moon;
let sunLight;
let isAnimating = false;
let animationSpeed = 1;
let moonAngle = 0;
let earthShadowCone;
let earthShadowPenumbra;

window.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    canvas = document.getElementById('renderCanvas');
    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

    createScene();

    engine.runRenderLoop(function() {
        scene.render();
    });

    window.addEventListener('resize', function() {
        engine.resize();
    });
}

function createScene() {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.02, 0.02, 0.1);

    camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 3,
        50,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 100;
    camera.wheelPrecision = 50;

    createStarfield();
    createSun();
    createEarth();
    createMoon();
    createShadowCones();
    createLabels();

    scene.registerBeforeRender(function() {
        if (isAnimating) {
            updateAnimation();
        }
    });
}

function createStarfield() {
    const starfield = BABYLON.MeshBuilder.CreateSphere("starfield", { diameter: 500 }, scene);
    const starfieldMaterial = new BABYLON.StandardMaterial("starfieldMat", scene);
    starfieldMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    starfieldMaterial.backFaceCulling = false;

    const starTexture = new BABYLON.DynamicTexture("starTexture", 512, scene);
    const context = starTexture.getContext();
    context.fillStyle = "#000011";
    context.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 2;
        context.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
        context.fillRect(x, y, size, size);
    }
    starTexture.update();

    starfieldMaterial.emissiveTexture = starTexture;
    starfield.material = starfieldMaterial;
}

function createSun() {
    sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 8 }, scene);
    sun.position.x = -25;

    const sunMaterial = new BABYLON.StandardMaterial("sunMat", scene);
    sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.9, 0.3);
    sunMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
    sun.material = sunMaterial;

    sunLight = new BABYLON.PointLight("sunLight", sun.position, scene);
    sunLight.intensity = 2;
    sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);

    const glowLayer = new BABYLON.GlowLayer("sunGlow", scene);
    glowLayer.addIncludedOnlyMesh(sun);
    glowLayer.intensity = 1.5;

    const sunParticles = new BABYLON.ParticleSystem("sunParticles", 200, scene);
    sunParticles.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", scene);
    sunParticles.emitter = sun;
    sunParticles.minEmitBox = new BABYLON.Vector3(-4, -4, -4);
    sunParticles.maxEmitBox = new BABYLON.Vector3(4, 4, 4);
    sunParticles.color1 = new BABYLON.Color4(1, 0.8, 0, 1);
    sunParticles.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
    sunParticles.colorDead = new BABYLON.Color4(1, 0.3, 0, 0);
    sunParticles.minSize = 0.3;
    sunParticles.maxSize = 0.8;
    sunParticles.minLifeTime = 0.5;
    sunParticles.maxLifeTime = 1.5;
    sunParticles.emitRate = 50;
    sunParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    sunParticles.gravity = new BABYLON.Vector3(0, 0, 0);
    sunParticles.direction1 = new BABYLON.Vector3(-1, -1, -1);
    sunParticles.direction2 = new BABYLON.Vector3(1, 1, 1);
    sunParticles.minEmitPower = 0.5;
    sunParticles.maxEmitPower = 1;
    sunParticles.updateSpeed = 0.01;
    sunParticles.start();
}

function createEarth() {
    earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 4 }, scene);
    earth.position.x = 0;

    const earthMaterial = new BABYLON.StandardMaterial("earthMat", scene);
    earthMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
    earthMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    earth.material = earthMaterial;

    const earthTexture = new BABYLON.DynamicTexture("earthTexture", 512, scene);
    const context = earthTexture.getContext();

    const gradient = context.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#1e5799");
    gradient.addColorStop(0.5, "#2989d8");
    gradient.addColorStop(1, "#207cca");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 30; i++) {
        context.fillStyle = "#2d8f3d";
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 50 + 20;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
    }

    context.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 30 + 10;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
    }

    earthTexture.update();
    earthMaterial.diffuseTexture = earthTexture;

    const atmosphereGlow = new BABYLON.GlowLayer("earthGlow", scene);
    atmosphereGlow.addIncludedOnlyMesh(earth);
    atmosphereGlow.intensity = 0.3;
}

function createMoon() {
    moon = BABYLON.MeshBuilder.CreateSphere("moon", { diameter: 1.5 }, scene);

    const moonMaterial = new BABYLON.StandardMaterial("moonMat", scene);
    moonMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    moonMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    moon.material = moonMaterial;

    const moonTexture = new BABYLON.DynamicTexture("moonTexture", 256, scene);
    const context = moonTexture.getContext();
    context.fillStyle = "#c0c0c0";
    context.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = Math.random() * 15 + 5;
        const darkness = Math.random() * 0.3;
        context.fillStyle = `rgba(${100 - darkness * 100}, ${100 - darkness * 100}, ${100 - darkness * 100}, 0.5)`;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
    }

    moonTexture.update();
    moonMaterial.diffuseTexture = moonTexture;

    moonAngle = Math.PI * 0.3;
    updateMoonPosition();
}

function createShadowCones() {
    const shadowMaterial = new BABYLON.StandardMaterial("shadowMat", scene);
    shadowMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    shadowMaterial.alpha = 0.3;
    shadowMaterial.backFaceCulling = false;

    earthShadowCone = BABYLON.MeshBuilder.CreateCylinder("shadowCone", {
        diameterTop: 0.5,
        diameterBottom: 4,
        height: 30,
        tessellation: 32
    }, scene);
    earthShadowCone.position.x = 15;
    earthShadowCone.rotation.z = Math.PI / 2;
    earthShadowCone.material = shadowMaterial;
    earthShadowCone.visibility = 0.4;

    const penumbraMaterial = new BABYLON.StandardMaterial("penumbraMat", scene);
    penumbraMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    penumbraMaterial.alpha = 0.15;
    penumbraMaterial.backFaceCulling = false;

    earthShadowPenumbra = BABYLON.MeshBuilder.CreateCylinder("shadowPenumbra", {
        diameterTop: 2,
        diameterBottom: 6,
        height: 30,
        tessellation: 32
    }, scene);
    earthShadowPenumbra.position.x = 15;
    earthShadowPenumbra.rotation.z = Math.PI / 2;
    earthShadowPenumbra.material = penumbraMaterial;
    earthShadowPenumbra.visibility = 0.3;
}

function createLabels() {
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const sunLabel = createLabel("☀️ 太阳", sun, advancedTexture);
    const earthLabel = createLabel("🌍 地球", earth, advancedTexture);
    const moonLabel = createLabel("🌙 月球", moon, advancedTexture);
}

function createLabel(text, mesh, advancedTexture) {
    const label = new BABYLON.GUI.Rectangle();
    label.width = "120px";
    label.height = "40px";
    label.cornerRadius = 10;
    label.color = "white";
    label.thickness = 2;
    label.background = "rgba(0, 0, 0, 0.7)";
    advancedTexture.addControl(label);
    label.linkWithMesh(mesh);
    label.linkOffsetY = -50;

    const labelText = new BABYLON.GUI.TextBlock();
    labelText.text = text;
    labelText.color = "white";
    labelText.fontSize = 16;
    labelText.fontWeight = "bold";
    label.addControl(labelText);

    return label;
}

function updateMoonPosition() {
    const orbitRadius = 12;
    moon.position.x = earth.position.x + Math.cos(moonAngle) * orbitRadius;
    moon.position.z = earth.position.z + Math.sin(moonAngle) * orbitRadius;
    moon.position.y = 0;
}

function updateAnimation() {
    moonAngle += 0.01 * animationSpeed;

    if (moonAngle > Math.PI * 2) {
        moonAngle = 0;
    }

    updateMoonPosition();
    updateEclipsePhase();

    earth.rotation.y += 0.005 * animationSpeed;
    moon.rotation.y += 0.002 * animationSpeed;
}

function updateEclipsePhase() {
    const normalizedAngle = ((moonAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const phaseNameElement = document.getElementById('phaseName');

    const moonMaterial = moon.material;

    if (normalizedAngle < Math.PI * 0.4 || normalizedAngle > Math.PI * 1.6) {
        phaseNameElement.textContent = "月球正常状态";
        phaseNameElement.style.color = "#3498db";
        moonMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
    } else if (normalizedAngle >= Math.PI * 0.4 && normalizedAngle < Math.PI * 0.7) {
        phaseNameElement.textContent = "半影月食开始";
        phaseNameElement.style.color = "#f39c12";
        moonMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0);
    } else if (normalizedAngle >= Math.PI * 0.7 && normalizedAngle < Math.PI * 0.9) {
        phaseNameElement.textContent = "月偏食";
        phaseNameElement.style.color = "#e67e22";
        moonMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.05, 0);
    } else if (normalizedAngle >= Math.PI * 0.9 && normalizedAngle < Math.PI * 1.1) {
        phaseNameElement.textContent = "月全食（红月亮）";
        phaseNameElement.style.color = "#c0392b";
        moonMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.05, 0);
    } else if (normalizedAngle >= Math.PI * 1.1 && normalizedAngle < Math.PI * 1.3) {
        phaseNameElement.textContent = "月偏食";
        phaseNameElement.style.color = "#e67e22";
        moonMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.05, 0);
    } else if (normalizedAngle >= Math.PI * 1.3 && normalizedAngle < Math.PI * 1.6) {
        phaseNameElement.textContent = "半影月食结束";
        phaseNameElement.style.color = "#f39c12";
        moonMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0);
    }
}

function startAnimation() {
    isAnimating = true;
    document.getElementById('phaseName').textContent = "演示进行中...";
}

function pauseAnimation() {
    isAnimating = false;
    document.getElementById('phaseName').textContent = "已暂停";
}

function resetAnimation() {
    isAnimating = false;
    moonAngle = Math.PI * 0.3;
    updateMoonPosition();
    document.getElementById('phaseName').textContent = "准备开始";

    const moonMaterial = moon.material;
    moonMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
}

function changeSpeed(value) {
    animationSpeed = parseFloat(value);
}