import { 
    EquirectangularReflectionMapping,
    sRGBEncoding,
    ACESFilmicToneMapping,
    LoadingManager
} from 'three';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

export default function createIBL(iblUri, scene, renderer) {

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
    loader.load( iblUri, function(texture) {

        texture.mapping = EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;

        // take off loading view
        const loadingElem = document.getElementById('loading');
        loadingElem.style.display = 'none';
    });
}