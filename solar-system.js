const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

const planetData = {
    sun: {
        name: '太阳',
        emoji: '☀️',
        size: 4,
        color: '#FDB813',
        info: '太阳是太阳系的中心，是一颗巨大的恒星。它为地球提供光和热，让生命得以存在。',
        distance: 0,
        speed: 0,
        rotationSpeed: 0.001
    },
    mercury: {
        name: '水星',
        emoji: '☿️',
        size: 0.4,
        color: '#8C7853',
        info: '水星是离太阳最近的行星，也是太阳系中最小的行星。它的表面温度变化很大。',
        distance: 8,
        speed: 0.04,
        rotationSpeed: 0.002
    },
    venus: {
        name: '金星',
        emoji: '♀️',
        size: 0.9,
        color: '#FFC649',
        info: '金星是太阳系中最热的行星，被厚厚的云层包围。它有时被称为"晨星"或"昏星"。',
        distance: 12,
        speed: 0.015,
        rotationSpeed: 0.001
    },
    earth: {
        name: '地球',
        emoji: '🌍',
        size: 1,
        color: '#4A90E2',
        info: '地球是我们的家园！它是太阳系中唯一已知有生命的行星，有水、空气和适宜的温度。',
        distance: 16,
        speed: 0.01,
        rotationSpeed: 0.003
    },
    mars: {
        name: '火星',
        emoji: '♂️',
        size: 0.5,
        color: '#E27B58',
        info: '火星被称为"红色星球"，因为它的表面含有铁锈。科学家正在研究火星上是否曾经有生命。',
        distance: 20,
        speed: 0.008,
        rotationSpeed: 0.003
    },
    jupiter: {
        name: '木星',
        emoji: '♃',
        size: 2.5,
        color: '#C88B3A',
        info: '木星是太阳系中最大的行星，它有一个巨大的红色风暴，叫做"大红斑"。',
        distance: 28,
        speed: 0.002,
        rotationSpeed: 0.004
    },
    saturn: {
        name: '土星',
        emoji: '♄',
        size: 2.2,
        color: '#FAD5A5',
        info: '土星以其美丽的光环而闻名。这些光环由冰块和岩石组成。',
        distance: 36,
        speed: 0.0009,
        rotationSpeed: 0.003
    },
    uranus: {
        name: '天王星',
        emoji: '♅',
        size: 1.5,
        color: '#4FD0E7',
        info: '天王星是一颗冰巨星，它的自转轴几乎是横躺着的，非常特别！',
        distance: 44,
        speed: 0.0004,
        rotationSpeed: 0.002
    },
    neptune: {
        name: '海王星',
        emoji: '♆',
        size: 1.4,
        color: '#4166F5',
        info: '海王星是太阳系中离太阳最远的行星，它是一颗美丽的蓝色星球。',
        distance: 52,
        speed: 0.0001,
        rotationSpeed: 0.002
    }
};

let scene;
let planets = {};
let isPlaying = true;
let speedMultiplier = 1;
let angles = {};

function createScene() {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.02, 0.02, 0.1);

    const camera = new BABYLON.ArcRotateCamera(
        'camera',
        Math.PI / 2,
        Math.PI / 3,
        80,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 150;
    camera.wheelPrecision = 20;

    const light = new BABYLON.PointLight('sunLight', BABYLON.Vector3.Zero(), scene);
    light.intensity = 2;

    const ambientLight = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.3;

    createStarfield();

    for (const key in planetData) {
        angles[key] = Math.random() * Math.PI * 2;
        createPlanet(key, planetData[key]);
    }

    if (planetData.saturn && planets.saturn) {
        createSaturnRings(planets.saturn);
    }

    setupInteraction();

    return scene;
}

function createStarfield() {
    const starCount = 1000;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
        const star = BABYLON.MeshBuilder.CreateSphere(
            'star' + i,
            { diameter: Math.random() * 0.3 + 0.1 },
            scene
        );

        const distance = Math.random() * 200 + 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        star.position.x = distance * Math.sin(phi) * Math.cos(theta);
        star.position.y = distance * Math.sin(phi) * Math.sin(theta);
        star.position.z = distance * Math.cos(phi);

        const starMaterial = new BABYLON.StandardMaterial('starMat' + i, scene);
        starMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        star.material = starMaterial;

        stars.push(star);
    }
}

