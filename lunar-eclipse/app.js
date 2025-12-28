// 月食模拟器主程序
class LunarEclipseSimulator {
    constructor() {
        this.canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.camera = null;

        // 天体对象
        this.sun = null;
        this.earth = null;
        this.moon = null;
        this.earthShadow = null;

        // 动画控制
        this.isPlaying = false;
        this.animationSpeed = 1.0;
        this.currentPhase = 0;
        this.moonAngle = 0;
        this.viewMode = 0; // 0: 侧视图, 1: 俯视图, 2: 自由视角

        // 月食阶段
        this.phases = [
            { name: '准备阶段', progress: 0 },
            { name: '月食初亏', progress: 20 },
            { name: '月食食既', progress: 40 },
            { name: '月全食', progress: 60 },
            { name: '月食生光', progress: 80 },
            { name: '月食复圆', progress: 100 }
        ];

        this.init();
    }

    init() {
        this.createScene();
        this.setupLights();
        this.createCelestialBodies();
        this.setupCamera();
        this.setupControls();
        this.startRenderLoop();
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color3(0.02, 0.02, 0.1);

        // 添加星空背景
        const starfield = new BABYLON.Layer('starfield', 'https://playground.babylonjs.com/textures/starfield.png', this.scene, true);
    }

    setupLights() {
        // 移除默认光照
        this.scene.lights.forEach(light => light.dispose());

        // 太阳光源
        const sunLight = new BABYLON.PointLight('sunLight', new BABYLON.Vector3(-50, 0, 0), this.scene);
        sunLight.intensity = 2.0;
        sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);

