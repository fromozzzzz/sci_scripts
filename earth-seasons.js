let canvas;
let engine;
let scene;
let camera;
let earth;
let sun;
let orbit;
let axisArrow;
let isAnimating = false;
let animationSpeed = 1.0;
let angle = 0;
const orbitRadius = 15;
const earthTilt = 23.5 * Math.PI / 180;

const seasonData = [
    { angle: 0, name: "春分", desc: "太阳直射赤道，昼夜平分，春暖花开", hemisphere: "北半球：春季 | 南半球：秋季" },
    { angle: Math.PI / 2, name: "夏至", desc: "太阳直射北回归线，北半球白昼最长，炎热夏天", hemisphere: "北半球：夏季 | 南半球：冬季" },
    { angle: Math.PI, name: "秋分", desc: "太阳直射赤道，昼夜平分，秋高气爽", hemisphere: "北半球：秋季 | 南半球：春季" },
    { angle: Math.PI * 3 / 2, name: "冬至", desc: "太阳直射南回归线，北半球白昼最短，寒冷冬天", hemisphere: "北半球：冬季 | 南半球：夏季" }
];

window.addEventListener('DOMContentLoaded', function() {
    init();
    setupControls();
});

function init() {
    canvas = document.getElementById('renderCanvas');
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    engine.runRenderLoop(function() {
        if (isAnimating) {
            updateEarthPosition();
        }
        scene.render();
    });

    window.addEventListener('resize', function() {
        engine.resize();
    });
}

function createScene() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.15);

    camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 4,
        Math.PI / 3,
        40,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 60;

    createSun(scene);
    createEarth(scene);
    createOrbit(scene);
    createAxisArrow(scene);
    createStars(scene);
    createLabels(scene);

    return scene;
}

function createSun(scene) {
    sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 4 }, scene);
    sun.position = BABYLON.Vector3.Zero();

    const sunMaterial = new BABYLON.StandardMaterial("sunMat", scene);
    sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0.2);
    sunMaterial.diffuseColor = new BABYLON.Color3(1, 0.9, 0.3);
    sun.material = sunMaterial;

    const sunLight = new BABYLON.PointLight("sunLight", BABYLON.Vector3.Zero(), scene);
    sunLight.intensity = 2;
    sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);

    const glowLayer = new BABYLON.GlowLayer("glow", scene);
    glowLayer.intensity = 0.8;
    glowLayer.addIncludedOnlyMesh(sun);

    const hemisphericLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.3;
}

function createEarth(scene) {
    earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 2 }, scene);
    earth.position = new BABYLON.Vector3(orbitRadius, 0, 0);

    const earthMaterial = new BABYLON.StandardMaterial("earthMat", scene);
    earthMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
    earthMaterial.specularColor = new BABYLON.Color3(0.1, 0.2, 0.3);
    earth.material = earthMaterial;

    earth.rotation.z = earthTilt;

    const equator = BABYLON.MeshBuilder.CreateTorus("equator", {
        diameter: 2.1,
        thickness: 0.02,
        tessellation: 64
    }, scene);
    equator.parent = earth;
    equator.rotation.x = Math.PI / 2;
    const equatorMat = new BABYLON.StandardMaterial("equatorMat", scene);
    equatorMat.emissiveColor = new BABYLON.Color3(1, 1, 0);
    equator.material = equatorMat;

    const northPole = BABYLON.MeshBuilder.CreateSphere("northPole", { diameter: 0.15 }, scene);
    northPole.position = new BABYLON.Vector3(0, 1, 0);
    northPole.parent = earth;
    const northMat = new BABYLON.StandardMaterial("northMat", scene);
    northMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    northPole.material = northMat;

    const southPole = BABYLON.MeshBuilder.CreateSphere("southPole", { diameter: 0.15 }, scene);
    southPole.position = new BABYLON.Vector3(0, -1, 0);
    southPole.parent = earth;
    southPole.material = northMat;
}

function createOrbit(scene) {
    const orbitPoints = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        orbitPoints.push(new BABYLON.Vector3(
            Math.cos(theta) * orbitRadius,
            0,
            Math.sin(theta) * orbitRadius
        ));
    }

    orbit = BABYLON.MeshBuilder.CreateLines("orbit", { points: orbitPoints }, scene);
    orbit.color = new BABYLON.Color3(0.5, 0.5, 0.7);
    orbit.alpha = 0.5;

    const orbitDisk = BABYLON.MeshBuilder.CreateDisc("orbitDisk", {
        radius: orbitRadius,
        tessellation: 64
    }, scene);
    orbitDisk.rotation.x = Math.PI / 2;
    const diskMat = new BABYLON.StandardMaterial("diskMat", scene);
    diskMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.5);
    diskMat.alpha = 0.1;
    diskMat.backFaceCulling = false;
    orbitDisk.material = diskMat;
}

