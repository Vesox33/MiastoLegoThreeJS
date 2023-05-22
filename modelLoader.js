//import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/OBJLoader.js';
//import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/MTLLoader.js';

//GTFL + DRACO
import { DRACOLoader } from 'DRACOLoader';
import { GLTFLoader } from 'GLTFLoader';

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
const loader = new GLTFLoader();
//dracoLoader.setDecoderPath( 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/libs/draco/gltf/' );
dracoLoader.setDecoderPath( './jsm_backup/draco_gltf/' );

var ModelLoader = function(glb, callback) {

        loader.setDRACOLoader( dracoLoader );

        loader.load(glb, (model) => {
                //model.preload();
                
                callback(model);
            
        });
         
}

export {ModelLoader};