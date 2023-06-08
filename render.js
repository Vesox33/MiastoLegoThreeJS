 import * as THREE from 'three';
import Stats from 'stats';

import {OrbitControls} from 'OrbitControls';
import {PointerLockControls} from 'PointerLockControls';

import {ModelLoader} from 'modelLoader';


import { MeshBVH ,computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer, StaticGeometryGenerator } from 'three-mesh-bvh';


//to na pozniej
//import {LDrawLoader} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/loaders/LDrawLoader.js';
//https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/loaders/LDrawLoader.js';
//import {LDrawUtils} from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/utils/LDrawUtils.js';



class BasicWorldDemo{
    

    constructor(){
        this._Initialize();
        
        this._threejs;
        this._camera;
        
        this._skybox;
        this._threejs;
        this._scene;
        this._controls;
        this._stats;
        
        //this._city_reflection;
		this._keys;
		this._UpdatePlayer();
        
        this._PlayerState;
        
		this._settings;
		
        this._InitWorld;
        this._World;
        this._WorldColliders;
        this._tileSet;
		this._renderedTiles;
        this._renderedColliders;
        
		this._Player;
        this._PlayerVelocity;
        this._PlayerDirection;
        
		this._CharacterCollider;
        this._playerBoundingBox;

		
        this._clock;
        
		this._vector;
        this._euler;
        this._quaternion;
        
        
        this._BVHcolliderMesh;
        
        this._visualizerBVH;
        
        this._raycaster;
		
		this._Reset;
		
		this._coins;
		
		this._Loader;
		
		this.char_model;
        
        this.mixer;
        this.clips;


    }
    
    async _Initialize(){
        
        
        this._PlayerState = {
            fwdPressed: false,
            bkdPressed: false,
            lftPressed: false,
            rgtPressed: false,
            
            playerIsOnGround: true,
            
            
        };
        
		this._settings = {
			thirdPerson: false,
			fly: false,
			characterVisibility: false,
			active_movement: false,
			fog: false,
            colliders: false,
            
            debug: false,
            menu: false,
            
            worldSize: 5,
            gravity: -10,
            playerSpeed: 500,
			playerRotationSpeed: 2,
			carSpeed: 1000,
            coinsNumber: 0,
            
            gameReady: false,
		};
        
        
        
        this._PlayerVelocity = new THREE.Vector3(0,0,0);
        this._PlayerDirection = new THREE.Vector3(0,0,0);
        
        this._keys = [];
        this._keys['W'.charCodeAt(0)] = false;
        this._keys['S'.charCodeAt(0)] = false;
        this._keys['A'.charCodeAt(0)] = false;
        this._keys['D'.charCodeAt(0)] = false;
        
        
        this._clock = new THREE.Clock();
        

        //this._tileSet = ["skyscraper_1det","workshop","airport","police_station", "river"];
        this._tileSet = ["workshop","airport","police_station", "river"];
		
		this._coins = new THREE.Group();
        this._coins.name = "Coins";
		
		this._World = new THREE.Group();
        this._World.name = "World";
        
        this._Player = new THREE.Group();
        this._Player.name = "Player";
        
        this._WorldColliders = new THREE.Group();
        this._WorldColliders.name = "WorldColliders";
		
		this._Loader = new ModelLoader();
		
        
		
		this._vector = new THREE.Vector3();
        this._euler = new THREE.Euler();
        this._quaternion = new THREE.Quaternion();
        
		
        this._threejs = new THREE.WebGLRenderer({antialias: true});
        
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
		this._threejs.useLegacyLights = true;
        //this._threejs.outputEncoding = THREE.sRGBEncoding;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);
		this._threejs.setClearColor(new THREE.Color( 0x00000 ));
        
        document.body.appendChild(this._threejs.domElement);
        
        
        //-----Init Coin------
        const coin_init = document.createElement("div");
        coin_init.setAttribute("style", "width: 500px; height:100px; left:0; bottom:0; position: fixed; color:white; font-size:50px; font-family: Consolas");

        //const coin_image = document.createElement("img");
        //coin_image.setAttribute("style", "width: 100px; height:100px; background-color: black; float:left;");
        //coin_init.appendChild(coin_image);
        
        const coin_number = document.createElement("span");
        coin_number.id = "coins_total";
        coin_number.setAttribute("style","float: left");
        coin_number.innerHTML = "Kryształy: 0";
        coin_init.appendChild(coin_number);
        
        
        document.body.appendChild(coin_init);
        //--------------------
        //-----Init menu------
        const menu = document.createElement("div");
        menu.id = "mainMenu";
        menu.setAttribute("style", "width: 500px; height:500px; right:0; top:20%; position: fixed; background-color: grey; transparent: 0.5; color:white; font-size:26px; font-family: Consolas");
        menu.style.visibility = "hidden";
        
        document.body.appendChild(menu);
        //--------------------
        //-----Debug menu------
        const debug_menu = document.createElement("div");
        debug_menu.id = "debugMenu";
        debug_menu.setAttribute("style", "width: 300px; height:500px; left:0; top:20%; position: fixed; background-color: orange; color:white; font-size:26px; font-family: Consolas");
        debug_menu.style.visibility = "hidden";
        
        
        
        document.body.appendChild(debug_menu);
        //--------------------
        
        
        
        const fov = 60;
        const aspect = 16/9;
        const near = 1.0;
        const far = 1000001.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        

        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0xFFFFFF);
		
		
        this._stats = new Stats();
        document.body.appendChild(this._stats.dom);
	