function createAxisArrow(scene) {
    const axisLength = 3;
    const axisPoints = [
        new BABYLON.Vector3(0, -axisLength / 2, 0),
        new BABYLON.Vector3(0, axisLength / 2, 0)
    ];

    axisArrow = BABYLON.MeshBuilder.CreateLines("axis", { points: axisPoints }, scene);
    axisArrow.color = new BABYLON.Color3(1, 0, 0);
    axisArrow.parent = earth;

    const arrowHead = BABYLON.MeshBuilder.CreateCylinder("arrowHead", {
        diameterTop: 0,
        diameterBottom: 0.2,
        height: 0.4,
        tessellation: 12
    }, scene);
    arrowHead.position = new BABYLON.Vector3(0, axisLength / 2 + 0.2, 0);
    arrowHead.parent = earth;
    const arrowMat = new BABYLON.StandardMaterial("arrowMat", scene);
    arrowMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
    arrowHead.material = arrowMat;
}

function createStars(scene) {
    const starCount = 500;
    const stars = new BABYLON.PointsCloudSystem("stars", 2, scene);

    stars.addPoints(starCount, function(particle, i) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 50 + Math.random() * 30;

        particle.position = new BABYLON.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
        particle.color = new BABYLON.Color4(1, 1, 1, Math.random() * 0.5 + 0.5);
    });

    stars.buildMeshAsync();
}

function createLabels(scene) {
    const positions = [
        { angle: 0, name: "春分\n3月21日" },
        { angle: Math.PI / 2, name: "夏至\n6月21日" },
        { angle: Math.PI, name: "秋分\n9月23日" },
        { angle: Math.PI * 3 / 2, name: "冬至\n12月22日" }
    ];

    positions.forEach(pos => {
        const x = Math.cos(pos.angle) * (orbitRadius + 3);
        const z = Math.sin(pos.angle) * (orbitRadius + 3);

        const plane = BABYLON.MeshBuilder.CreatePlane("label", { size: 2 }, scene);
        plane.position = new BABYLON.Vector3(x, 0, z);
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = pos.name;
        textBlock.color = "white";
        textBlock.fontSize = 80;
        textBlock.fontWeight = "bold";
        advancedTexture.addControl(textBlock);
    });
}

function updateEarthPosition() {
    angle += 0.005 * animationSpeed;
    if (angle > Math.PI * 2) {
        angle -= Math.PI * 2;
    }

    earth.position.x = Math.cos(angle) * orbitRadius;
    earth.position.z = Math.sin(angle) * orbitRadius;

    updateSeasonInfo();
}

function updateSeasonInfo() {
    let currentSeason = seasonData[0];
    let minDiff = Math.abs(angle - seasonData[0].angle);

    for (let i = 1; i < seasonData.length; i++) {
        let diff = Math.abs(angle - seasonData[i].angle);
        if (diff < minDiff) {
            minDiff = diff;
            currentSeason = seasonData[i];
        }
    }

    const wrapDiff = Math.abs(angle - (Math.PI * 2));
    if (wrapDiff < minDiff) {
        currentSeason = seasonData[0];
    }

    document.getElementById('currentSeason').textContent = currentSeason.name;
    document.getElementById('seasonDesc').textContent = currentSeason.desc + " | " + currentSeason.hemisphere;
}

function setupControls() {
    document.getElementById('playBtn').addEventListener('click', function() {
        isAnimating = true;
    });

    document.getElementById('pauseBtn').addEventListener('click', function() {
        isAnimating = false;
    });

    document.getElementById('resetBtn').addEventListener('click', function() {
        angle = 0;
        earth.position.x = orbitRadius;
        earth.position.z = 0;
        updateSeasonInfo();
    });

    document.getElementById('speedSlider').addEventListener('input', function(e) {
        animationSpeed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = animationSpeed.toFixed(1);
    });

    document.getElementById('viewTop').addEventListener('click', function() {
        camera.setPosition(new BABYLON.Vector3(0, 50, 0));
        camera.setTarget(BABYLON.Vector3.Zero());
    });

    document.getElementById('viewSide').addEventListener('click', function() {
        camera.setPosition(new BABYLON.Vector3(0, 5, 40));
        camera.setTarget(BABYLON.Vector3.Zero());
    });

    document.getElementById('viewFree').addEventListener('click', function() {
        camera.setPosition(new BABYLON.Vector3(30, 20, 30));
        camera.setTarget(BABYLON.Vector3.Zero());
    });

    updateSeasonInfo();
}
