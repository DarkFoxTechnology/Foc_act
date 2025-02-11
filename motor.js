let scene, camera, renderer;
let rotor, stator;
let rotate = false;
let speed = 1;

function init() {
    // 初始化场景
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 创建定子（线圈）
    stator = new THREE.Group();
    createCoils();
    
    // 创建转子（永磁体）
    createRotor();

    // 设置灯光
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 5;
    
    // 事件监听
    document.getElementById('speed').addEventListener('input', (e) => {
        speed = e.target.value;
    });
    
    createFieldLines();
    addOrbitControls();
    
    animate();
}

function createCoils() {
    const coilGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 32);
    for(let i = 0; i < 9; i++) {
        const coil = new THREE.Mesh(
            coilGeometry,
            new THREE.MeshPhongMaterial({
                color: 0x00ff00,
                emissive: 0x44ff44,
                transparent: true,
                opacity: 0.8
            })
        );
        const angle = (i * Math.PI * 2) / 9;
        coil.position.set(
            Math.cos(angle) * 1.5,
            0,
            Math.sin(angle) * 1.5
        );
        coil.rotation.y = angle + Math.PI/2;
        stator.add(coil);
    }
    scene.add(stator);
}

function createRotor() {
    rotor = new THREE.Group();
    const magnetGeometry = new THREE.CylinderGeometry(0.2, 0.5, 0.2, 4);
    
    for(let i = 0; i < 4; i++) {
        const magnet = new THREE.Mesh(
            magnetGeometry,
            new THREE.MeshPhongMaterial({
                color: i % 2 === 0 ? 0xff0000 : 0x0000ff
            })
        );
        magnet.position.set(
            Math.cos((i * Math.PI)/2) * 0.8,
            0,
            Math.sin((i * Math.PI)/2) * 0.8
        );
        rotor.add(magnet);
    }
    scene.add(rotor);
}

function createFieldLines() {
    const fieldLines = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    
    for(let i = 0; i < 12; i++) {
        const points = [];
        const angle = (i * Math.PI) / 6;
        for(let r = 0; r <= 2; r += 0.2) {
            points.push(new THREE.Vector3(
                Math.cos(angle) * r,
                0,
                Math.sin(angle) * r
            ));
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        fieldLines.add(line);
    }
    scene.add(fieldLines);
}

function addOrbitControls() {
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
}

function animate() {
    requestAnimationFrame(animate);
    
    if(rotate) {
        // 转子旋转
        rotor.rotation.y += 0.02 * speed;
        
        // 定子线圈颜色变化（模拟换向）
        stator.children.forEach((coil, i) => {
            coil.material.color.setHSL(
                Math.sin(Date.now()/500 + i * 2) * 0.5 + 0.5,
                1,
                0.5
            );
        });

        // 添加磁场线动画
        scene.children[2].children.forEach((line, i) => {
            line.material.opacity = Math.abs(Math.sin(Date.now()/300 + i/2));
        });
        
        // 增强转子动画
        rotor.children.forEach((magnet, i) => {
            magnet.scale.y = 1 + Math.sin(Date.now()/100 + i) * 0.2;
        });
    }
    
    renderer.render(scene, camera);
}

function startRotation() { rotate = true; }
function stopRotation() { rotate = false; }

// 初始化并处理窗口大小变化
init();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}); 