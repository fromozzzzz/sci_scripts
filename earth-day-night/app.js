// Babylon.js 地球昼夜形成原理 3D互动模拟
// 专为小学生（6-12岁）设计

let canvas;
let engine;
let scene;
let camera;
let earth;
let sun;
let sunLight;
let hemisphericLight;
let earthRotationSpeed = 0.005;
let isRotating = false;
let observationPoint = null;
let observationMarker = null;
let earthAxis = null;
let orbitLine = null;

// 初始化场景
function init() {
    canvas = document.getElementById('renderCanvas');
    engine = new BABYLON.Engine(canvas, true);

    createScene();
    setupControls();

    engine.runRenderLoop(() => {
        scene.render();
        if (isRotating && earth) {
            earth.rotation.y += earthRotationSpeed;
            updateObservationInfo();
        }
    });

    window.addEventListener('resize', () => {
        engine.resize();
    });
}

// 创建3D场景
function createScene() {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.15);

    // 创建相机
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

    // 创建环境光（微弱）
    hemisphericLight = new BABYLON.HemisphericLight(
        'hemiLight',
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    hemisphericLight.intensity = 0.2;

    // 创建太阳
    createSun();

    // 创建地球
    createEarth();

    // 创建地球轨道
    createOrbit();

    // 创建地轴
    createEarthAxis();

    // 创建星空背景
    createStarfield();

    // 添加点击事件
    scene.onPointerDown = onPointerDown;
}

// 创建太阳
function createSun() {
    sun = BABYLON.MeshBuilder.CreateSphere('sun', { diameter: 3 }, scene);
    sun.position.x = -8;

    // 太阳材质
    const sunMaterial = new BABYLON.StandardMaterial('sunMat', scene);
    sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.9, 0.3);
    sunMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
    sun.material = sunMaterial;

    // 太阳光晕效果
    const glowLayer = new BABYLON.GlowLayer('glow', scene);
    glowLayer.intensity = 1.5;
    glowLayer.addIncludedOnlyMesh(sun);

    // 太阳光源
    sunLight = new BABYLON.PointLight('sunLight', sun.position, scene);
    sunLight.intensity = 2;
    sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
    sunLight.specular = new BABYLON.Color3(1, 1, 0.8);

    // 太阳旋转动画
    scene.registerBeforeRender(() => {
        if (sun) {
            sun.rotation.y += 0.001;
        }
    });
}

// 创建地球
function createEarth() {
    earth = BABYLON.MeshBuilder.CreateSphere('earth', { diameter: 4 }, scene);
    earth.position.x = 0;

    // 地球材质
    const earthMaterial = new BABYLON.StandardMaterial('earthMat', scene);

    // 创建地球纹理（程序化生成）
    const earthTexture = new BABYLON.DynamicTexture('earthTexture', 512, scene);
    const ctx = earthTexture.getContext();

    // 绘制地球表面
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(0.5, '#2563eb');
    gradient.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // 添加陆地（简化版）
    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 80 + 20;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 添加云层效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 40 + 10;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    earthTexture.update();

    earthMaterial.diffuseTexture = earthTexture;
    earthMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    earthMaterial.specularPower = 32;
    earth.material = earthMaterial;

    // 地球倾斜23.5度（模拟地轴倾斜）
    earth.rotation.z = Math.PI * 23.5 / 180;
}

// 创建地球轨道
function createOrbit() {
    const orbitPoints = [];
    const segments = 64;
    const radius = 5;

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        orbitPoints.push(new BABYLON.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        ));
    }

    orbitLine = BABYLON.MeshBuilder.CreateLines('orbit', { points: orbitPoints }, scene);
    orbitLine.color = new BABYLON.Color3(0.5, 0.5, 0.8);
    orbitLine.alpha = 0.5;
}

// 创建地轴
function createEarthAxis() {
    const axisPoints = [
        new BABYLON.Vector3(0, -3, 0),
        new BABYLON.Vector3(0, 3, 0)
    ];

    earthAxis = BABYLON.MeshBuilder.CreateLines('axis', { points: axisPoints }, scene);
    earthAxis.color = new BABYLON.Color3(1, 0, 0);
    earthAxis.parent = earth;
}

