import {
    AxesHelper
} from 'three';

import createIBL from './objets/ibl.js';
import initSystem from './objets/initSystem.js';

//Init scene 
const {renderer, scene, camera, solarSystem, listOfPlanetes, controls} = initSystem();

//AxeHelper
const axes = new AxesHelper(100);
axes.material.depthTest = false;
axes.renderOrder = 1;
solarSystem.add(axes);

//IBL
// createIBL("starsNASA.hdr", scene, renderer)
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
