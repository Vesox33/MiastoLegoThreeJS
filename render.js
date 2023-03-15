import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.125.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/controls/OrbitControls.js';
import {ModelLoader} from './modelLoader.js';

class BasicWorldDemo{
	
    constructor(){
        this.skybox;
        this._threejs;
        this._scene;
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
        const far = 100001.0;
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
        
		
		const sky = new THREE.TextureLoader().load('./Images/SkyBox_4K.jpg');
		sky.mapping = THREE.SphericalReflectionMapping;
		
		
		this.skybox = new THREE.Mesh(
				new THREE.SphereGeometry( 100000, 50, 50 ),
				new THREE.MeshBasicMaterial({
			    side: THREE.BackSide,
			    map: sky,
			    //wireframe: true
				})
			);
		
		this._scene.add(this.skybox);
		
		
        //---draw---
        const instanceCount = 10000;
        const tmp = new ModelLoader('./models/plytka_test.obj', './models/plytka_test.mtl', (e) => {
            console.log(tmp);

        const instancedMesh = new THREE.InstancedMesh(tmp._model.geometry, tmp._model.material, instanceCount);
                
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
        
         /* do testow, zobacz jak wydajnosc moze sie psuc
                for(var x=0; x<instanceCount ; x++)
                    for(var z=0; z<instanceCount ; z++){
                        mesh.position.x = 640*x ;
                        mesh.position.z = 640*z ;
                        //Ground.add(mesh.clone());
                        
                    }*/
        
        //new THREE.Mesh(model.geometry, model.material);
        this._scene.add( instancedMesh );
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
            this._RAF();
        });    
    }
}

new BasicWorldDemo;

