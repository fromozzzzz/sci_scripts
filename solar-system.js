// 行星数据 - 适合小学生理解
const planetsData = {
    sun: {
        name: "太阳 ☀️",
        description: "太阳是我们太阳系的中心，它是一颗巨大的恒星！太阳给我们光和热，让地球上的生命能够生存。",
        facts: [
            "温度：表面约5500°C，核心高达1500万°C",
            "大小：可以装下130万个地球",
            "年龄：约46亿岁",
            "距离：离地球约1.5亿公里"
        ],
        color: new BABYLON.Color3(1, 0.8, 0),
        emissive: new BABYLON.Color3(1, 0.5, 0),
        size: 4,
        distance: 0,
        rotationSpeed: 0.001,
        orbitSpeed: 0
    },
    mercury: {
        name: "水星 ☿️",
        description: "水星是离太阳最近的行星，也是最小的行星！它跑得最快，绕太阳一圈只要88天。",
        facts: [
            "温度：白天430°C，晚上-180°C",
            "大小：只有地球的1/3大",
            "一年：88天（地球日）",
            "特点：没有大气层，表面有很多坑"
        ],
        color: new BABYLON.Color3(0.7, 0.7, 0.7),
        size: 0.6,
        distance: 7,
        rotationSpeed: 0.005,
        orbitSpeed: 0.02
    },
    venus: {
        name: "金星 ♀️",
        description: "金星是夜空中最亮的行星！它被称为地球的'姐妹星'，但表面温度超级高！",
        facts: [
            "温度：约465°C，最热的行星",
            "大小：和地球差不多大",
            "一年：225天",
            "特点：自转方向和其他行星相反"
        ],
        color: new BABYLON.Color3(0.9, 0.7, 0.3),
        size: 1.1,
        distance: 10,
        rotationSpeed: 0.003,
        orbitSpeed: 0.015
    },
    earth: {
        name: "地球 🌍",
        description: "地球是我们的家园！它是目前唯一知道有生命的星球，有丰富的水和空气。",
        facts: [
            "温度：平均15°C，适合生命",
            "大小：直径约12756公里",
            "一年：365.25天",
            "特点：71%被水覆盖，有大气层保护"
        ],
        color: new BABYLON.Color3(0.2, 0.4, 0.8),
        size: 1.2,
        distance: 14,
        rotationSpeed: 0.01,
        orbitSpeed: 0.01
    },
    mars: {
        name: "火星 ♂️",
        description: "火星被称为'红色星球'，因为它表面有很多红色的铁锈！科学家正在探索火星上是否有过生命。",
        facts: [
            "温度：平均-63°C",
            "大小：约为地球的一半",
            "一年：687天",
            "特点：有太阳系最高的山（奥林帕斯山）"
        ],
        color: new BABYLON.Color3(0.8, 0.3, 0.2),
        size: 0.8,
        distance: 18,
        rotationSpeed: 0.009,
        orbitSpeed: 0.008
    },
    jupiter: {
        name: "木星 ♃",
        description: "木星是太阳系最大的行星！它是个巨大的气态行星，有一个著名的大红斑风暴。",
        facts: [
            "温度：约-110°C",
            "大小：可以装下1300个地球",
            "一年：约12个地球年",
            "特点：有79颗卫星，大红斑风暴持续300多年"
        ],
        color: new BABYLON.Color3(0.8, 0.6, 0.4),
        size: 2.5,
        distance: 24,
        rotationSpeed: 0.02,
        orbitSpeed: 0.005
    },
    saturn: {
        name: "土星 🪐",
        description: "土星最特别的是它美丽的光环！这些光环由无数冰块和岩石组成，非常壮观。",
        facts: [
            "温度：约-140°C",
            "大小：可以装下750个地球",
            "一年：约29个地球年",
            "特点：有7层光环，主要由水和冰组成"
        ],
        color: new BABYLON.Color3(0.9, 0.8, 0.5),
        size: 2.2,
        distance: 30,
        rotationSpeed: 0.018,
        orbitSpeed: 0.003
    },
    uranus: {
        name: "天王星 ⛢",
        description: "天王星是一颗奇怪的行星，它是'躺着'自转的！它的颜色像蓝绿色的宝石。",
        facts: [
            "温度：约-195°C",
            "大小：约为地球的4倍",
            "一年：84个地球年",
            "特点：自转轴倾斜98度，像在打滚"
        ],
        color: new BABYLON.Color3(0.4, 0.8, 0.8),
        size: 1.6,
        distance: 36,
        rotationSpeed: 0.012,
        orbitSpeed: 0.002
    },
    neptune: {
        name: "海王星 ♆",
        description: "海王星是离太阳最远的行星！它有强烈的风暴，风速可达每小时2000公里！",
        facts: [
            "温度：约-200°C",
            "大小：和天王星差不多",
            "一年：165个地球年",
            "特点：有太阳系最快的风，呈深蓝色"
        ],
        color: new BABYLON.Color3(0.2, 0.3, 0.8),
        size: 1.5,
        distance: 42,
        rotationSpeed: 0.011,
        orbitSpeed: 0.001
    }
};

