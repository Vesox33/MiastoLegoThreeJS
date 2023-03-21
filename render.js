import * as THREE from 'three';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/libs/stats.module.js';

import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/controls/OrbitControls.js';
//import {FlyControls} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/controls/FlyControls.js';
import {PointerLockControls} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/controls/PointerLockControls.js';


import {LDrawLoader} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/loaders/LDrawLoader.js';//'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/LDrawLoader.js';
import {LDrawUtils} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/utils/LDrawUtils.js';



//import {ModelLoader} from './modelLoader.js';

class BasicWorldDemo{
	
    constructor(){
        this.skybox;
        this._threejs;
        this._scene;
        this.controls;
        this._stats;
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
        const far = 1000001.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(100, 100, 100);
        
        this._scene = new THREE.Scene();
        
        this._stats = new Stats();
        document.body.appendChild(this._stats.dom);
        
      	this.controls = new OrbitControls( this._camera, this._threejs.domElement );
        
        //this.controls = new FlyControls( this._camera, this._threejs.domElement );
        //this.controls.dragToLook = true;
        
        //this.constrols = new PointerLockControls(this._camera, this._threejs.domElement);
        
      
        let light = new THREE.DirectionalLight(0xFFFFFF);
        light.position.set (100, 100, 100);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        
        this._scene.add(light);
        
		
		const sky = new THREE.TextureLoader().load('./Images/SkyBox_4K.jpg');
		sky.mapping = THREE.SphericalReflectionMapping;
		
		
		this.skybox = new THREE.Mesh(
				new THREE.SphereGeometry( 1000000, 50, 50 ),
				new THREE.MeshBasicMaterial({
			    side: THREE.BackSide,
			    map: sky,
			    //wireframe: true
				})
			);
		
		this._scene.add(this.skybox);
		
		
        //---draw---
        const Ground = new LDrawLoader();
        Ground.smoothNormals  = true;
        //LDloader.flatColors  = false;
        
        Ground.load('models/Ground_small.mpd_Packed.mpd', (e) => {
            new LDrawLoader().load('models/skyscraper_1(detailed).mpd_Packed.mpd', (b) =>{
               //e.visible = false;
               
               e = LDrawUtils.mergeObject( e );
               b = LDrawUtils.mergeObject( b );
               
               e.rotateX(-Math.PI);
               b.rotateX(-Math.PI);
                
             /* STANDARD RENDERING */
                    for(var x=0; x<5 ; x++){
                        for(var z=0; z<5 ; z++){
                            
                            e.position.x = 4*640*x ;
                            e.position.z = 4*640*z ;
                            
                            this._scene.add( e.clone() );
                            
                            b.position.x = 4*640*x - 300 ;
                            b.position.z = 4*640*z - 100 ;
                            
                            b.scale.set(3, 3, 3);
                            
                            this._scene.add( b.clone() );
                            
                            
                        }
                    }
                //this._scene.add( e ); 
            });
        });
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
            
			this.skybox.position.set(this._camera.position.x,this._camera.position.y,this._camera.position.z);
            this.controls.update(5);
            this._stats.update();
            
            this._RAF();
        });    
    }
}

new BasicWorldDemo;

