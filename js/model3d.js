function Model3D(containerId){
    var that = this
    var camera, renderer, scene, control, sprite, stats, model, container
    var model, materialAssembly, materialDisassembly, materialLineDisassembly

    this.init = function(){
        scene = new THREE.Scene();
        var light = new THREE.AmbientLight( 0x303030 );
        scene.add( light );
        camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 100 );
        camera.position.y = 0;
        camera.position.z = 20;

        //var sphere = new THREE.SphereBufferGeometry( 0.5, 16, 8 );

        light9 = new THREE.PointLight( 0x707070, 2, 50 );
        camera.add(light9)
        scene.add( camera );


        //renderer

        var spriteMaterial = new THREE.SpriteMaterial( {color:0xffffff, opacity:0.0, transparent: true} )
        sprite = new THREE.Sprite(spriteMaterial)
        sprite.scale.set(10,10,1)
        //scene.add(sprite)
        //raycaster_list.push(sprite)


        renderer = new THREE.WebGLRenderer( { antialias: true,alpha: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.shadowMap.enabled = true;
        //renderer.domElement.id = 'containerId'

        //document.body.appendChild( renderer.domElement );
        //document.getElementById(containerId).addEventListener( 'click', that.onDocumentMouseDown );
        //document.getElementById(containerId).addEventListener( 'touchstart', that.onDocumentMouseDown );

        
        container = document.getElementById( containerId );
        container.addEventListener( 'click', that.onDocumentMouseDown );
        container.addEventListener( 'touchstart', that.onDocumentMouseDown );
        container.addEventListener( 'resize', that.onWindowResize );//NOT WORK
        
        //renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );
        container.appendChild( renderer.domElement );
        
        
        stats = new Stats();
		//stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        container.appendChild( stats.dom );
        
        document.body.appendChild( container );
        
        //window.addEventListener( 'resize', that.onWindowResize, false ); //NOT WORK

        renderer.render(scene, camera)
        
        
        control = new THREE.OrbitControls( camera, renderer.domElement);
        control.minDistance       = 2
        control.maxDistance      = 80
        control.target.set( 0, 3.5, 0 );
        control.autoRotate = true
        control.enablePan = true
        control.autoRotateSpeed = .1
        //control.dampingFactor  = .20
        control.enableDamping = true
        control.zoomSpeed     = .5

        materialAssembly    = this.buildMaterial ('cyan')
        materialDisassembly = this.buildMaterial (0x101010)
        materialLineDisassembly = new THREE.LineBasicMaterial({color:0xffffff, opacity:0.5, transparent: true})
		

        return that;
    }

     this.listOfMaterialByColor = {}
    
     this.buildMaterial = function(color){
         var existsMaterialByColor = this.listOfMaterialByColor[color] !=undefined
         //console.info (`existsMaterialByColor[${color}]: ${existsMaterialByColor}`)
         if (!existsMaterialByColor)
             this.listOfMaterialByColor[color] = new THREE.MeshPhysicalMaterial({color:color,metalness:0})
         
         return this.listOfMaterialByColor[color];
     }
     
     this.load = function (file, callback){
        var loader = new THREE.GLTFLoader();
		console.log(`Loading Model ${file} ...`)
        // Load a glTF resource
        loader.load( file,
            // called when the resource is loaded
            function ( obj ) {
                model = obj.scene;
                model.rotation.z = Math.PI;
                model.castShadow = true;
                model.receiveShadow = true;
                //model.position.y = -2.5;
                scene.add( model );
                if (callback != null) callback(obj)
                animate()
            
            }

        );
     }
     
    this.assembly = function (element3dId, color){
        console.log (`matted  ${element3dId} ${model}`)
        var setMaterial = function(ele, color){
          //ele.visible = true //force visible because panel could be hidden
          var isPanel = ele.name.startsWith('panel_')
            color = color || 'cyan'
            ele.material = that.buildMaterial(color)
            ele.material.opacity = isPanel ? .3 : 1
            ele.material.transparent = isPanel
            ele.visible = true
        }
        
        model.children.forEach(function(child) {
            if(child.children.length > 0) {
                child.children.forEach(function (Cchild) {
                    if(Cchild.name.match(element3dId) && !Cchild.name.startsWith('Lamp') && !Cchild.name.startsWith('Camera'))
                        setMaterial(Cchild, color)
                });
            }else{
                if(child.name.match(element3dId) && !child.name.startsWith('Lamp') && !child.name.startsWith('Camera'))
                    setMaterial(child, color)
            }
        })
    };
                
     this.disassemblyAll = function(color){
         that.disassembly(/.*/, color)
     }
     
     this.disassembly = function (element3dId, color){
          var setMaterial = function(ele, color){
           ele.visible = !ele.name.startsWith('panel_')
           if (!ele.visible) return 

           color = color || 0x101010
           // ele.material.dispose();
            ele.material =  that.buildMaterial(color)
    
            var geo = new THREE.EdgesGeometry(ele.geometry)
            //ele.geometry.dispose();
            var mat = materialLineDisassembly//that.buildMaterial('white')
            var wireframe = new THREE.LineSegments( geo, mat )
            
            ele.children = []
            
            ele.add(wireframe)
            //ele.material = new THREE.MeshBasicMaterial({color:0x101010});
           // ele.material = new THREE.MeshPhysicalMaterial({color:0x101010, metalness:0.2})
        }
        
        model.children.forEach(function(child) {
            if(child.children.length > 0) {
                child.children.forEach(function (Cchild) {
                    if(Cchild.name.match(element3dId) && !Cchild.name.startsWith('Lamp') && !Cchild.name.startsWith('Camera'))
                        setMaterial(Cchild,color)
                });
            }else{
                if(child.name.match(element3dId) && !child.name.startsWith('Lamp') && !child.name.startsWith('Camera'))
                    setMaterial(child,color)
            }
        })
    };
    
    function animate() { 
         render();
        requestAnimationFrame( animate );
        stats.begin();
            // monitored code goes here
        stats.end();
        control.update()
        TWEEN.update()
       
    }


    function render() {
        renderer.render( scene, camera );
        //console.info(camera.fov)
       // updateScreenPosition()
        //rotateBAPTA()
    }

     
     function onDocumentMouseDown(event){}
     
    function onWindowResize(event){
        console.info (event)
        camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
        container.setSize( window.innerWidth, window.innerHeight );
     }
    
}