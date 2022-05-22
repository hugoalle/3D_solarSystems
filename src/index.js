import { 
    Scene, 
    PerspectiveCamera, 
    WebGLRenderer, 
    PointLight, 
    AxesHelper, 
    AmbientLight, 
    Object3D,
    TextureLoader,
    PMREMGenerator,
    EquirectangularReflectionMapping,
    sRGBEncoding,
    ACESFilmicToneMapping,
    LoadingManager
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import Planete from './objets/Planete.js'

//Set up : scene, camera, renderer, controls
const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );

const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
const controls = new OrbitControls( camera, renderer.domElement );

// Style and add renderer canva
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
let view = document.getElementById("view");
view.appendChild( renderer.domElement );

//Light
const light = new PointLight( 0xffffff, 10);
const Amblight = new AmbientLight( 0xff0000, 1);
scene.add( light );
scene.add( Amblight );

//3D object
const soleil = new Planete(
{
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1,
    radius: 500,
    mass: 30000,
    moveAble: false
});

const planete1 = new Planete({
    color: 0x200D75, 
    metalness: 0.9, 
    roughness: 0.5,
    radius: 10,
    mass:100
});

const planete2 = new Planete({
    color: 0xF5670A, 
    metalness: 0.9, 
    roughness: 0.5,
    radius: 50,
    mass:1000,
});

const planete3 = new Planete({
    color: 0x096C76, 
    metalness: 0.9, 
    roughness: 0.5,
    radius: 200,
    mass:5000,
});

let listOfPlanetes = [soleil, planete2, planete1, planete3]; 

const solarSystem = new Object3D();
scene.add(solarSystem);

planete2.translateX(2150);
planete2.setSpeedToOrbitAround(soleil, 'z');
planete1.translateX(2000);
planete1.setSpeedToOrbitAround(planete2, 'z');
planete3.translateX(3000);
planete3.translateZ(3000);
planete3.setSpeedToOrbitAround(soleil);

//Add planetes to solar systemes
for (const planete of listOfPlanetes) {
    solarSystem.add(planete.getMesh());
}

//AxeHelper
const axes = new AxesHelper(100);
axes.material.depthTest = false;
axes.renderOrder = 1;
solarSystem.add(axes);

//Loading Manager
const manager = new LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};

manager.onLoad = function ( ) {

	console.log( 'Loading complete!');

};
// manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

// 	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

// };
manager.onError = function ( url ) {

	console.log( 'There was an error loading ' + url );

};

//IBL, background image
renderer.outputEncoding = sRGBEncoding;
renderer.toneMapping = ACESFilmicToneMapping;

const loader = new RGBELoader( manager );
// loader.load( "starsNASA.hdr", function(texture) {

//     texture.mapping = EquirectangularReflectionMapping;
//     scene.background = texture;
//     scene.environment = texture;

//     // take off loading view
//     const loadingElem = document.getElementById('loading');
//     loadingElem.style.display = 'none';
// });
const loadingElem = document.getElementById('loading');
loadingElem.style.display = 'none';
  

// ---------------------------------------------

camera.position.z = 0;
camera.position.y = 2000;
camera.lookAt(0,0,2000);
renderer.render( scene, camera );

function animate() {
    
	requestAnimationFrame( animate );

    const speedAnimationMultiplicator = 2

    for (let i = 0; i<speedAnimationMultiplicator; i++) {
    
        const planeteToKeep = updatePlanetesPosition(listOfPlanetes);
        if (planeteToKeep !== null) {
            listOfPlanetes = planeteToKeep;
        }
    }

    onWindowResize();
    controls.update();
    renderer.render( scene, camera);
};

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function updatePlanetesPosition(listOfPlanetes) {

    let needToRemovePlanetes = false

    for (const planete of listOfPlanetes) {
        planete.updatePosition(listOfPlanetes);
        needToRemovePlanetes = needToRemovePlanetes || planete.mustBeDestroyed;
    }

    let planeteToKeep = null;

    if (needToRemovePlanetes) {
        
        planeteToKeep = []
        for (const planete of listOfPlanetes) {
            if (planete.mustBeDestroyed) {
                planete.destroy(scene.children[2]);
            }
            else {
                planeteToKeep.push(planete)
            }
        }
    }

    return planeteToKeep;
}

animate();
