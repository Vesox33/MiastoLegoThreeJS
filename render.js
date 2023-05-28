import * as THREE from 'three';
import Stats from 'stats';

import {OrbitControls} from 'OrbitControls';
import {PointerLockControls} from 'PointerLockControls';

import {ModelLoader} from 'modelLoader';

import GUI from 'lil-gui';

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
        
        this._city_reflection;
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
        
        this._upVector;
		this._vector;
        this._euler;
        this._quaternion;
		this._moveForward;
		this._moveRight;
		this._rotateRight;
        
        
        this._BVHcolliderMesh;
        
        this._visualizerBVH;
        
        this._raycaster;
        this._VectorDirections;
		
		this._Reset;
        
        
        //this.orbit = new OrbitControls( this._camera, this._threejs.domElement );
        //this.fps = new PointerLockControls(this._camera, this._threejs.domElement);
        
		/*this._capsule = new THREE.Group();
        this._capsule.add(new THREE.Mesh( 
			new THREE.CapsuleGeometry( 30, 60, 2, 12 ),
			new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: true} ))
		);
        this._capsule.add(new THREE.AxesHelper(15));*/
        
    }
    
    _Initialize(){
        
        
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
            
            worldSize: 5,
            gravity: -10,
            playerSpeed: 500,
			playerRotationSpeed: 2,
			carSpeed: 1000,
            
            gameReady: false,
		};
        
        this._VectorDirections = {
            Up: new THREE.Vector3( 0, 1, 0 ),
            Down: new THREE.Vector3( 0, -1, 0 ),
            Right: new THREE.Vector3( 1, 0, 0 ),
            Left: new THREE.Vector3( -1, 0, 0 ),
            Fwd: new THREE.Vector3( 0, 0, 1 ),
            Bkw: new THREE.Vector3( 0, 0, -1 ),
        };
        
        this._PlayerVelocity = new THREE.Vector3(0,0,0);
        this._PlayerDirection = new THREE.Vector3(0,0,0);
        
        this._keys = [];
        this._keys['W'.charCodeAt(0)] = false;
        this._keys['S'.charCodeAt(0)] = false;
        this._keys['A'.charCodeAt(0)] = false;
        this._keys['D'.charCodeAt(0)] = false;
        
        
        this._clock = new THREE.Clock();
        

        this._tileSet = ["skyscraper_1det"];
		
		this._World = new THREE.Group();
        this._World.name = "World";
        
        this._Player = new THREE.Group();
        this._Player.name = "Player";
        
        this._WorldColliders = new THREE.Group();
        this._WorldColliders.name = "WorldColliders";
		
        
		
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
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        

        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0xFFFFFF);
		
		
        this._stats = new Stats();
        document.body.appendChild(this._stats.dom);
	
		//this.clock = new THREE.Clock(true);
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
            
        this._skybox.name = "Sky";
		
		this._scene.add(this._skybox);
		
        
        this._InitWorld();
        
		
        this._CharacterCollider = new THREE.Mesh( 
			new THREE.CapsuleGeometry( 30, 60, 2, 12 ),
			new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: true} )
		);
        
        this._playerBoundingBox = new THREE.Box3().setFromObject(this._CharacterCollider);
		
		
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
			this._Player.add(this._CharacterCollider);
            this._Player.add(new THREE.AxesHelper(80));
            this._Player.add(lego_char);
		});
		
		this._Player.visible = false;
		this._Player.position.set(0,60,0);
		this._scene.add( this._Player );


        const gui = new GUI();
        
        const physic_settings = gui.addFolder('Physic');
        physic_settings.add( this._settings, 'gravity', - 10, 10, 1 ).onChange( v => {
            this._settings.gravity = parseFloat( v );
        });
        physic_settings.add( this._settings, 'playerSpeed', 1, 1000 );
        physic_settings.open();
        
		const fog_settings = gui.addFolder('Fog_settings');
		fog_settings.add(this._settings,'fog').onChange(() => {
			this._scene.fog = 1 - this._scene.fog;
			
			if(this._settings.fog){
				//this._camera.far = 15001.0;
				this._camera.far = 7001.0;
				this._camera.updateProjectionMatrix();
				this._scene.fog = new THREE.Fog(0xFFFFFF, this._camera.near, this._camera.far);
				
			}else{
				this._scene.fog = 0;
				this._camera.far = 1000001.0;
				this._camera.updateProjectionMatrix();
			}
		});
		fog_settings.add(this._camera,'far', 0, 20000).onChange(() => {
			if(this._settings.fog){
				this._camera.updateProjectionMatrix();
				this._scene.fog.near = this._camera.near;
				this._scene.fog.far = this._camera.far;
				
			}
		});
		
        this._RAF();
        
        
        
        document.addEventListener('keyup', (e) => {
			this._keys[e.keyCode] = false;
            
                
		});
        
        document.addEventListener('keydown', (e) => {
			this._keys[e.keyCode] = true;
			//console.log('W'.charCodeAt(0) == e.keyCode);
			console.log(e.code+"-"+ e.keyCode);
			
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
                        this._controls.maxDistance = 300;
                        //this._controls.minDistance = 300;
                        //this._controls.minPolarAngle = 0;
                        //this._controls.maxPolarAngle = Math.PI/3;
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

            this._controls.maxPolarAngle = Math.PI / 2;
            this._controls.minDistance = 1;
            this._controls.maxDistance = 200;
            this._controls.update();

        } else {

        }
        
        requestAnimationFrame(() => {
            this._threejs.render(this._scene, this._camera);
            
			this._skybox.position.set(this._camera.position.x,this._camera.position.y,this._camera.position.z);
            
            //if(delta){
                this._UpdatePlayer(delta);
            //}

            this._RAF();
        });
    }
	

	_UpdatePlayer( delta ){
        if(delta){
            if(this._keys['W'.charCodeAt(0)] || this._keys['S'.charCodeAt(0)] || this._keys['A'.charCodeAt(0)] || this._keys['D'.charCodeAt(0)]){
                this._settings.active_movement = 1; //movement_on
            }else{
				this._settings.active_movement = 0;
			}
            
            //console.log("delta: "+delta);
            //console.log(this._Player.position);
            //console.log(this._PlayerState.playerIsOnGround);
            
                if ( this._PlayerState.playerIsOnGround ) {
                    this._PlayerVelocity.y = 0;
                    
                } else {
                    this._PlayerVelocity.y += delta * this._settings.gravity * 0.3;
                }
                
                /*if( this._settings.active_movement ){
                    if(this._PlayerVelocity.z > 0)
                        this._PlayerVelocity.z += delta * this._settings.gravity * 0.3;
                }*/
                
                //this._PlayerVelocity.x += delta * this._settings.gravity * 0.3;
                
                //console.log(this._PlayerVelocity);
                
                
                
            
            if(!this._settings.thirdPerson){ //FPS
                this._PlayerState.fwdPressed = this._keys['W'.charCodeAt(0)];
                this._PlayerState.bkdPressed = this._keys['S'.charCodeAt(0)];
                this._PlayerState.lftPressed = this._keys['A'.charCodeAt(0)];
                this._PlayerState.rgtPressed = this._keys['D'.charCodeAt(0)];

                //if(this._keys['W'.charCodeAt(0)]){
                        //this._Player.translateZ(this._settings.playerSpeed * delta);
                        //this._PlayerVelocity.addScaledVector( this._PlayerVelocity, delta * this._settings.playerSpeed  );
                //}
                //if(this._keys['S'.charCodeAt(0)]){
                        //this._Player.translateZ(-this._settings.playerSpeed * delta);
                        //this._PlayerVelocity.z = 1.0;
                //}
                //if(this._keys['A'.charCodeAt(0)]){
                        //this._Player.translateX(this._settings.playerSpeed * delta);
                        //this._PlayerVelocity.z = 1.0;
                //}
                //if(this._keys['D'.charCodeAt(0)]){
                        //this._Player.translateX(-this._settings.playerSpeed * delta);
                        //this._PlayerVelocity.z = 1.0;
                //}
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
                if(this._keys['W'.charCodeAt(0)]){
                    this._Player.translateZ(this._settings.playerSpeed * delta);
                }
                if(this._keys['S'.charCodeAt(0)]){
                    this._Player.translateZ(-this._settings.playerSpeed * delta);
                }
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
            console.log(adj_player_direction);
            //const adj_player_direction = new THREE.Vector3(0,0,1e-10).applyEuler(this._Player.rotation);
            //this._PlayerVelocity.addScaledVector( player_direction, delta * this._settings.playerSpeed);
            this._PlayerVelocity.x = adj_player_direction.x;
            this._PlayerVelocity.z = adj_player_direction.z;
            
            this._Player.position.addScaledVector( this._PlayerVelocity, delta * this._settings.playerSpeed );
            //this._Player.position.addScaledVector( this._PlayerVelocity.copy(adj_player_direction), delta * this._settings.playerSpeed );
            
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
                    this._camera.position.set(this._Player.position.x, this._Player.position.y, this._Player.position.z);
                    this._quaternion.set(0,this._camera.quaternion.y,0,this._camera.quaternion.w);
                    this._Player.rotation.setFromQuaternion(this._quaternion, this._Player.rotation.order);
                    this._Player.rotateY(Math.PI);
            }
            
            
            if(this._settings.gameReady){
                const Worldbvh = this._BVHcolliderMesh.geometry.boundsTree;
                 
                //let rayDirection = new THREE.Vector3(0,0,0);
                //rayDirection.copy(this._VectorDirections.Fwd); 
                //const rayDistance = 100;
                //rayDirection.applyEuler(this._Player.rotation);
                //rayDirection.normalize();
                
                //this._raycaster.set(this._Player.position, rayDirection.applyQuaternion(this._Player.quaternion).normalize() );
                //this._raycaster.set(this._Player.position, rayDirection.applyEuler(this._Player.rotation).normalize() );
                //this._raycaster.set(this._Player.position, rayDirection.set(0,this._Player.rotation.y,0).normalize() );
                
                //console.log(new THREE.Vector3().setFromEuler(this._Player.rotation));
                //console.log(this._Player);
                
                //console.log(new THREE.Vector3(1e-10,1e-10,1e-10).applyEuler(this._Player.rotation).normalize());
                //this._Player.children[1].rotation.set(rayDirection.x, rayDirection.y, rayDirection.z);
                let rayDirection = new THREE.Vector3(0,0,1e-10).applyEuler(this._Player.rotation);
                
                this._raycaster.set(this._Player.position, rayDirection);
                
                //test
                this._Player.children[1].rotation.setFromVector3(rayDirection);
                
                const FwdIntersection = this._raycaster.intersectObjects( [this._BVHcolliderMesh] ); //!! [ ]
                    
                if (FwdIntersection.length > 0) {
                    if (FwdIntersection[0].distance < 50){
                        console.log('hit');
                        this._Player.translateZ(-this._settings.playerSpeed * delta);
                    }
                }
                
                
                rayDirection.copy(this._VectorDirections.Down);
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
                
                //const intersectsWorld = Worldbvh.intersectsBox(this._playerBoundingBox, this._Player.matrixWorld);
                //console.log(intersectsWorld);
                //console.log(this._Player.children[0].geometry);
                
                /*const intersectsWorld = Worldbvh.intersectsGeometry(this._Player.children[0].geometry, this._Player.matrixWorld);
                if (intersectsWorld) {
                  console.log('hit!')// Collision detected
                } else {
                  // No collision
                }*/
                
            }
        }    
	}
	_Reset(){
        //this._Player.position.set(0,0,0);
        this._PlayerState.playerIsOnGround = true;
		this._Player.position.y = 60;
		
	}
    
    _InitWorld(){
        this._renderedTiles = new THREE.Group();
        
        this._renderedColliders = new THREE.Group();
        
        this._tileSet.forEach((PLYTKA) => {
            let model_high = 'models/world/high/'+PLYTKA+'_high'+'.glb';
            let model_low = 'models/world/low/'+PLYTKA+'_low'+'.glb';
            let model_collider = 'models/world/colliders/'+PLYTKA+'_collider'+'.glb';
            
            //---draw---
            new ModelLoader(model_high, (mh) => {
            new ModelLoader(model_low, (ml) => {
            new ModelLoader(model_collider, (mc) => {
                let model_high = mh.scene;
                let model_low = ml.scene;
                let model_collider = mc.scene;
                
                model_high.name = "high";
                model_low.name = "low";
                model_collider.name = "collider";
                
                let ground_high = model_high.children[0];
                let tower_high = model_high.children[1];
                
                let ground_low = model_low.children[0];
                let tower_low = model_low.children[1];
                
                //let model_collider_hitbox = model_collider.children[0];
                
                this._renderedColliders.add(model_collider.clone());
                
                    
                    ground_high.traverse((node) => {
                        if(node.isMesh) {
                            //console.log(node.geometry);
                            //node.geometry.computeBoundsTree();
                            
                            node.geometry.computeVertexNormals();
                            node.receiveShadow = true;
                            
                            node.material.flatShading = false;
                            node.material.roughness = 0.7;
                            
                            //console.log(node);
                        }
                    });
                    
                    tower_high.traverse((node) => {
                        if(node.isMesh) {
                            //node.geometry.computeBoundsTree();
                            
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
                    //this._scene.add( ground ); //single
                    //console.log(this._World );
                    //this._scene.add( this._World );
                    
                    
                    let _positions = [];
			
                let i = 0;
                
                for(var worldx=0; worldx<this._settings.worldSize; worldx++){
                for(var worldz=0; worldz<this._settings.worldSize; worldz++){
                    _positions[i] = new THREE.Vector3(model_length*worldx , 0, model_length*worldz);
                    i++;
                }
                }
                
                for(let i=0;i<_positions.length;i++){
                    
                    let tile = this._renderedTiles.children[0];
                    let tile_collider = this._renderedColliders.children[0];

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
                staticGenerator.name = "staticGenerator";
                //staticGenerator.applyWorldTransforms = true;
                staticGenerator.attributes = [ 'matrixWorld', 'positions' ];
                
                //console.log(staticGenerator);

                const mergedGeo = staticGenerator.generate();
                mergedGeo.name = "mergedGeo";
                mergedGeo.boundsTree = new MeshBVH( mergedGeo, 20 );
                console.log(mergedGeo);
                
                this._BVHcolliderMesh = new THREE.Mesh( mergedGeo );
                this._BVHcolliderMesh.name = "_BVHcolliderMesh";
                this._BVHcolliderMesh.material.wireframe = true;
                this._BVHcolliderMesh.material.opacity = 1;
                this._BVHcolliderMesh.material.transparent = true;
                console.log(this._BVHcolliderMesh);

                this._visualizerBVH = new MeshBVHVisualizer( this._BVHcolliderMesh, 20 );
                
                this._scene.add( this._World );
                //this._scene.add( this._WorldColliders );
                this._scene.add( this._visualizerBVH );
                this._scene.add( this._BVHcolliderMesh );
                
                
                console.log(this._World);
                console.log(this._WorldColliders);
                console.log(this._scene);
                
                this._settings.gameReady = true;
                    
            });
            });
            });
			
 
        });
        
        	
        
    }
	
	_OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }
}

new BasicWorldDemo;

