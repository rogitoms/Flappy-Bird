
import * as THREE from '../node_modules/three/build/three.module.js';


let scene, camera, renderer, bird, pipes = [], score = 0, highScore = 0, background;
let gameRunning = false, isPaused = false, gravity = -0.02, velocity = 0, pipeSpeed = 0.05;
const initialPipeGap = 5;
let pipeGap = initialPipeGap;
let spriteColumns = 10, spriteRows = 1, currentFrameIndex =0, birdFrames = []; 
const frameInterval = 100; // Interval between frames in milliseconds 
 // Force texture update
let backgroundMusic, flapSound, collisionSound;

class GameLoop {
    constructor(updateCallback) {
        this.running = false;
        this.updateCallback = updateCallback;
        this.animationFrameId = null;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.loop();
    }

    pause() {
        this.running = false;
        cancelAnimationFrame(this.animationFrameId);
    }

    loop() {
        if (!this.running) return;
        this.updateCallback();
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    }
}

let gameLoop = null;
// bring in the images for  bird animation
function loadFrames() {
    const textureLoader = new THREE.TextureLoader();

    // Load all 10 frames
    for (let i = 0; i < 10; i++) {
        const framePath = `../assets/sprites/frame_${i}.png`; // Update path as needed
        const texture = textureLoader.load(framePath);
        birdFrames.push(texture);
    }

    if (birdFrames.length > 0) {
        // Create the bird sprite using the first frame
        const birdMaterial = new THREE.SpriteMaterial({ map: birdFrames[0] });
        bird = new THREE.Sprite(birdMaterial);
        bird.scale.set(1.2, 1.2, 1.2); // Adjust scale as needed
        bird.position.set(0, 0, 0);
        scene.add(bird);

        // Start animating the bird
        animateFrames();
    } else {
        console.error("No frames were loaded!");
    }
}

// loop through the frames for animation
function animateFrames() {
    setInterval(() => {
        if (bird && birdFrames.length > 0) {
            currentFrameIndex = (currentFrameIndex + 1) % birdFrames.length; // Loop through frames
            bird.material.map = birdFrames[currentFrameIndex]; // Update the sprite texture
            bird.material.map.needsUpdate = true;
            console.log(`Frame switched to: ${currentFrameIndex}`); // Debug log
        } else {
            console.error("Animation failed: Bird or frames are missing");
        }
    }, frameInterval); // Adjust the interval to control animation speed
}



function gameUpdate() {
    if (!gameRunning || !bird) return;

    velocity += gravity ;
    bird.position.y += velocity;

    // Bird hits the ground or flies too high
    if (bird.position.y < -8 || bird.position.y > 8) {
        endGame(); // End the game if the bird moves out of bounds
        return; // Stop further execution
    }

    // Move pipes and detect collisions
    pipes.forEach((pipe, index) => {
        pipe.topPipe.position.x -= pipeSpeed ;
        pipe.bottomPipe.position.x -= pipeSpeed ;

        // Check if the bird has passed the pipe
        if (!pipe.passed && pipe.topPipe.position.x < bird.position.x) {
            score++;
            pipe.passed = true; // Mark this pipe as passed
            document.getElementById("score").innerText = `Score: ${score}`;

            // Increase difficulty every 10 pipes
            if (score % 10 === 0) {
                pipeGap = Math.max(2, pipeGap - 0.5); // Reduce gap size
                pipeSpeed += 0.01; // Increase pipe speed
            }
        }

        // Remove pipes after they exit the left side of the screen
        if (pipe.topPipe.position.x < -15) { // Pipes fully out of view
            scene.remove(pipe.topPipe);
            scene.remove(pipe.bottomPipe);
            pipes.splice(index, 1); // Remove pipe from array
        }
    });

    // Generate new pipes if fewer than 5 are on the screen
    while (pipes.length < 5) {
        spawnPipe(pipes.length === 0 ? 10 : pipes[pipes.length - 1].topPipe.position.x + 6);
    }

    // Detect collisions
    pipes.forEach(pipe => {
        const birdBox = new THREE.Box3().setFromObject(bird).expandByScalar(-0.08 ); // Relaxed detection
        const topPipeBox = new THREE.Box3().setFromObject(pipe.topPipe).expandByScalar(-0.35);
        const bottomPipeBox = new THREE.Box3().setFromObject(pipe.bottomPipe).expandByScalar(-0.35 );

        if (birdBox.intersectsBox(topPipeBox) || birdBox.intersectsBox(bottomPipeBox)) {
            endGame(); // End game on collision
            return; // Stop further execution
        }
    });


    renderer.render(scene, camera);
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gameCanvas") });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Add background gradient
    const gradientTexture = new THREE.CanvasTexture(createGradientTexture());
    const gradientMaterial = new THREE.MeshBasicMaterial({ map: gradientTexture, side: THREE.BackSide });
    const backgroundGeometry = new THREE.SphereGeometry(30, 64, 64);
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, gradientMaterial);
    backgroundMesh.scale.set(-1, 1, 1);
    scene.add(backgroundMesh);

   // make the bird sprite and load the frames
    loadFrames();

        // Load audio files
    backgroundMusic = new Audio('./assets/audio/background.mp3');
    backgroundMusic.loop = true; // Loop background music

    flapSound = new Audio('./assets/audio/flap.mp3');
    collisionSound = new Audio('./assets/audio/collision.mp3');

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(ambientLight, directionalLight);

  

    // Retrieve high score from localStorage
    highScore = parseInt(localStorage.getItem("highScore")) || 0;
    document.getElementById("highScore").innerText = `High Score: ${highScore}`;

    gameLoop = new GameLoop(gameUpdate);
}