        // 环境光
        const ambientLight = new BABYLON.HemisphericLight('ambientLight', new BABYLON.Vector3(0, 1, 0), this.scene);
        ambientLight.intensity = 0.1;
    }

    createCelestialBodies() {
        // 创建太阳
        this.sun = BABYLON.MeshBuilder.CreateSphere('sun', { diameter: 8 }, this.scene);
        this.sun.position.x = -50;

        const sunMaterial = new BABYLON.StandardMaterial('sunMat', this.scene);
        sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0.2);
        sunMaterial.diffuseColor = new BABYLON.Color3(1, 0.9, 0.3);
        this.sun.material = sunMaterial;

        // 太阳发光效果
        const glowLayer = new BABYLON.GlowLayer('glow', this.scene);
        glowLayer.addIncludedOnlyMesh(this.sun);
        glowLayer.intensity = 1.5;

        // 创建地球
        this.earth = BABYLON.MeshBuilder.CreateSphere('earth', { diameter: 4 }, this.scene);
        this.earth.position.x = 0;

        const earthMaterial = new BABYLON.StandardMaterial('earthMat', this.scene);
        earthMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
        earthMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        this.earth.material = earthMaterial;

        // 地球大气层效果
        const earthGlow = BABYLON.MeshBuilder.CreateSphere('earthGlow', { diameter: 4.5 }, this.scene);
        earthGlow.position = this.earth.position;
        const earthGlowMat = new BABYLON.StandardMaterial('earthGlowMat', this.scene);
        earthGlowMat.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4);
        earthGlowMat.alpha = 0.3;
        earthGlow.material = earthGlowMat;

        // 创建月球
        this.moon = BABYLON.MeshBuilder.CreateSphere('moon', { diameter: 1.2 }, this.scene);
        this.moon.position.x = 15;

        const moonMaterial = new BABYLON.StandardMaterial('moonMat', this.scene);
        moonMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.7);
        moonMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        this.moon.material = moonMaterial;

        // 创建地球阴影区域（可视化）
        this.createEarthShadow();

        // 添加轨道线
        this.createOrbitLine();

        // 添加标签
        this.createLabels();
    }

    createEarthShadow() {
        // 创建圆锥形阴影可视化
        const shadowCone = BABYLON.MeshBuilder.CreateCylinder('shadowCone', {
            diameterTop: 4,
            diameterBottom: 2,
            height: 30,
            tessellation: 32
        }, this.scene);

        shadowCone.position.x = 15;
        shadowCone.rotation.z = Math.PI / 2;

        const shadowMaterial = new BABYLON.StandardMaterial('shadowMat', this.scene);
        shadowMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.15);
        shadowMaterial.alpha = 0.4;
        shadowMaterial.wireframe = false;
        shadowCone.material = shadowMaterial;

        this.earthShadow = shadowCone;
    }

    createOrbitLine() {
        const orbitPoints = [];
        const segments = 100;
        const radius = 15;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            orbitPoints.push(new BABYLON.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            ));
        }

        const orbit = BABYLON.MeshBuilder.CreateLines('orbit', { points: orbitPoints }, this.scene);
        orbit.color = new BABYLON.Color3(0.5, 0.5, 0.7);
        orbit.alpha = 0.3;
    }

    createLabels() {
        // 使用动态纹理创建标签
        const createLabel = (text, position, color) => {
            const plane = BABYLON.MeshBuilder.CreatePlane('label', { size: 3 }, this.scene);
            plane.position = position;
            plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

            const texture = new BABYLON.DynamicTexture('labelTexture', { width: 256, height: 128 }, this.scene);
            const material = new BABYLON.StandardMaterial('labelMat', this.scene);
            material.diffuseTexture = texture;
            material.emissiveColor = new BABYLON.Color3(1, 1, 1);
            material.disableLighting = true;
            plane.material = material;

            const ctx = texture.getContext();
            ctx.fillStyle = color;
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(text, 128, 70);
            texture.update();

            return plane;
        };

        createLabel('☀️ 太阳', new BABYLON.Vector3(-50, 6, 0), '#FFD700');
        createLabel('🌍 地球', new BABYLON.Vector3(0, 4, 0), '#4FC3F7');
        createLabel('🌙 月亮', new BABYLON.Vector3(15, 3, 0), '#BDBDBD');
    }

    setupCamera() {
        this.camera = new BABYLON.ArcRotateCamera(
            'camera',
            Math.PI / 2,
            Math.PI / 3,
            60,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );

        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = 20;
        this.camera.upperRadiusLimit = 100;
        this.camera.wheelPrecision = 20;
    }

    setupControls() {
        // 播放按钮
        document.getElementById('playBtn').addEventListener('click', () => {
            this.isPlaying = true;
            this.updatePhaseDisplay();
        });

        // 暂停按钮
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.isPlaying = false;
        });

        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });

        // 速度滑块
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = this.animationSpeed + 'x';
        });

        // 视角切换
        document.getElementById('viewBtn').addEventListener('click', () => {
            this.switchView();
        });
    }

    switchView() {
        this.viewMode = (this.viewMode + 1) % 3;

        switch (this.viewMode) {
            case 0: // 侧视图
                this.camera.setPosition(new BABYLON.Vector3(0, 20, 60));
                this.camera.setTarget(new BABYLON.Vector3(0, 0, 0));
                break;
            case 1: // 俯视图
                this.camera.setPosition(new BABYLON.Vector3(0, 60, 0));
                this.camera.setTarget(new BABYLON.Vector3(0, 0, 0));
                break;
            case 2: // 近距离观察月球
                this.camera.setPosition(new BABYLON.Vector3(15, 5, 25));
                this.camera.setTarget(this.moon.position);
                break;
        }
    }

    reset() {
        this.isPlaying = false;
        this.moonAngle = 0;
        this.currentPhase = 0;
        this.moon.position.x = 15;
        this.moon.position.y = 0;
        this.updatePhaseDisplay();
        this.camera.setPosition(new BABYLON.Vector3(0, 20, 60));
        this.camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    }

    updatePhaseDisplay() {
        const progress = (this.moonAngle / (Math.PI * 2)) * 100;

        // 确定当前阶段
        let phaseName = '准备阶段';
        if (progress < 15) {
            phaseName = '月食初亏 - 月球开始进入地球阴影';
        } else if (progress < 35) {
            phaseName = '月食食既 - 月球完全进入阴影';
        } else if (progress < 65) {
            phaseName = '月全食 - 月球呈现红色（血月）';
        } else if (progress < 85) {
            phaseName = '月食生光 - 月球开始离开阴影';
        } else if (progress < 100) {
            phaseName = '月食复圆 - 月球恢复明亮';
        } else {
            phaseName = '月食结束 - 完整循环完成';
        }

        document.getElementById('phaseText').textContent = phaseName;
        document.getElementById('progressFill').style.width = (progress % 100) + '%';
    }

    updateMoonAppearance() {
        const progress = (this.moonAngle / (Math.PI * 2)) * 100;
        const moonMat = this.moon.material;

        // 计算月球在阴影中的程度
        let shadowIntensity = 0;

        if (progress > 15 && progress < 85) {
            // 在阴影中
            const shadowProgress = (progress - 15) / 70;
            if (shadowProgress < 0.3) {
                shadowIntensity = shadowProgress / 0.3;
            } else if (shadowProgress > 0.7) {
                shadowIntensity = (1 - shadowProgress) / 0.3;
            } else {
                shadowIntensity = 1;
            }
        }

        // 在月全食阶段显示血月效果
        if (progress > 35 && progress < 65) {
            moonMat.diffuseColor = new BABYLON.Color3(
                0.6 + shadowIntensity * 0.3,
                0.2 - shadowIntensity * 0.1,
                0.1 - shadowIntensity * 0.05
            );
        } else {
            // 正常月球颜色，根据阴影调整亮度
            const brightness = 0.8 - shadowIntensity * 0.6;
            moonMat.diffuseColor = new BABYLON.Color3(brightness, brightness, brightness * 0.9);
        }
    }

    startRenderLoop() {
        this.engine.runRenderLoop(() => {
            if (this.isPlaying) {
                // 更新月球位置
                this.moonAngle += 0.01 * this.animationSpeed;

                const radius = 15;
                this.moon.position.x = Math.cos(this.moonAngle) * radius;
                this.moon.position.y = Math.sin(this.moonAngle) * radius;

                // 月球自转
                this.moon.rotation.y += 0.005 * this.animationSpeed;

                // 地球自转
                this.earth.rotation.y += 0.01 * this.animationSpeed;

                // 更新月球外观
                this.updateMoonAppearance();

                // 更新阶段显示
                this.updatePhaseDisplay();

                // 重置角度
                if (this.moonAngle >= Math.PI * 2) {
                    this.moonAngle = 0;
                }
            }

            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}

// 当页面加载完成后初始化模拟器
window.addEventListener('DOMContentLoaded', () => {
    const simulator = new LunarEclipseSimulator();
});
