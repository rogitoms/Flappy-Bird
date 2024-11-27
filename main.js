let scene, camera, renderer, bird, pipes = [], score = 0, highScore = 0, background;
let gameRunning = false, isPaused = false, gravity = -0.02, velocity = 0, pipeSpeed = 0.05;
const initialPipeGap = 5; // Start with larger gaps
let pipeGap = initialPipeGap;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gameCanvas") });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create a Gradient Background
    const gradientTexture = new THREE.CanvasTexture(createGradientTexture());
    gradientTexture.minFilter = THREE.LinearFilter; // Smooth the gradient
    gradientTexture.magFilter = THREE.LinearFilter;
    const gradientMaterial = new THREE.MeshBasicMaterial({ map: gradientTexture, side: THREE.BackSide });
    const backgroundGeometry = new THREE.SphereGeometry(30, 64, 64); // Large sphere for background
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, gradientMaterial);
    backgroundMesh.scale.set(-1, 1, 1); // Flip the sphere inside out
    scene.add(backgroundMesh);

    // Add bird
    const birdGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const birdMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
    bird = new THREE.Mesh(birdGeometry, birdMaterial);
    bird.position.set(0, 0, 0);
    scene.add(bird);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(ambientLight, directionalLight);

    // High Score
    highScore = localStorage.getItem("highScore") || 0;
    document.getElementById("highScore").innerText = `High Score: ${highScore}`;
}

function createGradientTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Create Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB"); // Light blue
    gradient.addColorStop(1, "#1E90FF"); // Deep sky blue

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return canvas;
}


// Start Game
function startGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";

    gameRunning = true;
    isPaused = false;
    score = 0;
    velocity = 0;
    pipeGap = initialPipeGap;
    pipeSpeed = 0.05;
    pipes = [];
    spawnInitialPipes();
    animate();
}

// Spawn Initial Pipes
function spawnInitialPipes() {
    for (let i = 1; i <= 5; i++) {
        spawnPipe(i * 6); // Spread pipes across the screen
    }
}

// Spawn a Single Pipe
function spawnPipe(xOffset = 5) {
    const pipeRadius = 0.5; // Radius of the pipe
    const pipeHeight = 10;
    const gapY = (Math.random() * 2 - 1) * 2; // Random vertical position for the gap

    // Material for the pipes
    const pipeMaterial = new THREE.MeshStandardMaterial({
        color: 0x008000,
        metalness: 0.3, // Add slight metallic effect
        roughness: 0.8, // Make it less shiny
    });

    // Top Pipe (Cylinder Geometry)
    const topPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeHeight, 32), // Rounded pipe
        pipeMaterial
    );
    topPipe.position.set(xOffset, gapY + pipeGap / 2 + pipeHeight / 2, 0);
    topPipe.rotation.z = Math.PI; // Flip the top pipe
    topPipe.castShadow = true; // Enable shadow for the top pipe
    topPipe.receiveShadow = true;

    // Bottom Pipe (Cylinder Geometry)
    const bottomPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeHeight, 32), // Rounded pipe
        pipeMaterial
    );
    bottomPipe.position.set(xOffset, gapY - pipeGap / 2 - pipeHeight / 2, 0);
    bottomPipe.castShadow = true; // Enable shadow for the bottom pipe
    bottomPipe.receiveShadow = true;

    pipes.push({ topPipe, bottomPipe, passed: false }); // Track whether the pipe has been passed
    scene.add(topPipe, bottomPipe);
}



