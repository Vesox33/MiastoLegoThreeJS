import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.125.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/MTLLoader.js';

class BasicWorldDemo{
    constructor(){
        this._Initialize();
    }
    
    _Initialize(){
        this._threejs = new THREE.WebGLRenderer();
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);
		this._threejs.setClearColor(new THREE.Color( 0x0004f ));
        
        document.body.appendChild(this._threejs.domElement);
        
        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);
        
        const fov = 60;
        const aspect = 16/9;
        const near = 1.0;
        const far = 10000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(100, 100, 100);
        
        this._scene = new THREE.Scene();
        
      	const controls = new OrbitControls( this._camera, this._threejs.domElement );
      	controls.update();
      
        let light = new THREE.DirectionalLight(0xFFFFFF);
        light.position.set (100, 100, 100);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        
        this._scene.add(light);
        
        //---draw---
        const MtlLoader = new MTLLoader();
        const ObjLoader = new OBJLoader();
        
        const Ground = new THREE.Group();
        
        MtlLoader.load('./models/plytka_test.mtl', function (materials) {
            materials.preload();
            ObjLoader.setMaterials(materials);
            ObjLoader.load('./models/plytka_test.obj', function (object) {
                
                const instanceCount = 1000;
                const mesh = object.children[0];
                const instancedMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, instanceCount);
                
                const Object_emulation = new THREE.Object3D();
                
                Object_emulation.rotateX(-Math.PI/2);
                
                let i=0;
                for(var x=0; x<10; x++){
                    for(var z=0; z<10; z++){
                        Object_emulation.position.x = 640*x;
                        Object_emulation.position.z = 640*z;
                        
                        Object_emulation.updateMatrix();
                        instancedMesh.setMatrixAt( i, Object_emulation.matrix );
                        i++;
                }}
                    Ground.add(instancedMesh);
                    
                /* do testow, zobacz jak wydajnosc moze sie psuc
                for(var x=0; x<instanceCount ; x++)
                    for(var z=0; z<instanceCount ; z++){
                        mesh.position.x = 640*x ;
                        mesh.position.z = 640*z ;
                        //Ground.add(mesh.clone());
                        
                    }*/
                
            });
            
            
        });
        
        this._scene.add( Ground );
        
        //-------
        
        
        this._RAF();
        
        
    }
    
    
    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }
    
    _RAF()
    {
        requestAnimationFrame(() => {
            this._threejs.render(this._scene, this._camera);
            this._RAF();
        });    
    }
}

new BasicWorldDemo;