function createPlanet(key, data) {
    const planet = BABYLON.MeshBuilder.CreateSphere(
        key,
        { diameter: data.size * 2 },
        scene
    );

    const material = new BABYLON.StandardMaterial(key + 'Mat', scene);
    const color = BABYLON.Color3.FromHexString(data.color);
    material.diffuseColor = color;

    if (key === 'sun') {
        material.emissiveColor = color;
        const glowLayer = new BABYLON.GlowLayer('glow', scene);
        glowLayer.intensity = 1.5;
    } else {
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    }

    planet.material = material;
    planet.planetData = data;
    planet.planetKey = key;

    if (data.distance > 0) {
        const orbitPath = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            orbitPath.push(new BABYLON.Vector3(
                Math.cos(angle) * data.distance,
                0,
                Math.sin(angle) * data.distance
            ));
        }

        const orbit = BABYLON.MeshBuilder.CreateLines(
            key + 'Orbit',
            { points: orbitPath },
            scene
        );
        orbit.color = new BABYLON.Color3(0.3, 0.3, 0.3);
        orbit.alpha = 0.3;
    }

    planets[key] = planet;
}

function createSaturnRings(planet) {
    const ring = BABYLON.MeshBuilder.CreateTorus(
        'saturnRing',
        {
            diameter: planet.planetData.size * 4,
            thickness: 0.3,
            tessellation: 64
        },
        scene
    );

    ring.parent = planet;
    ring.rotation.x = Math.PI / 2;

    const ringMaterial = new BABYLON.StandardMaterial('ringMat', scene);
    ringMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.6);
    ringMaterial.alpha = 0.7;
    ring.material = ringMaterial;
}

function setupInteraction() {
    scene.onPointerDown = function(evt, pickResult) {
        if (pickResult.hit && pickResult.pickedMesh.planetData) {
            const data = pickResult.pickedMesh.planetData;
            updateInfoPanel(data);
        }
    };
}

function updateInfoPanel(data) {
    const infoDiv = document.getElementById('planet-info');
    infoDiv.innerHTML = `
        <h2><span class="planet-emoji">${data.emoji}</span>${data.name}</h2>
        <p>${data.info}</p>
        ${data.distance > 0 ? `<p><strong>距离太阳:</strong> ${data.distance} 单位</p>` : ''}
        <p><strong>大小:</strong> ${data.size.toFixed(1)} 单位</p>
    `;
}

function animatePlanets() {
    for (const key in planets) {
        const planet = planets[key];
        const data = planetData[key];

        planet.rotation.y += data.rotationSpeed * speedMultiplier;

        if (data.distance > 0 && isPlaying) {
            angles[key] += data.speed * speedMultiplier;
            planet.position.x = Math.cos(angles[key]) * data.distance;
            planet.position.z = Math.sin(angles[key]) * data.distance;
        }
    }
}

document.getElementById('playPause').addEventListener('click', function() {
    isPlaying = !isPlaying;
    this.textContent = isPlaying ? '⏸️ 暂停' : '▶️ 播放';
});

document.getElementById('speedUp').addEventListener('click', function() {
    speedMultiplier = Math.min(speedMultiplier * 2, 16);
    updateSpeedDisplay();
});

document.getElementById('speedDown').addEventListener('click', function() {
    speedMultiplier = Math.max(speedMultiplier / 2, 0.25);
    updateSpeedDisplay();
});

document.getElementById('reset').addEventListener('click', function() {
    speedMultiplier = 1;
    isPlaying = true;
    document.getElementById('playPause').textContent = '⏸️ 暂停';
    updateSpeedDisplay();

    for (const key in planetData) {
        angles[key] = Math.random() * Math.PI * 2;
    }
});

function updateSpeedDisplay() {
    document.getElementById('speed-display').textContent = `速度: ${speedMultiplier}x`;
}

scene = createScene();

engine.runRenderLoop(function() {
    animatePlanets();
    scene.render();
});

window.addEventListener('resize', function() {
    engine.resize();
});
