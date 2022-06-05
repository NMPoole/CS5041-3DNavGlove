 // ############################################################################################################
 // CS5041 - Interactive Hardware And Software:
 // P3 - 3D Model Viewing With 3D Hand-Gesture Controls:
 // 
 // @author 170004680
 // ############################################################################################################



// ############################################################################################################
// Scene Contents:
// ############################################################################################################

function loadCarScene() {

    // Make sure on screen over-lay text is visible.
    Array.from(document.getElementsByTagName("p")).forEach(el => el.style.color = 'black');
    Array.from(document.getElementsByTagName("h3")).forEach(el => el.style.color = 'black');
    Array.from(document.getElementsByTagName("h4")).forEach(el => el.style.color = 'black');

    // Car Scene:
    // https://sketchfab.com/3d-models/free-1972-datsun-240k-gt-b2303a552b444e5b8637fdf5169b41cb
    gltfLoader.load('data/' + scenes[selectedScene] + '/scene.gltf', 
        function(gltf) { // Called when resource is loaded.

            scene.background = new THREE.Color(0xDDDDDD);

            // Car Scene:
            let car = gltf.scene.children[0];
            car.scale.set(0.5, 0.5, 0.5);
            scene.add(gltf.scene);

            // Ambient lighting applies a lighting to all things equally.
            const ambientLight = new THREE.AmbientLight(0x070707, 100);
            scene.add(ambientLight);

            // Directional lighting casts light in a direction, creating shadows.
            const dirLight = new THREE.DirectionalLight(0x101010, 100);
            dirLight.position.set(0, 1, 0);
            dirLight.castShadow = true;
            scene.add(dirLight);

            // Point lights create a light source at a point in a direction, creating shadows.
            const pointLight1 = new THREE.PointLight(0xc4c4c4, 10);
            pointLight1.position.set(0, 300, 500);
            scene.add(pointLight1);

            const pointLight2 = new THREE.PointLight(0xc4c4c4, 10);
            pointLight2.position.set(500, 100, 0);
            scene.add(pointLight2);

            const pointLight3 = new THREE.PointLight(0xc4c4c4, 10);
            pointLight3.position.set(0, 100, -500);
            scene.add(pointLight3);

            const pointLight4 = new THREE.PointLight(0xc4c4c4, 10);
            pointLight4.position.set(-500, 300, 0);
            scene.add(pointLight4);

            // Camera Scene Starting Position:
            camera.rotation.y = 45/180 * Math.PI;
            camera.position.x = 1000;
            camera.position.y = 250;
            camera.position.z = 1000;

            controls.update(); // Update controls based on camera starting position.

        },
        function(xhr) { // Called while resource is loading and progressing.
            console.log("Car Scene: " + (xhr.loaded / xhr.total * 100) + "% Loaded");
        },
        function(error) { // Called when resource loading has errors.
            console.log("Car Scene: Error In GLTFLoader.load().");
        }
    );

}

function loadWorldScene() {

    // Make sure on screen over-lay text is visible.
    Array.from(document.getElementsByTagName("p")).forEach(el => el.style.color = 'white');
    Array.from(document.getElementsByTagName("h3")).forEach(el => el.style.color = 'white');
    Array.from(document.getElementsByTagName("h4")).forEach(el => el.style.color = 'white');

    // World Scene:
    //https://sketchfab.com/3d-models/earthquakes-2000-to-2019-894ad84ceb8b444a91fbc05f20530bcd#download
    gltfLoader.load('data/' + scenes[selectedScene] + '/scene.gltf', 
        function(gltf) { // Called when resource is loaded.

            scene.background = new THREE.Color(0x000000);

            // World Scene:
            let world = gltf.scene.children[0];
            world.scale.set(8, 8, 8);
            scene.add(gltf.scene);

            controls.update(); // Update controls based on camera starting position.

        },
        function(xhr) { // Called while resource is loading and progressing.
            console.log("World Scene: " + (xhr.loaded / xhr.total * 100) + "% Loaded");
        },
        function(error) { // Called when resource loading has errors.
            console.log("World Scene: Error In GLTFLoader.load().");
        }
    );

}

function loadSceneContents() {

    scene = new THREE.Scene(); // Create new scene.

    switch (scenes[selectedScene]) { // Populate the scene with the 3D GLTF models.

        case "car":
            loadCarScene();
            break;

        case "world":
            loadWorldScene();
            break;

    }

}

function nextScene(increment) {

    selectedScene = (selectedScene + increment) % scenes.length;
    loadSceneContents(); // Reload scene contents based on selected scene.

}


// ############################################################################################################
// Creating The Scene - Requires: Scene, Camera, Renderer.
// i.e., Render the Scene with the Camera to view it, including necessary Controls.
// ############################################################################################################

// SCENE:
let scenes = ['car', 'world']; // Scenes available in the prototype to view.
let selectedScene = 0; // Index of selected scene in scenes.
let scene; // The scene to render.
let gltfLoader = new THREE.GLTFLoader(); // For loading 3D models.

loadSceneContents(); // Load scene contents accordingly.

// CAMERA:
const cam_fov = 60; // Camera frustrum vertical FOV
const cam_aspect = window.innerWidth / window.innerHeight; // Camera frustum aspect ratio.
const cam_frust_near = 0.1; // Camera frustrum near.
const cam_frust_far = 10000; // Camera frustrum far.

const camera = new THREE.PerspectiveCamera(cam_fov, cam_aspect, cam_frust_near, cam_frust_far);

// RENDERER:
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CONTROLS:
const controls = new THREE.OrbitControls(camera, renderer.domElement);


// ############################################################################################################
// RENDERING/ANIMATION:
// ############################################################################################################

function animate() {

    requestAnimationFrame(animate); // This will pause animation if the user leaves the browser window (desired).
    renderer.render(scene, camera); // Render the scene, with the camera within it.

}

animate();


// ############################################################################################################
// LISTENERS:
// ############################################################################################################

// Listener to scale the scene with the window when it is re-sized.
window.addEventListener('resize', function () {

    var width = this.window.innerWidth; // New window width.
    var height = this.window.innerHeight; // New window height.

    // Update the renderer and camera accordingly.
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
});

// Listener for switching the scene.
window.addEventListener('keyup', function(event) {

    switch (event.key) {

        case "ArrowRight": // Next scene.
            nextScene(1);
            break;

        case "ArrowLeft": // Previous scene.
            nextScene(-1);
            break;

        case "ArrowUp": // Resetting scene.
            nextScene(0);
            break;

    }

});