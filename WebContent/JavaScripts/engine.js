/**
 * Main Engine
 */


var gl;
var scene;
var timer;
var mainRenderTarget;
var screenQuad;
var sandstoneTexture;

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl2");
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
//	mainRenderTarget = new RenderTexture(gl, gl.viewportWidth, gl.viewportHeight);
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, mainRenderTarget.fb);
	    gl.viewport(0, 0, mainRenderTarget.textureWidth, mainRenderTarget.textureHeight);
	    gl.clearColor(0, 0, 0, 1.0);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	    var pMatrix = mat4.create();
	    scene.camera.perspective(mainRenderTarget.textureWidth / mainRenderTarget.textureHeight, pMatrix);
	
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
		    renderer.render(gl, pMatrix, worldMatrix, mvMatrix, scene.camera);
	    }
	}
	
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	    gl.clearColor(0.5, 0.5, 0.5, 1.0);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	    var pMatrix = mat4.create();
	    mat4.ortho(pMatrix, 0, 1, 0, 1, 0, 100);
		
	    var viewMatrix = mat4.create();
	    var worldMatrix = mat4.create();
	    var mvMatrix = mat4.create();
	    mat4.multiply(mvMatrix, viewMatrix, worldMatrix);
	    
	    gl.useProgram(screenMat.shaderProgram);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, screenQuad.vertexPositionBuffer);
	    gl.vertexAttribPointer(screenMat.shaderProgram.vertexPositionAttribute,
	    		screenQuad.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	    gl.bindBuffer(gl.ARRAY_BUFFER, screenQuad.vertexTextureCoordBuffer);
	    gl.vertexAttribPointer(screenMat.shaderProgram.textureCoordAttribute,
	    		screenQuad.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, mainRenderTarget.texture);
	    gl.uniform1i(screenMat.shaderProgram.samplerUniform, 0);
	    
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenQuad.vertexIndexBuffer);	    
	    
	    gl.uniformMatrix4fv(screenMat.shaderProgram.pMatrixUniform, false, pMatrix);
	    gl.uniformMatrix4fv(screenMat.shaderProgram.mvMatrixUniform, false, mvMatrix);
	    
	    gl.drawElements(gl.TRIANGLES, screenQuad.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

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
    
    mainRenderTarget = new RenderTexture(gl, gl.viewportWidth, gl.viewportHeight);
}

function webGLStart() {
    var canvas = document.getElementById("Game-canvas");
    initGL(canvas);
    
    scene = new Scene();
    timer = new Timer();
    
    screenQuad = new Mesh();
    screenQuad.screen();
    screenQuad.init(gl);
    
    screenMat = new StandardMaterial();
    screenMat.init(gl, passthroughPostFragment, simplePostVertex);
    
    mainRenderTarget = new RenderTexture(gl, gl.viewportWidth, gl.viewportHeight);
    
//    var cubeMesh = new Mesh();
//    cubeMesh.cube();
//    var cubeModel = new Model();
//    cubeModel.meshes.push(cubeMesh);
//    cubeModel.init(gl);
    
    var LightColor = new StandardMaterial();
    LightColor.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    LightColor.color = [0.62, 0.63, 0.55];
    LightColor.metallic = 0.7;
    LightColor.smoothness = 10.0;
    
    var DarkColor = new StandardMaterial();
    DarkColor.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    DarkColor.color = [0.24, 0.26, 0.23];
    DarkColor.metallic = 0.7;
    DarkColor.smoothness = 10.0;
    
    var HullLights = new StandardMaterial();
    HullLights.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    HullLights.color = [0.72, 0.73, 0.65];
    HullLights.metallic = 0.7;
    HullLights.smoothness = 10.0;
    
    var EngineExhast = new StandardMaterial();
    EngineExhast.init(gl, fragmentColorUnlitShaderSource, vertexColorUnlitShaderSource);
    EngineExhast.color = [0.58, 0.8, 0.97];
    
    var GoldBall = new StandardMaterial();
    GoldBall.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    GoldBall.color = [1, 0.84, 0];
    GoldBall.metallic = 0.5;
    GoldBall.smoothness = 5.0;
    
    var RingLight = new StandardMaterial();
    RingLight.init(gl, fragmentColorUnlitShaderSource, vertexColorUnlitShaderSource);
    RingLight.color = [01, 1, 1];
    
    var Missing = new StandardMaterial();
    Missing.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    Missing.color = [1, 0, 1];
    
    sandstoneTexture = new Texture();
    sandstoneTexture.init(gl, "Assets/Textures/glass.gif");
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