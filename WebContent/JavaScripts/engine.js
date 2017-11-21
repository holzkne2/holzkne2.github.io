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
	    renderer.render(gl, pMatrix, worldMatrix, mvMatrix);
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
    
    var LightColor = new StandardMaterial();
    LightColor.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    LightColor.color = [0.62, 0.63, 0.55];
    
    var DarkColor = new StandardMaterial();
    DarkColor.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    DarkColor.color = [0.24, 0.26, 0.23];
    
    var HullLights = new StandardMaterial();
    HullLights.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    HullLights.color = [0.72, 0.73, 0.65];
    
    var EngineExhast = new StandardMaterial();
    EngineExhast.init(gl, fragmentColorUnlitShaderSource, vertexColorUnlitShaderSource);
    EngineExhast.color = [0.58, 0.8, 0.97];
    
    var GoldBall = new StandardMaterial();
    GoldBall.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    GoldBall.color = [1, 0.84, 0];
    
    var RingLight = new StandardMaterial();
    RingLight.init(gl, fragmentColorUnlitShaderSource, vertexColorUnlitShaderSource);
    RingLight.color = [01, 1, 1];
    
    var Missing = new StandardMaterial();
    Missing.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    Missing.color = [1, 0, 1];
    
//    var sandstoneTexture = new Texture();
//    sandstoneTexture.init(gl, "Texture.png");
//    standardMat.texture0 = sandstoneTexture;
    
    var obj = new GameObject();
    var renderer = new MeshRenderer();
    var shipMesh = new Model();
    
    shipMesh.load('Assets/Models/SpaceShip01.obj');
    shipMesh.init(gl);
	renderer.model = shipMesh;
	
	renderer.materials.push(DarkColor); // dark
	renderer.materials.push(LightColor); // hull
	renderer.materials.push(HullLights); // hull_lights
	renderer.materials.push(EngineExhast); // engine
	renderer.materials.push(GoldBall); // ball
	renderer.materials.push(RingLight); // ring_light
	renderer.materials.push(Missing);
	
	obj.meshRenderer = renderer;
	scene.AddGameObject(obj);
    
	scene.camera.gameObject.position =  vec3.fromValues(0, 0, 3)
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