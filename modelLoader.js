//import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/OBJLoader.js';
//import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/MTLLoader.js';

//GTFL + DRACO
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/loaders/GLTFLoader.js';

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/libs/draco/gltf/' );

var ModelLoader = function(glb, callback) {
        
        // Instantiate a loader
        const loader = new GLTFLoader();

        loader.setDRACOLoader( dracoLoader );

        loader.load(glb, (model) => {
                //model.preload();
                
                callback(model);
            
        });
         
}

export {ModelLoader};