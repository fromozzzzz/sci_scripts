const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

let scene;
let earth;
let sun;
let camera;
let isRotating = false;
let rotationSpeed = 0.003;

function createScene() {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.15);

    camera = new BABYLON.ArcRotateCamera(
        'camera',
        Math.PI / 2,
        Math.PI / 3,
        15,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 30;
    camera.wheelPrecision = 50;

    createSun();
    createEarth();
    createStars();
    createLighting();

    return scene;
}

function createSun() {
    sun = BABYLON.MeshBuilder.CreateSphere('sun', { diameter: 3 }, scene);
    sun.position.x = -10;

    const sunMaterial = new BABYLON.StandardMaterial('sunMaterial', scene);
    sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.9, 0.3);
    sunMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
    sun.material = sunMaterial;

    const sunGlow = new BABYLON.GlowLayer('sunGlow', scene);
    sunGlow.intensity = 1.5;

    const sunLight = new BABYLON.PointLight('sunLight', sun.position, scene);
    sunLight.intensity = 2;
    sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
    sunLight.specular = new BABYLON.Color3(1, 0.9, 0.7);

    const sunParticles = new BABYLON.ParticleSystem('sunParticles', 500, scene);
    sunParticles.particleTexture = new BABYLON.Texture('https://www.babylonjs-playground.com/textures/flare.png', scene);
    sunParticles.emitter = sun;
    sunParticles.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
    sunParticles.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);
    sunParticles.color1 = new BABYLON.Color4(1, 0.9, 0.3, 1);
    sunParticles.color2 = new BABYLON.Color4(1, 0.6, 0, 1);
    sunParticles.colorDead = new BABYLON.Color4(1, 0.3, 0, 0);
    sunParticles.minSize = 0.1;
    sunParticles.maxSize = 0.3;
    sunParticles.minLifeTime = 0.5;
    sunParticles.maxLifeTime = 1.5;
    sunParticles.emitRate = 100;
    sunParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    sunParticles.gravity = new BABYLON.Vector3(0, 0, 0);
    sunParticles.direction1 = new BABYLON.Vector3(-1, 1, -1);
    sunParticles.direction2 = new BABYLON.Vector3(1, 1, 1);
    sunParticles.minAngularSpeed = 0;
    sunParticles.maxAngularSpeed = Math.PI;
    sunParticles.minEmitPower = 0.5;
    sunParticles.maxEmitPower = 1;
    sunParticles.updateSpeed = 0.01;
    sunParticles.start();
}

function createEarth() {
    earth = BABYLON.MeshBuilder.CreateSphere('earth', { diameter: 4 }, scene);
    earth.position = BABYLON.Vector3.Zero();

    const earthMaterial = new BABYLON.StandardMaterial('earthMaterial', scene);

    const earthTexture = new BABYLON.DynamicTexture('earthTexture', 512, scene);
    const ctx = earthTexture.getContext();

    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#2196F3');
    gradient.addColorStop(0.5, '#4CAF50');
    gradient.addColorStop(1, '#8BC34A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#1976D2';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 40 + 20;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(256, 50, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(256, 462, 40, 0, Math.PI * 2);
    ctx.fill();

    earthTexture.update();

    earthMaterial.diffuseTexture = earthTexture;
    earthMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    earthMaterial.specularPower = 32;
    earth.material = earthMaterial;

    const atmosphereGlow = new BABYLON.GlowLayer('atmosphereGlow', scene);
    atmosphereGlow.intensity = 0.3;

    const axis = BABYLON.MeshBuilder.CreateCylinder('axis', {
        height: 6,
        diameter: 0.05
    }, scene);
    axis.rotation.x = Math.PI / 2;
    axis.rotation.z = Math.PI / 12;

    const axisMaterial = new BABYLON.StandardMaterial('axisMaterial', scene);
    axisMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
    axis.material = axisMaterial;

    createLatitudeLines();
    createDayNightIndicator();
}

function createLatitudeLines() {
    const equator = BABYLON.MeshBuilder.CreateTorus('equator', {
        diameter: 4.1,
        thickness: 0.02
    }, scene);

    const equatorMaterial = new BABYLON.StandardMaterial('equatorMaterial', scene);
    equatorMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
    equatorMaterial.alpha = 0.6;
    equator.material = equatorMaterial;
}

function createDayNightIndicator() {
    const dayHemisphere = BABYLON.MeshBuilder.CreateSphere('dayHemisphere', {
        diameter: 4.15,
        slice: 0.5
    }, scene);
    dayHemisphere.rotation.y = Math.PI / 2;

    const dayMaterial = new BABYLON.StandardMaterial('dayMaterial', scene);
    dayMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0.8);
    dayMaterial.alpha = 0.15;
    dayMaterial.wireframe = false;
    dayHemisphere.material = dayMaterial;

    const nightHemisphere = BABYLON.MeshBuilder.CreateSphere('nightHemisphere', {
        diameter: 4.15,
        slice: 0.5
    }, scene);
    nightHemisphere.rotation.y = -Math.PI / 2;

    const nightMaterial = new BABYLON.StandardMaterial('nightMaterial', scene);
    nightMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.3);
    nightMaterial.alpha = 0.3;
    nightMaterial.wireframe = false;
    nightHemisphere.material = nightMaterial;
}

