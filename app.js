const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

let scene, camera, sun, earth, orbit, earthOrbitAngle = 0;
let isAnimating = false;
let animationSpeed = 1;
let earthAxisTilt = 23.5 * Math.PI / 180;

const seasonData = {
    spring: {
        angle: 0,
        title: '🌸 春分 (3月21日)',
        info: {
            sunPosition: '赤道',
            northHemisphere: '春季开始，白天和黑夜一样长',
            southHemisphere: '秋季开始，白天和黑夜一样长',
            feature: '全球昼夜平分，气温适中，万物复苏'
        }
    },
    summer: {
        angle: Math.PI / 2,
        title: '☀️ 夏至 (6月21日)',
        info: {
            sunPosition: '北回归线 (北纬23.5°)',
            northHemisphere: '夏季，白天最长，黑夜最短',
            southHemisphere: '冬季，白天最短，黑夜最长',
            feature: '北半球接收阳光最多，天气炎热'
        }
    },
    autumn: {
        angle: Math.PI,
        title: '🍂 秋分 (9月23日)',
        info: {
            sunPosition: '赤道',
            northHemisphere: '秋季开始，白天和黑夜一样长',
            southHemisphere: '春季开始，白天和黑夜一样长',
            feature: '全球昼夜平分，气温凉爽，收获季节'
        }
    },
    winter: {
        angle: Math.PI * 1.5,
        title: '❄️ 冬至 (12月21日)',
        info: {
            sunPosition: '南回归线 (南纬23.5°)',
            northHemisphere: '冬季，白天最短，黑夜最长',
            southHemisphere: '夏季，白天最长，黑夜最短',
            feature: '北半球接收阳光最少，天气寒冷'
        }
    }
};

function createScene() {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.15);

    camera = new BABYLON.ArcRotateCamera(
        'camera',
        -Math.PI / 2,
        Math.PI / 3,
        25,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 15;
    camera.upperRadiusLimit = 50;
    camera.wheelPrecision = 50;

    const ambientLight = new BABYLON.HemisphericLight(
        'ambientLight',
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    ambientLight.intensity = 0.3;

    createSun();
    createEarth();
    createOrbit();
    createStars();
    createAxisHelper();

    return scene;
}

function createSun() {
    sun = BABYLON.MeshBuilder.CreateSphere('sun', { diameter: 4 }, scene);
    sun.position = BABYLON.Vector3.Zero();

    const sunMaterial = new BABYLON.StandardMaterial('sunMaterial', scene);
    sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
    sunMaterial.diffuseColor = new BABYLON.Color3(1, 0.9, 0.3);
    sun.material = sunMaterial;

    const sunLight = new BABYLON.PointLight(
        'sunLight',
        BABYLON.Vector3.Zero(),
        scene
    );
    sunLight.intensity = 2;
    sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);

    const glowLayer = new BABYLON.GlowLayer('sunGlow', scene);
    glowLayer.addIncludedOnlyMesh(sun);
    glowLayer.intensity = 1.5;

    const sunAnimation = new BABYLON.Animation(
        'sunRotation',
        'rotation.y',
        30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const keys = [
        { frame: 0, value: 0 },
        { frame: 100, value: 2 * Math.PI }
    ];

    sunAnimation.setKeys(keys);
    sun.animations.push(sunAnimation);
    scene.beginAnimation(sun, 0, 100, true);
}

function createEarth() {
    earth = BABYLON.MeshBuilder.CreateSphere('earth', { diameter: 2 }, scene);

    const earthMaterial = new BABYLON.StandardMaterial('earthMaterial', scene);
    earthMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
    earthMaterial.specularColor = new BABYLON.Color3(0.1, 0.2, 0.3);
    earthMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.15);
    earth.material = earthMaterial;

    const earthTexture = new BABYLON.DynamicTexture(
        'earthTexture',
        512,
        scene,
        false
    );
    const context = earthTexture.getContext();
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#4a90e2');
    gradient.addColorStop(0.5, '#2ecc71');
    gradient.addColorStop(0.7, '#4a90e2');
    gradient.addColorStop(1, '#ffffff');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    earthTexture.update();
    earthMaterial.diffuseTexture = earthTexture;

    earth.rotation.z = earthAxisTilt;

    updateEarthPosition(0);
}

