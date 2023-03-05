import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.125.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.125.0/examples/jsm/controls/OrbitControls.js';

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
        const far = 1000.0;
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
       	const DROGA_GEO = new THREE.BoxGeometry( 100, 0.5, 100 );
        const DROGA_MAT = new THREE.MeshToonMaterial( {
			color: 0x040404,
			gradientMap: THREE.threeTone,
            //wireframe: true
			} );
        const DROGA = new THREE.Mesh( DROGA_GEO, DROGA_MAT );
		this._scene.add( DROGA );
		
		const CHODNIK_GEO = new THREE.BoxGeometry( 80, 1, 80 );
        const CHODNIK_MAT = new THREE.MeshToonMaterial( {
            color: 0x525252,
            gradientMap: THREE.threeTone,
            //wireframe: true
            } );
        const CHODNIK = new THREE.Mesh( CHODNIK_GEO, CHODNIK_MAT );
		this._scene.add( CHODNIK );
		
		const TRAWA_GEO = new THREE.BoxGeometry( 70, 1.5, 70 );
        const TRAWA_MAT = new THREE.MeshToonMaterial( {
            color: 0x008F00,
            gradientMap: THREE.threeTone,
            //wireframe: true
            } );
        const TRAWA = new THREE.Mesh( TRAWA_GEO, TRAWA_MAT );
		this._scene.add( TRAWA );
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