		this._controls = new PointerLockControls(this._camera, this._threejs.domElement);
		
		
		this._threejs.domElement.addEventListener('mousedown', (e) => {
            if(!this._settings.thirdPerson){
                this._threejs.domElement.requestPointerLock();//this._controls.lock();
            }
		});
        
        THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
        THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
        THREE.Mesh.prototype.raycast = acceleratedRaycast;
        this._raycaster = new THREE.Raycaster();
        this._raycaster.firstHitOnly = true;
        //raycaster.intersectObjects( [ mesh ] );
        
       //const rayDirection = new THREE.Vector3(0, -1, 0); // Ray pointing downwards
        //const rayDistance = 500; 
        
        
      
        const light = new THREE.DirectionalLight(0xFFFFFF, 1);
			light.position.set (15000, 15000, 15000);
			light.target.position.set(0, 0, 0);
			light.castShadow = true;
			light.shadow.mapSize.width = 2048;
			light.shadow.mapSize.height = 2048;
			light.shadow.camera.near = 0;
			light.shadow.camera.far = 100000;
			light.shadow.camera.left = -15000;
			light.shadow.camera.right = 15000;
			light.shadow.camera.top = 15000;
			light.shadow.camera.bottom = -15000;
			
		//this._scene.add(new THREE.CameraHelper(light.shadow.camera));
        
        this._scene.add(light);
		
        
        const ambientlight = new THREE.AmbientLight( 0xffffff, 0.4 );
		this._scene.add(ambientlight);
        
		const texture_loader = new THREE.TextureLoader();
		const sky = texture_loader.load('./Images/SkyBox4K.png');
        sky.mapping = THREE.SphericalReflectionMapping;
		//this._city_reflection = texture_loader.load('./Images/panorama-cityscape.jpg');
        //this._city_reflection.mapping = THREE.EquirectangularReflectionMapping;
        //this._city_reflection.mapping = THREE.EquirectangularRefractionMapping;
		
		
		this._skybox = new THREE.Mesh(
				new THREE.SphereGeometry( 1000000, 50, 50 ),
				new THREE.MeshBasicMaterial({
			    side: THREE.BackSide,
			    map: sky,
			    //wireframe: true
				})
			);
            
        this._skybox.name = "Sky";
		
