import * as THREE from 'three';
import Stats from 'stats';

import {OrbitControls} from 'OrbitControls';
import {PointerLockControls} from 'PointerLockControls';

import {ModelLoader} from './modelLoader.js';

import GUI from 'lil-gui';

//to na pozniej
//import {LDrawLoader} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/loaders/LDrawLoader.js';
//https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/LDrawLoader.js';
//import {LDrawUtils} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/utils/LDrawUtils.js';



class BasicWorldDemo{
    

    constructor(){
        this._threejs;
        this._camera;
        
        this._skybox;
        this._threejs;
        this._scene;
        this._controls;
        this._stats;
		//this._clock;
        this._city_reflection;
		this._keys = [];
		this._keyboardInput();
        this._Initialize();
		this._settings;
		
		this._renderedTiles;
		this.loaded_models;
		this._generateTiles;
        
		this._Character;
        this._World;
        
		
		this._vector;
        this._euler;
        this._quaternion;
		this._moveForward;
		this._moveRight;
		this._rotateRight;
        
        //this.orbit = new OrbitControls( this._camera, this._threejs.domElement );
        //this.fps = new PointerLockControls(this._camera, this._threejs.domElement);
        
		/*this._capsule = new THREE.Group();
        this._capsule.add(new THREE.Mesh( 
			new THREE.CapsuleGeometry( 30, 60, 2, 12 ),
			new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: true} ))
		);
        this._capsule.add(new THREE.AxesHelper(15));*/

		this.thirdP_view();
        
    }
    