function createStars() {
    const starCount = 1000;
    const stars = new BABYLON.ParticleSystem('stars', starCount, scene);

    const starEmitter = BABYLON.MeshBuilder.CreateBox('starEmitter', { size: 0.1 }, scene);
    starEmitter.isVisible = false;

    stars.particleTexture = new BABYLON.Texture('https://www.babylonjs-playground.com/textures/flare.png', scene);
    stars.emitter = starEmitter;

    stars.minSize = 0.1;
    stars.maxSize = 0.3;
    stars.minLifeTime = 999999;
    stars.maxLifeTime = 999999;
    stars.emitRate = starCount;

    stars.createPointEmitter(
        new BABYLON.Vector3(-1, -1, -1),
        new BABYLON.Vector3(1, 1, 1)
    );

    stars.minEmitPower = 0;
    stars.maxEmitPower = 0;
    stars.updateSpeed = 0;

    stars.addSizeGradient(0, 0.1, 0.3);

    stars.start();

    for (let i = 0; i < starCount; i++) {
        const particle = stars.particles[i];
        if (particle) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 40 + Math.random() * 20;

            particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
            particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
            particle.position.z = radius * Math.cos(phi);

            particle.color = new BABYLON.Color4(1, 1, 1, Math.random() * 0.5 + 0.5);
        }
    }
}

function createLighting() {
    const hemisphericLight = new BABYLON.HemisphericLight(
        'hemisphericLight',
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    hemisphericLight.intensity = 0.3;
    hemisphericLight.diffuse = new BABYLON.Color3(0.3, 0.3, 0.5);
    hemisphericLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2);
}

function setupControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const speedSlider = document.getElementById('speedSlider');
    const lightSlider = document.getElementById('lightSlider');

    playPauseBtn.addEventListener('click', () => {
        isRotating = !isRotating;
        playPauseBtn.innerHTML = isRotating ? '⏸️ 暂停旋转' : '▶️ 开始旋转';
    });

    resetBtn.addEventListener('click', () => {
        camera.alpha = Math.PI / 2;
        camera.beta = Math.PI / 3;
        camera.radius = 15;
        earth.rotation.y = 0;
    });

    speedSlider.addEventListener('input', (e) => {
        rotationSpeed = (e.target.value / 100) * 0.01;
    });

    lightSlider.addEventListener('input', (e) => {
        const intensity = (e.target.value / 100) * 3;
        scene.lights.forEach(light => {
            if (light.name === 'sunLight') {
                light.intensity = intensity;
            }
        });
    });
}

scene = createScene();
setupControls();

engine.runRenderLoop(() => {
    if (isRotating && earth) {
        earth.rotation.y += rotationSpeed;
    }

    if (sun) {
        sun.rotation.y += 0.001;
    }

    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});