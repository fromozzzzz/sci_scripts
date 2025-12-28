const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

const planetData = {
    sun: {
        name: '太阳',
        info: '太阳是太阳系的中心，是一颗巨大的恒星。它为地球提供光和热，让生命得以存在。太阳非常大，可以装下130万个地球！',
        size: 4,
        color: '#FDB813',
        distance: 0,
        speed: 0,
        emoji: '☀️'
    },
    mercury: {
        name: '水星',
        info: '水星是离太阳最近的行星，也是最小的行星。它的表面温度变化很大，白天很热，晚上很冷。水星上没有空气和水。',
        size: 0.4,
        color: '#8C7853',
        distance: 8,
        speed: 4.74,
        emoji: '☿️'
    },
    venus: {
        name: '金星',
        info: '金星是离地球最近的行星，也被称为"启明星"或"长庚星"。金星表面非常热，温度可达460°C，比烤箱还热！',
        size: 0.9,
        color: '#FFC649',
        distance: 12,
        speed: 3.50,
        emoji: '♀️'
    },
    earth: {
        name: '地球',
        info: '地球是我们的家园！它是太阳系中唯一有生命的行星。地球有空气、水和适宜的温度，让人类和动植物能够生存。',
        size: 1,
        color: '#4169E1',
        distance: 16,
        speed: 2.98,
        emoji: '🌍'
    },
    mars: {
        name: '火星',
        info: '火星被称为"红色星球"，因为它的表面是红色的。科学家正在研究火星，看看人类未来能否在那里生活。',
        size: 0.5,
        color: '#CD5C5C',
        distance: 20,
        speed: 2.41,
        emoji: '♂️'
    },
    jupiter: {
        name: '木星',
        info: '木星是太阳系中最大的行星！它是一个气态巨行星，表面有一个巨大的红色风暴，叫做"大红斑"，已经存在了几百年。',
        size: 2.5,
        color: '#DAA520',
        distance: 28,
        speed: 1.31,
        emoji: '♃'
    },
    saturn: {
        name: '土星',
        info: '土星是太阳系中最美丽的行星，因为它有壮观的光环！这些光环是由冰块和岩石组成的。土星也是一个气态巨行星。',
        size: 2.1,
        color: '#F4A460',
        distance: 36,
        speed: 0.97,
        emoji: '♄'
    },
    uranus: {
        name: '天王星',
        info: '天王星是一个冰巨星，它的颜色是蓝绿色。天王星很特别，因为它是"躺着"转的，自转轴几乎平行于轨道面。',
        size: 1.6,
        color: '#4FD0E0',
        distance: 44,
        speed: 0.68,
        emoji: '♅'
    },
    neptune: {
        name: '海王星',
        info: '海王星是离太阳最远的行星，它是深蓝色的。海王星上有太阳系中最强的风，风速可达每小时2000公里！',
        size: 1.5,
        color: '#4169E1',
        distance: 52,
        speed: 0.54,
        emoji: '♆'
    }
};

let scene;
let camera;
let planets = {};
let isPlaying = true;
let speedMultiplier = 1;
let selectedPlanet = null;

function createScene() {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.01, 0.01, 0.05);

    camera = new BABYLON.ArcRotateCamera(
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
    camera.wheelPrecision = 10;

    const light = new BABYLON.PointLight('sunLight', BABYLON.Vector3.Zero(), scene);
    light.intensity = 2;

    const ambientLight = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.3;

    createStarfield();
    createSun();
    createPlanets();
    createOrbits();
    setupUI();

    return scene;
}

function createStarfield() {
    const starfield = BABYLON.MeshBuilder.CreateSphere('starfield', { diameter: 300 }, scene);
    const starMaterial = new BABYLON.StandardMaterial('starMaterial', scene);
    starMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    starMaterial.backFaceCulling = false;

    const starTexture = new BABYLON.DynamicTexture('starTexture', 512, scene);
    const ctx = starTexture.getContext();
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 2;
        const brightness = Math.random();
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.fillRect(x, y, size, size);
    }
    starTexture.update();

    starMaterial.emissiveTexture = starTexture;
    starfield.material = starMaterial;
}

function createSun() {
    const sun = BABYLON.MeshBuilder.CreateSphere('sun', { diameter: planetData.sun.size * 2 }, scene);
    const sunMaterial = new BABYLON.StandardMaterial('sunMaterial', scene);
    sunMaterial.emissiveColor = BABYLON.Color3.FromHexString(planetData.sun.color);
    sunMaterial.diffuseColor = BABYLON.Color3.FromHexString(planetData.sun.color);
    sun.material = sunMaterial;

    const sunGlow = new BABYLON.GlowLayer('sunGlow', scene);
    sunGlow.intensity = 1;

    const sunLight = BABYLON.MeshBuilder.CreateSphere('sunLight', { diameter: planetData.sun.size * 2.5 }, scene);
    const sunLightMaterial = new BABYLON.StandardMaterial('sunLightMaterial', scene);
    sunLightMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0.3);
    sunLightMaterial.alpha = 0.3;
    sunLight.material = sunLightMaterial;

    planets.sun = { mesh: sun, data: planetData.sun };

    sun.actionManager = new BABYLON.ActionManager(scene);
    sun.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => selectPlanet('sun')
        )
    );
}