// 创建星空背景
function createStarfield() {
    const starCount = 500;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
        const star = BABYLON.MeshBuilder.CreateSphere(
            'star' + i,
            { diameter: 0.1 },
            scene
        );

        const distance = 40 + Math.random() * 20;
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

// 处理点击事件
function onPointerDown(evt) {
    if (evt.button !== 0) return;

    const pickResult = scene.pick(scene.pointerX, scene.pointerY);

    if (pickResult.hit && pickResult.pickedMesh === earth) {
        const point = pickResult.pickedPoint;
        setObservationPoint(point);
    }
}

// 设置观察点
function setObservationPoint(point) {
    // 移除旧标记
    if (observationMarker) {
        observationMarker.dispose();
    }

    // 创建新标记
    observationMarker = BABYLON.MeshBuilder.CreateSphere(
        'marker',
        { diameter: 0.3 },
        scene
    );

    const markerMaterial = new BABYLON.StandardMaterial('markerMat', scene);
    markerMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
    markerMaterial.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
    observationMarker.material = markerMaterial;

    observationMarker.parent = earth;
    observationMarker.position = point.subtract(earth.position);

    observationPoint = point.subtract(earth.position);

    updateObservationInfo();
}

// 更新观察点信息
function updateObservationInfo() {
    if (!observationPoint || !observationMarker) return;

    // 获取标记的世界位置
    const worldPos = observationMarker.getAbsolutePosition();

    // 计算标记到太阳的方向
    const toSun = sun.position.subtract(worldPos).normalize();

    // 计算标记的法线（从地球中心指向标记）
    const normal = worldPos.subtract(earth.position).normalize();

    // 计算光照角度
    const dotProduct = BABYLON.Vector3.Dot(normal, toSun);

    // 更新UI
    const timeInfo = document.getElementById('timeInfo');
    const sunlightInfo = document.getElementById('sunlightInfo');

    let timeOfDay = '';
    let lightStatus = '';

    if (dotProduct > 0.7) {
        timeOfDay = '正午 ☀️';
        lightStatus = '白天（阳光直射）';
    } else if (dotProduct > 0.3) {
        timeOfDay = '上午/下午 🌤️';
        lightStatus = '白天（阳光斜射）';
    } else if (dotProduct > -0.3) {
        timeOfDay = '黄昏/黎明 🌅';
        lightStatus = '傍晚/清晨（微光）';
    } else {
        timeOfDay = '午夜 🌙';
        lightStatus = '黑夜（无阳光）';
    }

    timeInfo.textContent = '当前时间：' + timeOfDay;
    sunlightInfo.textContent = '光照情况：' + lightStatus;
}

// 设置控制按钮
function setupControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const showOrbitBtn = document.getElementById('showOrbitBtn');
    const showAxisBtn = document.getElementById('showAxisBtn');

    // 播放/暂停按钮
    playPauseBtn.addEventListener('click', () => {
        isRotating = !isRotating;
        if (isRotating) {
            playPauseBtn.textContent = '⏸️ 暂停旋转';
            playPauseBtn.classList.add('playing');
        } else {
            playPauseBtn.textContent = '▶️ 开始旋转';
            playPauseBtn.classList.remove('playing');
        }
    });

    // 重置按钮
    resetBtn.addEventListener('click', () => {
        if (earth) {
            earth.rotation.y = 0;
            earth.rotation.z = Math.PI * 23.5 / 180;
        }
        if (camera) {
            camera.alpha = Math.PI / 2;
            camera.beta = Math.PI / 3;
            camera.radius = 15;
        }
        isRotating = false;
        playPauseBtn.textContent = '▶️ 开始旋转';
        playPauseBtn.classList.remove('playing');

        if (observationMarker) {
            observationMarker.dispose();
            observationMarker = null;
            observationPoint = null;
        }

        document.getElementById('timeInfo').textContent = '当前时间：正午';
        document.getElementById('sunlightInfo').textContent = '光照情况：白天';
    });

    // 速度滑块
    speedSlider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        earthRotationSpeed = 0.005 * speed;
        speedValue.textContent = speed + 'x';
    });

    // 显示/隐藏轨道
    showOrbitBtn.addEventListener('change', (e) => {
        if (orbitLine) {
            orbitLine.setEnabled(e.target.checked);
        }
    });

    // 显示/隐藏地轴
    showAxisBtn.addEventListener('change', (e) => {
        if (earthAxis) {
            earthAxis.setEnabled(e.target.checked);
        }
    });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);