// Create a gradient texture for the background 
function createGradientTexture() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#1E90FF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}

// Start the game
function startGames() {
    gameRunning = true;
    document.getElementById("menu").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";

    // gameRunning = true;
    score = 0;
    velocity = 0;
    pipeGap = initialPipeGap;
    pipeSpeed = 0.05;
    pipes = [];
    spawnInitialPipes();
    backgroundMusic.play(); // Start playing background music   
    gameLoop.start();
}

// Function to spawn pipes
function spawnPipe(xOffset = 5) {
    const pipeRadius = 0.5;
    const pipeHeight = 10;
    const gapY = (Math.random() * 2 - 1) * 2;

    const pipeMaterial = new THREE.MeshStandardMaterial({ color: 0x008000, metalness: 0.3, roughness: 0.8 });
    const topPipe = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeHeight, 32), pipeMaterial);
    topPipe.position.set(xOffset, gapY + pipeGap / 2 + pipeHeight / 2, 0);
    topPipe.rotation.z = Math.PI;
    scene.add(topPipe);

    const bottomPipe = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeHeight, 32), pipeMaterial);
    bottomPipe.position.set(xOffset, gapY - pipeGap / 2 - pipeHeight / 2, 0);
    scene.add(bottomPipe);

    pipes.push({ topPipe, bottomPipe });
}

function endGame() {
    console.log("Game Over!");
    gameRunning = false;
    gameLoop.pause();

    collisionSound.play(); // Play collision sound

    // Remove all pipes
    pipes.forEach(pipe => {
        scene.remove(pipe.topPipe);
        scene.remove(pipe.bottomPipe);
    });
    pipes = [];

    // Reset bird position
    bird.position.set(0, 0, 0);
    velocity = 0;

    // Pause background music
    backgroundMusic.pause(); // Pause background music
    backgroundMusic.currentTime = 0; // Reset music to start   

    // Update High Score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore); // Store high score in localStorage
        console.log(`New High Score: ${highScore}`);
    }

    // Display updated high score
    document.getElementById("highScore").innerText = `High Score: ${highScore}`;

    // Display menu and reset UI
    document.getElementById("menu").style.display = "block";
    document.getElementById("pauseOverlay").style.display = "none";
    document.getElementById("pauseButton").innerText = "Pause";

    alert(`Game Over! Your score: ${score}`);
}


// determines how the pipes are spread across the screen
function spawnInitialPipes() {
    for (let i = 1; i <= 5; i++) {
        spawnPipe(i * 6); // Spread pipes across the screen
    }
}

// Event listener for space key
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        if (gameRunning && !isPaused) {
            velocity = 0.2;
            flapSound.currentTime = 0; // Reset sound to start  
            flapSound.play(); // Play flap sound    
            console.log("Bird moved upward!");
        } else {
            console.log("Space pressed, but game is paused or not running.");
        }
    }
});

// Function to toggle pause and resume
function togglePauseResume() {
    const pauseButton = document.getElementById("pauseButton");
    const pauseOverlay = document.getElementById("pauseOverlay");

    if (gameRunning && !isPaused) {
        // Pause the game
        gameLoop.pause();
        isPaused = true;
        pauseButton.innerText = "Resume";
        pauseOverlay.style.display = "block";

        // Pause background music
        if (backgroundMusic) {
            backgroundMusic.pause();
        }

    } else if (gameRunning && isPaused) {
        // Resume the game
        gameLoop.start();
        isPaused = false;
        pauseButton.innerText = "Pause";
        pauseOverlay.style.display = "none";

          // Resume background music
          if (backgroundMusic) {
            backgroundMusic.play()
            }
        }

    }


// Attach the event listener to the pause button
document.getElementById("pauseButton").addEventListener("click", togglePauseResume);


window.startGames = startGames; // Attach startGame to the global window object

init();


 