function createPlanets() {
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    planetKeys.forEach(key => {
        const data = planetData[key];
        const planet = BABYLON.MeshBuilder.CreateSphere(key, { diameter: data.size * 2 }, scene);

        const material = new BABYLON.StandardMaterial(`${key}Material`, scene);
        material.diffuseColor = BABYLON.Color3.FromHexString(data.color);
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        planet.material = material;

        planet.position.x = data.distance;

        if (key === 'saturn') {
            createSaturnRings(planet);
        }

        if (key === 'earth') {
            createMoon(planet);
        }

        planet.actionManager = new BABYLON.ActionManager(scene);
        planet.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => selectPlanet(key)
            )
        );

        planets[key] = {
            mesh: planet,
            data: data,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: 0.01
        };
    });
}

function createSaturnRings(planet) {
    const ring = BABYLON.MeshBuilder.CreateTorus('saturnRing', {
        diameter: 4,
        thickness: 0.3,
        tessellation: 64
    }, scene);

    const ringMaterial = new BABYLON.StandardMaterial('ringMaterial', scene);
    ringMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.5);
    ringMaterial.alpha = 0.7;
    ring.material = ringMaterial;

    ring.parent = planet;
    ring.rotation.x = Math.PI / 2;
}

function createMoon(planet) {
    const moon = BABYLON.MeshBuilder.CreateSphere('moon', { diameter: 0.3 }, scene);
    const moonMaterial = new BABYLON.StandardMaterial('moonMaterial', scene);
    moonMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    moon.material = moonMaterial;

    moon.parent = planet;
    moon.position.x = 2;

    planets.moon = {
        mesh: moon,
        angle: 0,
        rotationSpeed: 0.05
    };
}

function createOrbits() {
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    planetKeys.forEach(key => {
        const data = planetData[key];
        const points = [];
        const segments = 128;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * data.distance;
            const z = Math.sin(angle) * data.distance;
            points.push(new BABYLON.Vector3(x, 0, z));
        }

        const orbit = BABYLON.MeshBuilder.CreateLines(`${key}Orbit`, { points: points }, scene);
        orbit.color = new BABYLON.Color3(0.3, 0.3, 0.3);
        orbit.alpha = 0.5;
    });
}

function setupUI() {
    const planetButtons = document.getElementById('planet-buttons');

    Object.keys(planetData).forEach(key => {
        const data = planetData[key];
        const button = document.createElement('button');
        button.className = 'planet-btn';
        button.textContent = data.emoji;
        button.title = data.name;
        button.style.background = data.color;
        button.onclick = () => selectPlanet(key);
        planetButtons.appendChild(button);
    });

    document.getElementById('playPause').onclick = togglePlayPause;
    document.getElementById('speedUp').onclick = () => changeSpeed(1.5);
    document.getElementById('speedDown').onclick = () => changeSpeed(0.5);
    document.getElementById('reset').onclick = resetView;
}

function selectPlanet(key) {
    selectedPlanet = key;
    const data = planetData[key];

    document.getElementById('planet-name').textContent = data.name;
    document.getElementById('planet-info').textContent = data.info;

    if (planets[key]) {
        camera.setTarget(planets[key].mesh.position);

        if (key === 'sun') {
            camera.radius = 15;
        } else {
            camera.radius = data.distance + 10;
        }
    }
}

function togglePlayPause() {
    isPlaying = !isPlaying;
    const button = document.getElementById('playPause');
    button.textContent = isPlaying ? '⏸️ 暂停' : '▶️ 播放';
    button.classList.toggle('active');
}

function changeSpeed(factor) {
    speedMultiplier *= factor;
    speedMultiplier = Math.max(0.1, Math.min(speedMultiplier, 10));
}

function resetView() {
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.radius = 80;
    camera.alpha = Math.PI / 2;
    camera.beta = Math.PI / 3;
    speedMultiplier = 1;
    isPlaying = true;
    document.getElementById('playPause').textContent = '⏸️ 暂停';
    selectPlanet('sun');
}

scene = createScene();

engine.runRenderLoop(() => {
    if (isPlaying) {
        Object.keys(planets).forEach(key => {
            if (key === 'sun') return;

            const planet = planets[key];
            if (!planet.data) return;

            planet.angle += (planet.data.speed * 0.001 * speedMultiplier);

            planet.mesh.position.x = Math.cos(planet.angle) * planet.data.distance;
            planet.mesh.position.z = Math.sin(planet.angle) * planet.data.distance;

            planet.mesh.rotation.y += planet.rotationSpeed;

            if (key === 'moon' && planet.mesh.parent) {
                const moonAngle = planet.angle * 10;
                planet.mesh.position.x = Math.cos(moonAngle) * 2;
                planet.mesh.position.z = Math.sin(moonAngle) * 2;
            }
        });
    }

    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});

window.addEventListener('load', () => {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('ui-container').classList.remove('hidden');
    selectPlanet('sun');
});