    _Initialize(){
		this._settings = {thirdPerson: 0, fly: 0, characterVisibility: 0, active_movement: 0, fog: 0};
		this._World = new THREE.Group();
		
		this._vector = new THREE.Vector3();
        this._euler = new THREE.Euler();
        this._quaternion = new THREE.Quaternion();
		//let scope = this;
		
        this._threejs = new THREE.WebGLRenderer({antialias: true});
        
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
		this._threejs.useLegacyLights = true;
        //this._threejs.outputEncoding = THREE.sRGBEncoding;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);
		this._threejs.setClearColor(new THREE.Color( 0x00000 ));
        
        document.body.appendChild(this._threejs.domElement);
        
        
        
        const fov = 60;
        const aspect = 16/9;
        const near = 1.0;
        const far = 1000001.0;
        //const far =15001.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        

        this._scene = new THREE.Scene();
        
        this._stats = new Stats();
        document.body.appendChild(this._stats.dom);
	
		//this.clock = new THREE.Clock(true);
		this._controls = new PointerLockControls(this._camera, this._threejs.domElement);
		
		
		this._threejs.domElement.addEventListener('mousedown', (e) => {
            if(!this._settings.thirdPerson){
                this._threejs.domElement.requestPointerLock();//this._controls.lock();
            }
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
        //this._scene.add(new THREE.CameraHelper(light.shadow.camera));
        
        this._scene.add(light);
		
        
        const ambientlight = new THREE.AmbientLight( 0xffffff, 0.1 );
		this._scene.add(ambientlight);
        
		const texture_loader = new THREE.TextureLoader();
		const sky = texture_loader.load('./Images/SkyBox4K.png');
        sky.mapping = THREE.SphericalReflectionMapping;
		this._city_reflection = texture_loader.load('./Images/panorama-cityscape.jpg');
        this._city_reflection.mapping = THREE.EquirectangularReflectionMapping;
        //this._city_reflection.mapping = THREE.EquirectangularRefractionMapping;
		
		
		this._skybox = new THREE.Mesh(
				new THREE.SphereGeometry( 1000000, 50, 50 ),
				new THREE.MeshBasicMaterial({
			    side: THREE.BackSide,
			    map: sky,
			    //wireframe: true
				})
			);
		
		this._scene.add(this._skybox);
		
        const plytki = ["skyscraper_1det"];
        
        this._renderedTiles = new THREE.Group();
        this.loaded_models=0;
        
        plytki.forEach((PLYTKA) => {
            let model_high = 'models/world/high/'+PLYTKA+'_high'+'.glb';
            let model_low = 'models/world/low/'+PLYTKA+'_low'+'.glb';
            
            //---draw---
            new ModelLoader(model_high, (mh) => {
            new ModelLoader(model_low, (ml) => {
                let model_high = mh.scene;
                let model_low = ml.scene;
                let ground_high = model_high.children[0];
                let tower_high = model_high.children[1];
                
                let ground_low = model_low.children[0];
                let tower_low = model_low.children[1];
                    
                    ground_high.traverse((node) => {
                        if(node.isMesh) {
                            node.geometry.computeVertexNormals();
                            node.receiveShadow = true;
                            
                            node.material.flatShading = false;
                            node.material.roughness = 0.7;
                            
                            //console.log(node);
                        }
                    });
                    
                    tower_high.traverse((node) => {
                        if(node.isMesh) {
                            node.geometry.computeVertexNormals();
                            //console.log(node.material);
                            node.material.envMap = this._city_reflection;
                            node.material.flatShading = false;
                            node.material.roughness = 0; //0.3
                            node.material.metalic = 1;

                            node.receiveShadow = true;
                            node.castShadow = true;
                        }
                    });
                    
                    ground_low.traverse((node) => {
                        if(node.isMesh) {
                            node.material.flatShading = true;
                        }
                    });
                    
                    tower_low.traverse((node) => {
                        if(node.isMesh) {
                            node.material.envMap = this._city_reflection;
                            node.material.flatShading = true;
                        }
                    });
                    
                    
                 /* STANDARD RENDERING */
                    
                       
                                //20 threejs unit = 1 jednostka lego (from blender)
                                const PlytkaLOD = new THREE.LOD();
                                
                                let model_length = ((5*32)+22)*20;
                                //let model_length = ((5*32)+22);

                                PlytkaLOD.addLevel(model_high.clone(), 0);
                                
                                PlytkaLOD.addLevel(model_low.clone(), model_length*1.5);
                                
                                PlytkaLOD.name = PLYTKA;
                                
                                this._renderedTiles.add( PlytkaLOD );
                                //this._scene.add( PlytkaLOD );
                                //this._World.add( PlytkaLOD );
                                this.loaded_models++;
                    //this._scene.add( ground ); //single
                    //console.log(this._World );
                    //this._scene.add( this._World );
					if(this.loaded_models >= 1){
						this._generateTiles();
					
					}
                    
            });
            });
			
			
            
        });
        
        
        //console.log(renderedTiles);
        
        
		
		this._Character = new THREE.Group();
		
		new ModelLoader('models/character.glb', (e) => {
            let lego_char = e.scene;
			
                lego_char.traverse((node) => {
					if(node.isMesh) {
                        node.geometry.computeVertexNormals();
						node.receiveShadow = true;
                        node.castShadow = true;
                        
                        node.material.flatShading = false;
                        node.material.roughness = 0.7;
                        
                    }
                });
                
            lego_char.translateY(-60);
            this._Character.add(lego_char);
		});
		this._Character.visible = false;
		this._Character.position.set(0,60,0);
		this._scene.add( this._Character );
		
		//this._camera.far = 15001.0;
        this._camera.far = 7001.0;
        this._camera.updateProjectionMatrix();
		const fog_color = 0xFFFFFF;  // white
	    const fog_near = this._camera.near;
	    const fog_far = this._camera.far;
	    this._scene.fog = new THREE.Fog(fog_color, fog_near, fog_far);
		this._scene.background = new THREE.Color(fog_color);
		
        const gui = new GUI();
		gui.add(this._settings,'fog');
		gui.add(this._camera,'far', 0, 20000).onChange(() => {
			this._camera.updateProjectionMatrix();
			this._scene.fog.near = this._camera.near;
			this._scene.fog.far = this._camera.far;
			});
		//gui.add( document, 'title' );
		
        this._RAF();
        
        
        
        document.addEventListener('keyup', (e) => {
			this._keys[e.keyCode] = false;
            if(this._keys['W'.charCodeAt(0)] || this._keys['S'.charCodeAt(0)] || this._keys['A'.charCodeAt(0)] || this._keys['D'.charCodeAt(0)]){
                null; //movement_on
            }else{this._settings.active_movement = 0;}
                
		});
        
        document.addEventListener('keydown', (e) => {
			this._keys[e.keyCode] = true;
			//console.log('W'.charCodeAt(0) == e.keyCode);
			//console.log(e.code);
			
			switch(e.code){
				case 'KeyR': 
					this._settings.thirdPerson = 1 - this._settings.thirdPerson;
					this._settings.characterVisibility = 1 - this._settings.characterVisibility;
					
					if(this._settings.characterVisibility)
						this._Character.visible = true;
					else
						this._Character.visible = false;
						
                    if(this._controls)
                        this._controls.dispose();
                    
					if(this._settings.thirdPerson){
                        this._threejs.domElement.ownerDocument.exitPointerLock();//this._controls.unlock();
						console.log("3-Person On");
                        
						this._controls = new OrbitControls( this._camera, this._threejs.domElement );
                        this._controls.maxDistance = 300;
                        //this._controls.minDistance = 300;
                        //this._controls.minPolarAngle = 0;
                        //this._controls.maxPolarAngle = Math.PI/3;
                        this._camera.translateY(120);
                        this._camera.translateZ(-200);
					}else{
						console.log("3-Person Off");
						this._controls = new PointerLockControls(this._camera, this._threejs.domElement);
					}
				break;
                
                default: this._settings.active_movement = 1;
			}

		});
        
        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);
        

    }
    
    thirdP_view(){
        this._camera.rotation.setFromQuaternion(this._Character.quaternion, this._Character.rotation.order);
        this._camera.position.set(this._Character.position.x, this._Character.position.y, this._Character.position.z);
        this._camera.translateY(100);
        this._camera.translateZ(-200);
    }
	
	_generateTiles(){
			for(var worldx=0; worldx<50 ; worldx++){
			for(var worldz=0; worldz<50 ; worldz++){
				let tile = this._renderedTiles.children[0];
				//renderedTiles.traverse((tile) => {
					//console.log(this.loaded_models);
				let model_length = ((5*32)+22)*20;
				//console.log(renderedTiles.children[0]);
				//console.log(tile);
				tile.position.x = (model_length)*worldx; //6*(182*5) // 6*(5*32 +22)*5 
				tile.position.z = (model_length)*worldz;
				this._scene.add( tile.clone() );
				//});
			}
			}
			
	} 
	
    
    _RAF()
    {
        requestAnimationFrame(() => {
            this._threejs.render(this._scene, this._camera);
            
			this._skybox.position.set(this._camera.position.x,this._camera.position.y,this._camera.position.z);
			
			if(this._settings.thirdPerson){
                if(this._settings.active_movement){
                    this.thirdP_view();
                }
                
                this._controls.target.set(this._Character.position.x, this._Character.position.y, this._Character.position.z);
                
                this._controls.update();

            }else{
                this._camera.position.set(this._Character.position.x, this._Character.position.y, this._Character.position.z);
				
				this._quaternion.set(0,this._camera.quaternion.y,0,this._camera.quaternion.w);
                this._Character.rotation.setFromQuaternion(this._quaternion, this._Character.rotation.order);
				this._Character.rotateY(Math.PI);

            }
            
			this._keyboardInput();
            this._stats.update();
            
            this._RAF();
        });
	
    }
	
	_keyboardInput(){
			if(this._keys['W'.charCodeAt(0)]){
				this._Character.translateZ(5);
                
			}
			if(this._keys['S'.charCodeAt(0)]){
				this._Character.translateZ(-5);
			}
			if(this._keys['A'.charCodeAt(0)]){
				if(this._settings.thirdPerson)
					this._Character.rotateY(0.05);
				else
					this._Character.translateX(5);
			}
			if(this._keys['D'.charCodeAt(0)]){
				if(this._settings.thirdPerson)
					this._Character.rotateY(-0.05);
				else
					this._Character.translateX(-5);
			}
	}
	
	_OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }
}

new BasicWorldDemo;

