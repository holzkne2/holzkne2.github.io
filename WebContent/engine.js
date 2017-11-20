/**
 * Main Engine
 */


var gl;
var scene;
var timer;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width = window.innerWidth;
    gl.viewportHeight = canvas.height = window.innerHeight;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL!");
    }
}

function setMatrixUniforms(pMatrix, mMatrix, mvMatrix, shaderProgram) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    
    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, mMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

function drawScene() {	
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var pMatrix = mat4.create();
    scene.camera.perspective(gl.viewportWidth / gl.viewportHeight, pMatrix);

    var viewMatrix = scene.camera.viewMatrix();
    
    for (var i = 0; i < scene.gameObjects.length; i++)
    {
    	var renderer = scene.gameObjects[i].meshRenderer;
    	if (typeof renderer == 'undefined') {
    		continue;
    	}
    	
	    var worldMatrix = scene.gameObjects[i].WorldMatrix();
	    var mvMatrix = mat4.create();
	    mat4.multiply(mvMatrix, viewMatrix, worldMatrix);
	    for (var m = 0; m < renderer.materials.length; m++) {
	    setMatrixUniforms(pMatrix, worldMatrix, mvMatrix, renderer.materials[m].shaderProgram);
	    }	    
	    renderer.render(gl);
    }
}

function tick() {
	//Could replace with setInterval if making network game due to this not running if tab is not visable
	requestAnimFrame(tick);
	timer.update();
	handleKeys();
	
	scene.camera.update();
	drawScene();
	
	inputManager.clear();
}

function resizeCanvas() {
	var canvas = document.getElementById("Game-canvas");
	gl.viewportWidth = canvas.width = window.innerWidth;
    gl.viewportHeight = canvas.height = window.innerHeight;
}

function webGLStart() {
    var canvas = document.getElementById("Game-canvas");
    initGL(canvas);
    
    scene = new Scene();
    timer = new Timer();
    
    var cubeMesh = new Mesh();
    cubeMesh.cube();
    var cubeModel = new Model();
    cubeModel.meshes.push(cubeMesh);
    cubeModel.init(gl);
    
    var standardMat = new StandardMaterial();
    standardMat.init(gl);
    
    var sandstoneTexture = new Texture();
    sandstoneTexture.init(gl, "Texture.png");
    standardMat.albedoTexture = sandstoneTexture;
    
//    for (var i = -1; i < 2; i++) {
//    	var obj = new GameObject();
//    	obj.position = vec3.fromValues(i * 3, 0, -7);
//    	quat.fromEuler(obj.rotation, Math.random() * 180,
//    				Math.random() * 180, Math.random() * 180);
//    	//scene.AddGameObject(obj);
//    	
//    	var renderer = new MeshRenderer();
//    	renderer.model = cubeModel;
//    	renderer.material = standardMat;
//    	obj.meshRenderer = renderer;
//    }

    scene.camera.gameObject.position =  vec3.fromValues(0, 0, 3)
    //quat.fromEuler(scene.camera.gameObject.rotation, 7.662,-19.654,0);
    
    var obj = new GameObject();
    var renderer = new MeshRenderer();
    var shipMesh = new Model();
    shipMesh.load('SpaceShip01.obj');
    shipMesh.init(gl);
	renderer.model = shipMesh;
	renderer.materials.push(standardMat);
	obj.meshRenderer = renderer;
	scene.AddGameObject(obj);
    
	scene.camera.target = obj;
    
	gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    
    window.addEventListener('mousewheel', handleMouseWheel, false);
 // Firefox
    window.addEventListener("DOMMouseScroll", handleMouseWheel, false);
    
    window.addEventListener('resize', resizeCanvas, false);
    
    tick();
}