		this._scene.add(this._skybox);
		
        
        await this._InitWorld();
        
		
        this._CharacterCollider = new THREE.Mesh( 
			new THREE.CapsuleGeometry( 30, 60, 2, 12 ),
			new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: true} )
		);
        //this._CharacterCollider.geometry.computeBoundingSphere();
        this._CharacterCollider.visible = false;
		
		//let char_model = await this._Loader.loadModel('models/character.glb');
		this.char_model = await this._Loader.loadModel('models/delsin.glb');
        //console.log(this.char_model);
        
        this.clips = this.char_model.animations;
        console.log(this.clips);
        this.char_model = this.char_model.scene.children[0];
        this.mixer = new THREE.AnimationMixer(this.char_model);
        
        
        this.animations = {
            breakdance: this.mixer.clipAction(this.clips[0]),
            fall: this.mixer.clipAction(this.clips[1]),
            run: this.mixer.clipAction(this.clips[2]),
            idle: this.mixer.clipAction(this.clips[3]),
            run_back: this.mixer.clipAction(this.clips[4]),
            
            tpose: this.mixer.clipAction(this.clips[5]),
        }
		
		//this.char_model = this.char_model.scene;
		
        this.char_model.translateY(-60);
        
		
                this.char_model.traverse((node) => {
					if(node.isMesh) {
                        node.geometry.computeVertexNormals();
						node.receiveShadow = true;
                        node.castShadow = true;
                        
                        node.material.emissive = new THREE.Color(0xFFFFFF);
                        node.material.emissiveIntensity = 0.5;
                        
                        node.material.flatShading = false;
                        node.material.roughness = 0.7;
                        
                    }
                });
                
        
		//this._CharacterCollider.translateY(2); //wazne przy kolizjach
        //this._Player.add(new THREE.AxesHelper(80));
        this._Player.add(this.char_model);
		
		
		this._Player.add(this._CharacterCollider);
		
		this._Player.visible = false;
		this._Player.position.set(0,60,0);
		this._scene.add( this._Player );

        //------DEBUG-----------
        
        var debug = document.getElementById("debugMenu");
        debug.innerHTML += "Gravity: <br>";
        
        const Gravit = document.createElement("input");
        Gravit.id = "gravit";
        Gravit.type = "range";
        Gravit.min = "-10";
        Gravit.max = "10";
        Gravit.value = "-10";
        debug.appendChild(Gravit);
        
        debug.innerHTML += "<br>Player Speed: <br>";
        const Pspeed = document.createElement("input");
        Pspeed.id = "pspeed";
        Pspeed.type = "range";
        Pspeed.min = "1";
        Pspeed.max = "1000";
        Pspeed.value = "500";
        debug.appendChild(Pspeed);
        
        debug.innerHTML += "<br>Fog enabled: ";
        const fog_settings = document.createElement("input");
        fog_settings.id = "fog_check";
        fog_settings.type = "checkbox";
        fog_settings.checked = this._settings.fog;
        debug.appendChild(fog_settings);
        
        debug.innerHTML += "<br>Fog distance: <br>";
        fog_settings.id = "fog_dist";
        fog_settings.type = "range";
        fog_settings.min = "0";
        fog_settings.max = "5000";
        fog_settings.value = "500";
        fog_settings.disabled = 1-this._settings.fog;
        debug.appendChild(fog_settings);
        
        debug.innerHTML += "<br>Colliders: ";
        const Collid = document.createElement("input");
        Collid.id = "colliders";
        Collid.type = "checkbox";
        Collid.checked = this._settings.colliders;
        debug.appendChild(Collid);
        
        
        
        document.addEventListener("input", (e) => {
            //console.log(v.target.id);
            switch(e.target.id){
                case "gravit":
                    this._settings.gravity = parseFloat( e.target.value );
                break;
                case "pspeed": 
                    this._settings.playerSpeed = parseFloat( e.target.value );
                break;
                case "fog_check":
                    if(e.target.checked){
                        this._settings.fog = true;
                        this._scene.fog = true;
                        document.getElementById('fog_dist').disabled = false;
                        this._camera.far = 7001.0;
                        this._camera.updateProjectionMatrix();
                        this._scene.fog = new THREE.Fog(0xFFFFFF, this._camera.near, this._camera.far);
                        
                    }else{
                        this._settings.fog = false;
                        this._scene.fog = false;
                        document.getElementById('fog_dist').disabled = true;
                        this._camera.far = 1000001.0;
                        this._camera.updateProjectionMatrix();
                    }
                break;
                case "fog_dist":
                    //if(this._settings.fog){
                        this._camera.far = parseFloat( e.target.value );
                        this._camera.updateProjectionMatrix();
                        //this._scene.fog.near = this._camera.near;
                        this._scene.fog.far = this._camera.far;
                    //}
                
                break;
                
                case "colliders":
                    if(e.target.checked){
                        this._settings.colliders = true;
                        this._BVHcolliderMesh.visible = true;
                        this._CharacterCollider.visible = true;
                        
                    }else{
                        this._settings.colliders = false;
                        this._BVHcolliderMesh.visible = false;
                        this._CharacterCollider.visible = false;
                    }
                break;
                
            }
        });
        
        
        //-----------------------------------------
		
        this._RAF();
        
        
        
        document.addEventListener('keyup', (e) => {
			this._keys[e.keyCode] = false;
            
                
		});
        
        document.addEventListener('keydown', (e) => {
			this._keys[e.keyCode] = true;
			//console.log('W'.charCodeAt(0) == e.keyCode);
			//console.log(e.code+"-"+ e.keyCode);
			
			switch(e.code){
				case 'KeyR': 
					this._settings.thirdPerson = 1 - this._settings.thirdPerson;
					this._settings.characterVisibility = 1 - this._settings.characterVisibility;
					
					if(this._settings.characterVisibility)
						this._Player.visible = true;
					else
						this._Player.visible = false;
						
                    if(this._controls)
                        this._controls.dispose();
                    
					if(this._settings.thirdPerson){
                        this._threejs.domElement.ownerDocument.exitPointerLock();//this._controls.unlock();
						console.log("3-Person On");
                        
						this._controls = new OrbitControls( this._camera, this._threejs.domElement );
                        //this._controls.minPolarAngle = 0;
                        this._controls.maxPolarAngle = Math.PI / 2;
                        this._controls.minDistance = 1;
                        this._controls.maxDistance = 200;
                        this._camera.translateY(120);
                        this._camera.translateZ(-200);
                        
                        this._camera
                            .position
                            .sub( this._controls.target )
                            .normalize()
                            .multiplyScalar( 200 )
                            .add( this._controls.target );
                
					}else{
						console.log("3-Person Off");
						this._controls = new PointerLockControls(this._camera, this._threejs.domElement);
					}
				break;
                case 'KeyI':
                    this._settings.debug = 1-this._settings.debug;
                    if(this._settings.debug)
                        document.getElementById("debugMenu").style.visibility = "visible";
                    else
                        document.getElementById("debugMenu").style.visibility = "hidden";
                break;
                case 'KeyP':
                console.log(this._settings.menu);
                    this._settings.menu = 1-this._settings.menu;
                    if(this._settings.menu)
                        document.getElementById("mainMenu").style.visibility = "visible";
                    else
                        document.getElementById("mainMenu").style.visibility = "hidden";
                break;
                
			}

		});
        
        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);
        

    }
    
	
    
    _RAF()
    {
        this._stats.update();
        //const delta = Math.min( this._clock.getDelta(), 0.1 );
        const delta = Math.min( this._clock.getDelta(), 0.1 );
        
        if ( this._settings.thirdPerson ) {

            
            this._controls.update();

        } else {

        }
        
        requestAnimationFrame(() => {
            this._threejs.render(this._scene, this._camera);
            
			this._skybox.position.set(this._camera.position.x,this._camera.position.y,this._camera.position.z);
            
            this._UpdatePlayer(delta);

            this._RAF();
        });
    }
	

	_UpdatePlayer( delta ){
        if(delta){
            
            this._PlayerState.fwdPressed = this._keys['W'.charCodeAt(0)];
            this._PlayerState.bkdPressed = this._keys['S'.charCodeAt(0)];
            
			
            if(this._keys['W'.charCodeAt(0)] || this._keys['S'.charCodeAt(0)] || this._keys['A'.charCodeAt(0)] || this._keys['D'.charCodeAt(0)]){
                this._settings.active_movement = 1; //movement_on   
            }else{
				this._settings.active_movement = 0;
			}
            
            if(this.mixer){
                if(this._keys['W'.charCodeAt(0)]){
                    this.animations.idle.stop();
                    this.animations.breakdance.stop();
                    this.animations.run_back.stop();
                    
                    this.animations.run.play();
                    
                } 
                if(this._keys['S'.charCodeAt(0)]){
                    this.animations.idle.stop();
                    this.animations.breakdance.stop();
                    this.animations.run.stop();
                    
                    this.animations.run_back.play();
                    
                }
                if(this._keys['A'.charCodeAt(0)] && !this._keys['W'.charCodeAt(0)] && !this._keys['S'.charCodeAt(0)]){
                    this.animations.idle.stop();
                    this.animations.run.stop();
                    this.animations.run_back.stop();
                    
                    this.animations.breakdance.play();
                    
                }
                if(this._keys['D'.charCodeAt(0)] && !this._keys['W'.charCodeAt(0)] && !this._keys['S'.charCodeAt(0)]){
                    this.animations.idle.stop();
                    this.animations.run.stop();
                    this.animations.run_back.stop();
                    
                    this.animations.breakdance.play();

                }
                if(!this._settings.active_movement){
                    this.animations.run.stop();
                    this.animations.run_back.stop();
                    this.animations.breakdance.stop();
                    
                    this.animations.idle.play();
                    
                }
                    
                this.mixer.update(delta);
            }
            
            
            
            if ( this._PlayerState.playerIsOnGround ) {
                this._PlayerVelocity.y = 0;
                this.animations.fall.stop();
            } else {
                this._PlayerVelocity.y += delta * this._settings.gravity * 0.3;
                this.animations.idle.stop();
                this.animations.run.stop();
                this.animations.fall.play();
            }

            if(!this._settings.thirdPerson){ //FPS
                this._PlayerState.lftPressed = this._keys['A'.charCodeAt(0)];
                this._PlayerState.rgtPressed = this._keys['D'.charCodeAt(0)];
                
                if(this._keys[' '.charCodeAt(0)]){
                    if ( this._PlayerState.playerIsOnGround ) {
                        this._PlayerVelocity.y = 1.0;
                        this._PlayerState.playerIsOnGround = false;
                    }
                }
                /*if(this._keys[16]){ //lshift
                        this._Player.translateY(-this._settings.playerSpeed * delta)
                }*/
            }else{ //3rd person
                //this._PlayerState.lftPressed = this._keys['A'.charCodeAt(0)];
                //this._PlayerState.rgtPressed = this._keys['D'.charCodeAt(0)];
                
                if(this._keys['A'.charCodeAt(0)]){
                    this._Player.rotateY(this._settings.playerRotationSpeed * delta);
                }
                if(this._keys['D'.charCodeAt(0)]){
                    this._Player.rotateY(-this._settings.playerRotationSpeed  * delta);
                }
                if(this._keys[' '.charCodeAt(0)]){
                    if ( this._PlayerState.playerIsOnGround ) {
                        this._PlayerVelocity.y = 1.0;
                        this._PlayerState.playerIsOnGround = false;
                    }
                }
                /*if(this._keys[16]){ //lshift
                        this._Player.translateY(-this._settings.playerSpeed * delta)
                }*/
                
            }
            
            this._PlayerDirection.set(
                    this._PlayerState.lftPressed-this._PlayerState.rgtPressed,
                    0,
                    this._PlayerState.fwdPressed-this._PlayerState.bkdPressed
                );
                //console.log(this._PlayerDirection);
                
                this._PlayerVelocity.x = this._PlayerDirection.x;
                this._PlayerVelocity.z = this._PlayerDirection.z;
                
                const adj_player_direction = new THREE.Vector3().copy(this._PlayerDirection).applyEuler(this._Player.rotation);
                adj_player_direction.y = 0;
                //console.log(adj_player_direction);
                
                this._PlayerVelocity.x = adj_player_direction.x;
                this._PlayerVelocity.z = adj_player_direction.z;

            this._Player.position.addScaledVector( this._PlayerVelocity, delta * this._settings.playerSpeed );
            
            //console.log(this._PlayerVelocity);
            
            this._Player.updateMatrixWorld();
            
			
            if(this._settings.thirdPerson){
                this._camera.position.sub( this._controls.target );
                this._controls.target.copy( this._Player.position );
                this._camera.position.add( this._Player.position );
                
                    if(this._settings.active_movement){
                        this._camera.rotation.setFromQuaternion(this._Player.quaternion, this._Player.rotation.order);
                        this._camera.position.set(this._Player.position.x, this._Player.position.y, this._Player.position.z);
                        this._camera.translateY(100);
                        this._camera.translateZ(-200);
                    }
                    this._controls.target.set(this._Player.position.x, this._Player.position.y, this._Player.position.z);
                    this._controls.update();
                }else{
                    this._camera.position.set(this._Player.position.x, this._Player.position.y+20, this._Player.position.z);
                    this._quaternion.set(0,this._camera.quaternion.y,0,this._camera.quaternion.w);
                    this._Player.rotation.setFromQuaternion(this._quaternion, this._Player.rotation.order);
                    this._Player.rotateY(Math.PI);
            }
            
            
            if(this._settings.gameReady){
                const Worldbvh = this._BVHcolliderMesh.geometry.boundsTree;
				
				/*const temp_coll_pos = new THREE.Vector3();
				temp_coll_pos.copy(this._Player.children[0].position);
				
                this._Player.children[0].position.addScaledVector( this._PlayerVelocity, delta * this._settings.playerSpeed );
				this._Player.children[0].updateMatrixWorld();
				
				//const intersectsWorld = Worldbvh.intersectsBox(this._playerBoundingBox, this._Player.matrixWorld);
                const intersectsWorld = Worldbvh.intersectsGeometry(this._Player.children[0].geometry, this._Player.children[0].matrixWorld);
				
                if (intersectsWorld) {
					// Collision detected
                  console.log('hit!')
				  this._Player.children[0].position.copy(temp_coll_pos);
				  this._Player.children[0].updateMatrixWorld();
                } else {
					// No collision
                  this._Player.children[0].position.copy(temp_coll_pos);
				  this._Player.children[0].updateMatrixWorld();
				  this._Player.position.addScaledVector( this._PlayerVelocity, delta * this._settings.playerSpeed );
                }*/
                
                let coin_handle = document.getElementById("coins_total");
                
                //--coins
                //let t = this._clock.getElapsedTime();
                for(let i=0;i<this._coins.children.length;i++){
                    this._coins.children[i].rotation.x += 0.1;
                    //this._coins.children[i].rotation.y += 0.1;
                    this._coins.children[i].rotation.z += 0.1;
                    //this._coins.children[i].position.y += Math.sin( t * 2 ) * 3;
                    
                    if (this._Player.position.distanceTo(this._coins.children[i].position) < 50) {
                            console.log('collected!');
                            this._settings.coinsNumber += 1;
                            coin_handle.innerHTML = "Kryształy: "+this._settings.coinsNumber;
                            
                            this._coins.children[i].clear();
                            this._coins.children[i].removeFromParent();

                    }
                }
                //---
                
				
                let rayDirection = new THREE.Vector3(0,0,0);
				
				//-------------Forward Ray
                rayDirection.set(0,0,1e-10).applyEuler(this._Player.rotation);
                this._raycaster.set(this._Player.position, rayDirection);
                //test
                this._Player.children[0].rotation.setFromVector3(rayDirection);
                const FwdIntersection = this._raycaster.intersectObjects( [this._BVHcolliderMesh] ); //!! [ ]
                    
                if (FwdIntersection.length > 0) {
                    if (FwdIntersection[0].distance < 50){
                        //console.log('hit');
                        this._Player.translateZ(-this._settings.playerSpeed * delta);
                    }
                }
				
				//-------------Back Ray
				rayDirection.set(0,0,-1e-10).applyEuler(this._Player.rotation);
                this._raycaster.set(this._Player.position, rayDirection);
                //test
                this._Player.children[0].rotation.setFromVector3(rayDirection);
                const BkdIntersection = this._raycaster.intersectObjects( [this._BVHcolliderMesh] ); //!! [ ]
                    
                if (BkdIntersection.length > 0) {
                    if (BkdIntersection[0].distance < 50){
                        //console.log('hit');
                        this._Player.translateZ(this._settings.playerSpeed * delta);
                    }
                }
				
				//-------------Right Ray
				rayDirection.set(1e-10,0,0).applyEuler(this._Player.rotation);
                this._raycaster.set(this._Player.position, rayDirection);
                //test
                this._Player.children[0].rotation.setFromVector3(rayDirection);
                const RgtIntersection = this._raycaster.intersectObjects( [this._BVHcolliderMesh] ); //!! [ ]
                    
                if (RgtIntersection.length > 0) {
                    if (RgtIntersection[0].distance < 50){
                        //console.log('hit');
                        this._Player.translateX(-this._settings.playerSpeed * delta);
                    }
                }
				
				//-------------Left Ray
				rayDirection.set(-1e-10,0,0).applyEuler(this._Player.rotation);
                this._raycaster.set(this._Player.position, rayDirection);
                //test
                this._Player.children[0].rotation.setFromVector3(rayDirection);
                const LftIntersection = this._raycaster.intersectObjects( [this._BVHcolliderMesh] ); //!! [ ]
                    
                if (LftIntersection.length > 0) {
                    if (LftIntersection[0].distance < 50){
                        //console.log('hit');
                        this._Player.translateX(this._settings.playerSpeed * delta);
                    }
                }
                
				
				//-------------Ground
                rayDirection.copy(new THREE.Vector3(0,-1,0)); //this._VectorDirections.Down
                this._raycaster.set(this._Player.position, rayDirection);
                const groundIntersections = this._raycaster.intersectObjects( [this._BVHcolliderMesh] ); //!! [ ]
                
                if (groundIntersections.length > 0) {
                    this._PlayerState.playerIsOnGround = groundIntersections[0].distance < 60;
					
                    if(this._PlayerState.playerIsOnGround)
                        this._Player.position.y = this._Player.position.y - groundIntersections[0].distance + 59;
                }else{
                    this._PlayerState.playerIsOnGround = false;
                }
                
                if ( this._Player.position.y < - 500 ) {
                    this._Reset();
                }
                
                
                
            }
        }    
	}
	_Reset(){
        //this._Player.position.set(0,0,0);
        this._PlayerState.playerIsOnGround = true;
		this._Player.position.y = 60;
		
	}
    
     async _InitWorld(){
        const loader = new ModelLoader();
        
        this._renderedTiles = new THREE.Group();
        
        this._renderedColliders = new THREE.Group();
        
        await Promise.all(this._tileSet.map(async (PLYTKA) => {
            let name_high = 'models/world/high/'+PLYTKA+'_high'+'.glb';
            let name_low = 'models/world/low/'+PLYTKA+'_low'+'.glb';
            let name_collider = 'models/world/colliders/'+PLYTKA+'_collider'+'.glb';
            
            //---draw---
                
                let model_high = await this._Loader.loadModel(name_high);
                let model_low = await this._Loader.loadModel(name_low);
                let model_collider = await this._Loader.loadModel(name_collider);
				
                console.log(model_high);
				model_high = model_high.scene;
				model_low = model_low.scene;
                model_collider = model_collider.scene;
				
                
                model_high.name = "high";
                model_low.name = "low";
                model_collider.name = "collider";
                
                this._renderedColliders.add(model_collider.clone());
                
                    model_high.traverse((node) => {
                        if(node.isMesh) {
                            
                            node.geometry.computeVertexNormals();
                            node.receiveShadow = true;
                            node.castShadow = true;
                            
                            //node.material.envMap = new THREE.Color(0xffffff);
                            node.material.flatShading = false;
                            node.material.roughness = 0; //0.3
                            node.material.metalic = 0.2;
                            
                        }
                    });
                    
                    model_low.traverse((node) => {
                        if(node.isMesh) {
                            node.material.flatShading = true;
                        }
                    });
                    
                 /* STANDARD RENDERING */
                    
                       
                    //20 threejs units = 1 jednostka lego (from blender)
                    const PlytkaLOD = new THREE.LOD();
                    
                    let model_length = ((5*32)+22)*20;
                    //let model_length = ((5*32)+22);

                    PlytkaLOD.addLevel(model_high.clone(), 0);
                    
                    PlytkaLOD.addLevel(model_low.clone(), model_length*1.5);
                    
                    PlytkaLOD.name = PLYTKA;
                    
                    this._renderedTiles.add( PlytkaLOD );
                    
                
                
                if(this._renderedTiles.children.length == this._tileSet.length){
                    let _positions = [];
                
                    let i = 0;
                    
                    for(var worldx=0; worldx<this._settings.worldSize; worldx++){
                    for(var worldz=0; worldz<this._settings.worldSize; worldz++){
                        _positions[i] = new THREE.Vector3(model_length*worldx , 0, model_length*worldz);
                        i++;
                    }
                    }
                    
                    for(let i=0;i<_positions.length;i++){
                        let randomly = Math.floor(Math.random() * this._renderedTiles.children.length);
                        
                        let tile = this._renderedTiles.children[randomly];
                        let tile_collider = this._renderedColliders.children[randomly];

                        tile.position.x = _positions[i].x; //6*(182*5) // 6*(5*32 +22)*5 
                        tile.position.z = _positions[i].z;
                        tile.updateMatrix();
                        tile.updateMatrixWorld();
                        
                        tile_collider.position.x = _positions[i].x; //6*(182*5) // 6*(5*32 +22)*5 
                        tile_collider.position.z = _positions[i].z;
                        tile_collider.updateMatrix();
                        tile_collider.updateMatrixWorld();
                        
                        this._World.add( tile.clone() );
                        this._WorldColliders.add( tile_collider.clone() );

                    }
                    
                    
                    const staticGenerator = new StaticGeometryGenerator( this._WorldColliders );
                    //const staticGenerator = new StaticGeometryGenerator( this._World);
                    staticGenerator.name = "staticGenerator";
                    //staticGenerator.applyWorldTransforms = true;
                    staticGenerator.attributes = [ 'matrixWorld', 'positions' ];
                    
                    //console.log(staticGenerator);

                    const mergedGeo = staticGenerator.generate();
                    mergedGeo.name = "mergedGeo";
                    mergedGeo.boundsTree = new MeshBVH( mergedGeo, 5 );
                    //console.log(mergedGeo);
                    
                    this._BVHcolliderMesh = new THREE.Mesh( mergedGeo );
                    this._BVHcolliderMesh.name = "_BVHcolliderMesh";
                    this._BVHcolliderMesh.material.wireframe = true;
                    this._BVHcolliderMesh.material.opacity = 1;
                    this._BVHcolliderMesh.material.transparent = true;
                    this._BVHcolliderMesh.visible = this._settings.colliders;
                    //console.log(this._BVHcolliderMesh);

                    this._visualizerBVH = new MeshBVHVisualizer( this._BVHcolliderMesh, 5 );
                    
                    this._scene.add( this._World );
                    //this._scene.add( this._WorldColliders );
                    //this._scene.add( this._visualizerBVH );
                    this._scene.add( this._BVHcolliderMesh );
                    
                    
                    console.log(this._World);
                    console.log(this._WorldColliders);
                    console.log(this._scene);
                    
                    
                    let CoinRayDir = new THREE.Vector3(0,-1,0);
                    let CoinRaycaster = new THREE.Raycaster();
                    CoinRaycaster.firstHitOnly = true;
                    
                    
                    const coin = new THREE.Mesh(
                        new THREE.IcosahedronGeometry( 30 ),
                        //new THREE.MeshStandardMaterial({ color: 0xffff00 })
                        new THREE.MeshNormalMaterial()
                        
                    );
                    
                    
                    
                    const coins_length = ((5*32)+22)*20;
                    
                    for(let k=0; k<1000; k++){
                        
                        //Math.random() * (max - min) + min;
                        coin.position.set(
                            Math.random() * (coins_length*this._settings.worldSize - coins_length) + 0,
                            1000,
                            Math.random() * (coins_length*this._settings.worldSize - coins_length) + 0
                        );
                        coin.updateMatrixWorld();
                        
                        
                        CoinRaycaster.set(coin.position, CoinRayDir);
                        const Coin_hit_ground = CoinRaycaster.intersectObjects( [this._BVHcolliderMesh] ); //!! [ ]
                        if (Coin_hit_ground.length > 0) {
                            coin.position.y = coin.position.y-Coin_hit_ground[0].distance+60;
                        }
                        
                        coin.updateMatrixWorld();
                        
                        
                        this._coins.add(coin.clone());
                        
                    }
                    
                    this._scene.add(this._coins);
                    
                    
                    this._settings.gameReady = true;
                }

			
 
        }));
        
        	
        
    }
	
	_OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }
}

new BasicWorldDemo;

