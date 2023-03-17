import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/MTLLoader.js';

class ModelLoader {
    
    constructor(obj, mtl, callback){
        this._model;
        this._Load(obj, mtl, callback);
        
    }
    
    _Load(obj, mtl, callback){
        
        const MtlLoader = new MTLLoader();
        const ObjLoader = new OBJLoader();  

            MtlLoader.load(mtl, (materials) => {
                materials.preload();
                ObjLoader.setMaterials(materials);
                ObjLoader.load(obj, (object) => {
                
                    this._model = object;
                    callback();
                    
            });
            
        });
        
    }
    
    getValue(){
        return this._model;
    }
    
}

export {ModelLoader};