// 全局变量
let canvas, engine, scene;
let planets = {};
let isOrbiting = true;
let speedMultiplier = 1;
let orbitsVisible = true;
let orbitLines = [];

// 初始化场景
function init() {
    canvas = document.getElementById('renderCanvas');
    engine = new BABYLON.Engine(canvas, true);

    scene = createScene();

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener('resize', () => {
        engine.resize();
    });
}

// 创建场景
function createScene() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 0, 0.05);

    // 创建相机
    const camera = new BABYLON.ArcRotateCamera(
        'camera',
        Math.PI / 2,
        Math.PI / 3,
        60,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 100;
    camera.wheelPrecision = 50;

    // 创建光源
    const sunLight = new BABYLON.PointLight('sunLight', BABYLON.Vector3.Zero(), scene);
    sunLight.intensity = 1.5;
    sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);

    const ambientLight = new BABYLON.HemisphericLight('ambientLight', new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.3;
    ambientLight.diffuse = new BABYLON.Color3(0.6, 0.6, 0.8);

    // 创建星空背景
    createStarfield(scene);

    // 创建行星
    createPlanets(scene);

    return scene;
}

// 创建星空背景
function createStarfield(scene) {
    const starCount = 2000;
    const stars = new BABYLON.PointsCloud(
        'stars',
        { count: starCount, updatable: false },
        scene
    );

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        // 随机位置
        const radius = 150 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.cos(phi);
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

        // 随机颜色（白色、黄色、淡蓝色）
        const colorChoice = Math.random();
        if (colorChoice < 0.6) {
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;
        } else if (colorChoice < 0.8) {
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 0.95;
            colors[i * 3 + 2] = 0.7;
        } else {
            colors[i * 3] = 0.7;
            colors[i * 3 + 1] = 0.8;
            colors[i * 3 + 2] = 1;
        }
    }

    stars.positions = positions;
    stars.colors = colors;
    stars.pointSize = 1.5;
}

// 创建行星
function createPlanets(scene) {
    const planetKeys = Object.keys(planetsData);

    planetKeys.forEach((key, index) => {
        const data = planetsData[key];

        // 创建行星
        const planet = BABYLON.MeshBuilder.CreateSphere(key, { diameter: data.size, segments: 32 }, scene);

        // 创建材质
        const material = new BABYLON.StandardMaterial(`${key}Material`, scene);
        material.diffuseColor = data.color;
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

        if (data.emissive) {
            material.emissiveColor = data.emissive;
        }

        // 为地球添加特殊效果
        if (key === 'earth') {
            material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        }

        // 为太阳添加发光效果
        if (key === 'sun') {
            material.emissiveColor = new BABYLON.Color3(1, 0.6, 0);

            // 添加太阳光晕
            const glowLayer = new BABYLON.GlowLayer('glow', scene);
            glowLayer.intensity = 1.5;
        }

        planet.material = material;

        // 设置初始位置
        const angle = (index / planetKeys.length) * Math.PI * 2;
        planet.position.x = Math.cos(angle) * data.distance;
        planet.position.z = Math.sin(angle) * data.distance;

        // 存储行星信息
        planets[key] = {
            mesh: planet,
            data: data,
            angle: angle,
            originalAngle: angle
        };

        // 为土星添加光环
        if (key === 'saturn') {
            createSaturnRings(scene, planet);
        }

        // 创建轨道线
        if (data.distance > 0) {
            createOrbitLine(scene, data.distance);
        }

        // 添加点击事件
        planet.actionManager = new BABYLON.ActionManager(scene);
        planet.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => showPlanetInfo(key)
            )
        );
    });

    // 开始动画
    scene.registerBeforeRender(() => {
        if (isOrbiting) {
            animatePlanets();
        }
    });
}

