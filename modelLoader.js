//import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/OBJLoader.js';
//import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/MTLLoader.js';

//GTFL + DRACO
import { DRACOLoader } from 'DRACOLoader';
import { GLTFLoader } from 'GLTFLoader';

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
const loader = new GLTFLoader();
dracoLoader.setDecoderPath( 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/libs/draco/gltf/' );
//dracoLoader.setDecoderPath( './jsm_backup/draco_gltf/' );

class ModelLoader {
  constructor() {
    loader.setDRACOLoader(dracoLoader);
}

  async loadModel(glb) {
    let data = await loader.loadAsync(glb);
    return data;
  }
}


export {ModelLoader};