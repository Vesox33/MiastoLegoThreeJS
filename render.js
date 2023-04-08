import * as THREE from 'three';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/libs/stats.module.js';

//import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/controls/OrbitControls.js';

import {PointerLockControls} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/controls/PointerLockControls.js';

import {ModelLoader} from './modelLoader.js';

//to na pozniej
//import {LDrawLoader} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/loaders/LDrawLoader.js';//'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/LDrawLoader.js';
//import {LDrawUtils} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/utils/LDrawUtils.js';



class BasicWorldDemo{
	

    constructor(){
        this.skybox;
        this._threejs;
        this._scene;
        this.controls;
        this._stats;
		this.clock;
        this.city_reflection;
		this.keys = [];
		this._keyboardInput();
        this._Initialize();
        
    }
    
    _Initialize(){
        this._threejs = new THREE.WebGLRenderer({antialias: true});
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
		this._threejs.useLegacyLights = true;
        //this._threejs.outputEncoding = THREE.sRGBEncoding;
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
        
		//this.controls = new OrbitControls( this._camera, this._threejs.domElement );
	
		this.clock = new THREE.Clock(true);
		
		this.controls = new PointerLockControls(this._camera, this._threejs.domElement);
		
		
		this._threejs.domElement.addEventListener('mousedown', (e) => {
			this.controls.lock();
		});
		
		document.addEventListener('keydown', (e) => {
			this.keys[e.keyCode] = true;
			//console.log('W'.charCodeAt(0) == e.keyCode);
		});
		
		document.addEventListener('keyup', (e) => {
			this.keys[e.keyCode] = false;
		});
        
      
        const light = new THREE.DirectionalLight(0xFFFFFF, 1);
        light.position.set (10000, 10000, 10000);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
		light.shadow.camera.near = 0;
		light.shadow.camera.far = 100000;
		light.shadow.camera.left = -10000;
		light.shadow.camera.right = 10000;
		light.shadow.camera.top = 10000;
		light.shadow.camera.bottom = -10000;
        
        this._scene.add(light);
		
        //this._scene.add(new THREE.CameraHelper(light.shadow.camera));
        
        const ambientlight = new THREE.AmbientLight( 0xffffff, 0.1 );
		this._scene.add(ambientlight);
        
		const texture_loader = new THREE.TextureLoader();
		const sky = texture_loader.load('./Images/SkyBox4K.png');
        sky.mapping = THREE.SphericalReflectionMapping;
		this.city_reflection = texture_loader.load('./Images/panorama-cityscape.jpg');
        this.city_reflection.mapping = THREE.EquirectangularReflectionMapping;
        //this.city_reflection.mapping = THREE.EquirectangularRefractionMapping;
		
		
		
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
        new ModelLoader('models/Ground_huge(fixed).glb', (e) => {
            let ground = e.scene;
			
			new ModelLoader('models/skyscraper_1(detailed).glb', (b) => {
                let tower_detailed = b.scene;
                
                ground.traverse((node) => {
					if(node.isMesh) {
                        node.geometry.computeVertexNormals();
						node.receiveShadow = true;
                        
                        node.material.flatShading = false;
                        node.material.roughness = 0.7;
                        
						console.log(node);
					}
				});
                
                tower_detailed.traverse((node) => {
					if(node.isMesh) {
                        node.geometry.computeVertexNormals();
						//console.log(node.material);
                        node.material.envMap = this.city_reflection;
                        node.material.flatShading = false;
                        node.material.roughness = 0.3;
                        node.material.metalic = 1;

						node.receiveShadow = true;
						node.castShadow = true;
					}
				});
				
                
             /* STANDARD RENDERING */
                    for(var x=0; x<5 ; x++){
                        for(var z=0; z<5 ; z++){
                            
                            ground.position.x = 4*660*x ;
                            ground.position.z = 4*660*z ;
                            this._scene.add( ground.clone() );
                            
                            tower_detailed.position.x = 4*660*x - 500 ;
                            tower_detailed.position.z = 4*660*z + 600 ;
                            tower_detailed.scale.set(3, 3, 3);
                            this._scene.add( tower_detailed.clone() );
                            
                            
                        }
                    }
                //this._scene.add( ground ); 
            });
        });
        
        
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
            //this.controls.update( this.clock.getDelta() );
			this._keyboardInput();
            this._stats.update();
            
            this._RAF();
        });
	
    }
	
	_keyboardInput(){
			if(this.keys['W'.charCodeAt(0)]){
			this.controls.moveForward(5);
			}
			if(this.keys['S'.charCodeAt(0)]){
			this.controls.moveForward(-5);
			}
			if(this.keys['A'.charCodeAt(0)]){
			this.controls.moveRight(-5);
			}
			if(this.keys['D'.charCodeAt(0)]){
			this.controls.moveRight(5);
			}
	}
}

new BasicWorldDemo;