// 创建土星光环
function createSaturnRings(scene, planet) {
    const ring = BABYLON.MeshBuilder.CreateTorus(
        'saturnRing',
        {
            diameter: 4,
            thickness: 0.3,
            tessellation: 64
        },
        scene
    );

    ring.parent = planet;
    ring.rotation.x = Math.PI / 2;
    ring.rotation.y = 0.2;

    const ringMaterial = new BABYLON.StandardMaterial('ringMaterial', scene);
    ringMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.5);
    ringMaterial.alpha = 0.7;
    ring.material = ringMaterial;
}

// 创建轨道线
function createOrbitLine(scene, radius) {
    const points = [];
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new BABYLON.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        ));
    }

    const orbit = BABYLON.MeshBuilder.CreateLines(
        `orbit_${radius}`,
        { points: points },
        scene
    );

    orbit.color = new BABYLON.Color3(0.3, 0.3, 0.5);
    orbit.alpha = 0.3;
    orbitLines.push(orbit);
}

// 动画行星
function animatePlanets() {
    Object.keys(planets).forEach(key => {
        const planet = planets[key];

        // 公转
        if (planet.data.orbitSpeed > 0) {
            planet.angle += planet.data.orbitSpeed * speedMultiplier;
            planet.mesh.position.x = Math.cos(planet.angle) * planet.data.distance;
            planet.mesh.position.z = Math.sin(planet.angle) * planet.data.distance;
        }

        // 自转
        planet.mesh.rotation.y += planet.data.rotationSpeed * speedMultiplier;
    });
}

// 显示行星信息
function showPlanetInfo(planetKey) {
    const data = planetsData[planetKey];

    document.getElementById('planet-name').textContent = data.name;
    document.getElementById('planet-description').textContent = data.description;

    const factsList = document.getElementById('planet-facts');
    factsList.innerHTML = '';

    data.facts.forEach(fact => {
        const li = document.createElement('li');
        li.textContent = fact;
        factsList.appendChild(li);
    });

    // 相机聚焦到选中的行星
    focusOnPlanet(planetKey);
}

// 聚焦到行星
function focusOnPlanet(planetKey) {
    const planet = planets[planetKey];
    const targetPos = planet.mesh.position.clone();

    // 使用动画移动相机
    const camera = scene.cameras[0];
    const frameRate = 60;
    const duration = 60; // 1秒

    BABYLON.Animation.CreateAndStartAnimation(
        'cameraTarget',
        camera,
        'target',
        frameRate,
        duration,
        camera.target,
        targetPos,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
}

// 切换公转
function toggleOrbit() {
    isOrbiting = !isOrbiting;
    const btn = document.getElementById('pause-btn');
    btn.textContent = isOrbiting ? '⏸️ 暂停公转' : '▶️ 继续公转';
}

// 重置相机
function resetCamera() {
    const camera = scene.cameras[0];
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.radius = 60;
    camera.alpha = Math.PI / 2;
    camera.beta = Math.PI / 3;
}

// 切换速度
function toggleSpeed() {
    if (speedMultiplier === 1) {
        speedMultiplier = 2;
    } else if (speedMultiplier === 2) {
        speedMultiplier = 5;
    } else {
        speedMultiplier = 1;
    }
}

// 显示/隐藏轨道
function showOrbits() {
    orbitsVisible = !orbitsVisible;
    orbitLines.forEach(orbit => {
        orbit.setEnabled(orbitsVisible);
    });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);