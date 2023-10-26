import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'

import { shaderUtils , depshaderUtils, customUniforms } from './shaders/shaderUtils'

// import PointsVertexShader from './shaders/modelPoint/vertexShader.glsl'
// import PointsFragmentShader from './shaders/modelPoint/fragmentShader.glsl'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMapIntensity = 1
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Geometry
 */

/**
 * Material
 */

// Textures
const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg')
mapTexture.colorSpace = THREE.SRGBColorSpace
const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg')

// Material
const material = new THREE.MeshStandardMaterial({
    map: mapTexture,
    normalMap: normalTexture,
    emissive: 0xff0000, 
    emissiveIntensity: 0 
})

const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking
})

material.onBeforeCompile = shaderUtils;

depthMaterial.onBeforeCompile = depshaderUtils;

// debugGui control
const twistControl = gui.add(customUniforms.uTwist, 'value', 0.14, 10).name('Twist Amount');
const uslapEffectControl = gui.add(customUniforms.uslapEffect, 'value', -1, 10).name('uslapEffect');
const timeControlT = gui.add(customUniforms.uTime, 'value', -1, 30).name('uTime');

twistControl.onChange(function (value) {
    customUniforms.uTwist.value = value;
    customUniforms.uslapEffect.value = value;
});
uslapEffectControl.onChange(function (value) {
    customUniforms.uslapEffect.value = value;
});

timeControlT.onChange(function (value) {
    customUniforms.uTime.value = value;
});

/**
 * Models
 */
let points;
gltfLoader.load(
    '/models/LeePerrySmith/LeePerrySmith.glb',
    (gltf) => {
        // Model
        const mesh = gltf.scene.children[0];
        mesh.rotation.y = Math.PI * 0.5;
        mesh.material = material;
        mesh.customDepthMaterial = depthMaterial;
        mesh.rotation.y = 2.5
        scene.add(mesh);

        // Update materials
        updateAllMaterials();

 // Convert model to points
const positionAttribute = mesh.geometry.attributes.position;

const positionArray = positionAttribute.array ;

const pointsArray = [];
for (let i = 0; i < positionArray.length; i += 3) {
    const x = positionArray[i];
    const y = positionArray[i + 1];
    const z = positionArray[i + 2];
    pointsArray.push(new THREE.Vector3(x, y, z));
}

const geometry = new THREE.BufferGeometry().setFromPoints(pointsArray);

const pointMaterial = new THREE.PointsMaterial({
    color: 0xAB867E,
    size: 0.03,
});
points = new THREE.Points(geometry, pointMaterial);
points.rotation.y = 2


document.addEventListener('mousemove', function (event) {

    const mouseX = event.clientX / window.innerWidth;

    // Flip the face based on mouse click position
    if (mouseX > 0.5) {
        mesh.rotation.y = Math.PI * 0.3; // Rotate the face to the left
        customUniforms.uSlap.value = -0.10
        customUniforms.uCustomColor.value =  new THREE.Color(0xe74141) 
        
    } else {
        mesh.rotation.y = Math.PI * 0.4
        customUniforms.uSlap.value = 0.10
        customUniforms.uCustomColor.value =  new THREE.Color(0xe74141) 
    
    }
});

//debug UI
const debugOptions = {
    showPoints: false,
    uSlapEffect: true,
    pauseAnimation: false
};

gui.add(debugOptions, 'showPoints').onChange(function (value) {
    if (value) {
        scene.remove(mesh);
        scene.add(points);
        
    } else {
        scene.remove(points);
        scene.add(mesh);
    
    }
});

// Stop SlapEffect
gui.add(debugOptions, 'uSlapEffect').onChange(function (value) {
    if (value) {
        customUniforms.uslapEffect.value = (Math.PI * 9.0) / clock.elapsedTime; 
        
    } else {
        customUniforms.uslapEffect.value = 3.3; 
    }
});

// Stop Animation
gui.add(debugOptions, 'pauseAnimation').onChange(function (value) {
    if (value) {
        clock.stop(); 
    } else {
        clock.start(); 
    }
    })

    }
);


/**
 * Plane
 */
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15, 15),
    new THREE.MeshStandardMaterial()
)
plane.rotation.y = Math.PI
plane.position.y = - 3
plane.position.z = 5
scene.add(plane)
/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, - 2.25)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, - 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.useLegacyLights = false
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update material
    customUniforms.uTime.value = -elapsedTime  
    customUniforms.uslapEffect.value = (Math.PI * 9.0) / (elapsedTime )


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()