function createOrbit() {
    const orbitPoints = [];
    const orbitRadius = 12;
    const segments = 100;

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        orbitPoints.push(
            new BABYLON.Vector3(
                Math.cos(angle) * orbitRadius,
                0,
                Math.sin(angle) * orbitRadius
            )
        );
    }

    orbit = BABYLON.MeshBuilder.CreateLines('orbit', { points: orbitPoints }, scene);
    orbit.color = new BABYLON.Color3(0.5, 0.5, 0.8);
    orbit.alpha = 0.5;

    createSeasonMarkers(orbitRadius);
}

function createSeasonMarkers(radius) {
    const seasons = [
        { name: '春分', angle: 0, color: '#2ecc71' },
        { name: '夏至', angle: Math.PI / 2, color: '#f39c12' },
        { name: '秋分', angle: Math.PI, color: '#e67e22' },
        { name: '冬至', angle: Math.PI * 1.5, color: '#3498db' }
    ];

    seasons.forEach(season => {
        const marker = BABYLON.MeshBuilder.CreateSphere(
            season.name,
            { diameter: 0.5 },
            scene
        );
        marker.position = new BABYLON.Vector3(
            Math.cos(season.angle) * radius,
            0,
            Math.sin(season.angle) * radius
        );

        const markerMaterial = new BABYLON.StandardMaterial(
            season.name + 'Material',
            scene
        );
        markerMaterial.emissiveColor = BABYLON.Color3.FromHexString(season.color);
        marker.material = markerMaterial;
    });
}

function createStars() {
    const starCount = 500;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
        const star = BABYLON.MeshBuilder.CreateSphere(
            'star' + i,
            { diameter: 0.1 },
            scene
        );

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 40 + Math.random() * 20;

        star.position = new BABYLON.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );

        const starMaterial = new BABYLON.StandardMaterial('starMaterial' + i, scene);
        starMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        star.material = starMaterial;

        stars.push(star);
    }
}

function createAxisHelper() {
    const axisLength = 2;
    const axisOrigin = earth.position.clone();

    const axisPoints = [
        new BABYLON.Vector3(0, -axisLength, 0),
        new BABYLON.Vector3(0, axisLength, 0)
    ];

    const axis = BABYLON.MeshBuilder.CreateLines('axis', { points: axisPoints }, scene);
    axis.color = new BABYLON.Color3(1, 0, 0);
    axis.parent = earth;
    axis.rotation.z = earthAxisTilt;
}

function updateEarthPosition(angle) {
    const orbitRadius = 12;
    earth.position.x = Math.cos(angle) * orbitRadius;
    earth.position.z = Math.sin(angle) * orbitRadius;
    earth.position.y = 0;

    earth.rotation.y += 0.01;
}

function updateSeasonInfo(angle) {
    let currentSeason = 'spring';
    let minDiff = Math.PI * 2;

    for (const [season, data] of Object.entries(seasonData)) {
        let diff = Math.abs(angle - data.angle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        if (diff < minDiff) {
            minDiff = diff;
            currentSeason = season;
        }
    }

    const data = seasonData[currentSeason];
    document.getElementById('seasonTitle').textContent = data.title;
    document.getElementById('seasonInfo').innerHTML = `
        <p><strong>太阳直射点：</strong>${data.info.sunPosition}</p>
        <p><strong>北半球：</strong>${data.info.northHemisphere}</p>
        <p><strong>南半球：</strong>${data.info.southHemisphere}</p>
        <p><strong>特点：</strong>${data.info.feature}</p>
    `;

    document.querySelectorAll('.season-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.season === currentSeason) {
            btn.classList.add('active');
        }
    });
}

function animate() {
    if (isAnimating) {
        earthOrbitAngle += 0.01 * animationSpeed;
        if (earthOrbitAngle > Math.PI * 2) {
            earthOrbitAngle -= Math.PI * 2;
        }
        updateEarthPosition(earthOrbitAngle);
        updateSeasonInfo(earthOrbitAngle);
    }
}

document.getElementById('playBtn').addEventListener('click', () => {
    isAnimating = true;
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    isAnimating = false;
});

document.getElementById('resetBtn').addEventListener('click', () => {
    isAnimating = false;
    earthOrbitAngle = 0;
    updateEarthPosition(earthOrbitAngle);
    updateSeasonInfo(earthOrbitAngle);
});

document.querySelectorAll('.season-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const season = btn.dataset.season;
        earthOrbitAngle = seasonData[season].angle;
        updateEarthPosition(earthOrbitAngle);
        updateSeasonInfo(earthOrbitAngle);
        isAnimating = false;
    });
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    animationSpeed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = animationSpeed + 'x';
});

createScene();

engine.runRenderLoop(() => {
    animate();
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});
