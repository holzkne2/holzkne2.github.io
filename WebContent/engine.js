/**
 * Main Engine
 */

var gl;
var scene;

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

function setMatrixUniforms(pMatrix, mvMatrix, shaderProgram) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    
    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, mvMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

var currentlyPressedKeys = {};

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
	
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
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
	
	    
	    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.mesh.vertexPositionBuffer);
	    gl.vertexAttribPointer(renderer.material.shaderProgram.vertexPositionAttribute, renderer.mesh.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.mesh.vertexNormalBuffer);
	    gl.vertexAttribPointer(renderer.material.shaderProgram.vertexNormalAttribute, renderer.mesh.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    
	    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.mesh.vertexTextureCoordBuffer);
	    gl.vertexAttribPointer(renderer.material.shaderProgram.textureCoordAttribute, renderer.mesh.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, renderer.material.albedoTexture.texture);
	    gl.uniform1i(renderer.material.shaderProgram.samplerUniform, 0);
	    
		gl.uniform3f(
				renderer.material.shaderProgram.ambientColorUniform,
				0.2,
	            0.2,
	            0.2
				);
		
		var lightingDirection = [
	        -0.25,
	        -0.25,
	        -1
	    ];
		
		var adjustedLD = vec3.create();
	    vec3.normalize(adjustedLD, lightingDirection);
	    vec3.scale(adjustedLD, adjustedLD, -1);
	    gl.uniform3fv(renderer.material.shaderProgram.lightingDirectionUniform, adjustedLD);
	    
	    gl.uniform3f(
	    		renderer.material.shaderProgram.directionalColorUniform,
	        0.8,
	        0.8,
	        0.8
	    );
	    
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderer.mesh.vertexIndexBuffer);
	    var mvMatrix = mat4.create();
	    mat4.multiply(mvMatrix, viewMatrix, worldMatrix);
	    setMatrixUniforms(pMatrix, mvMatrix, renderer.material.shaderProgram);
	    gl.drawElements(gl.TRIANGLES, renderer.mesh.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
}


var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        
    }
    lastTime = timeNow;
}

function tick() {
	//Could replace with setInterval if making network game due to this not running if tab is not visable
	requestAnimFrame(tick);
	handleKeys();
	animate();
	drawScene();
}

function resizeCanvas() {
	var canvas = document.getElementById("Game-canvas");
	gl.viewportWidth = canvas.width = window.innerWidth;
    gl.viewportHeight = canvas.height = window.innerHeight;
}

function webGLStart() {
    var canvas = document.getElementById("Game-canvas");
    initGL(canvas);
    
    scene = new Scene()
    
    var cubeMesh = new Mesh();
    cubeMesh.cube();
    cubeMesh.init(gl);
    
    var standardMat = new StandardMaterial();
    standardMat.init(gl);
    
    var sandstoneTexture = new Texture();
    sandstoneTexture.init(gl, "Texture.png");
    standardMat.albedoTexture = sandstoneTexture;
    
    for (var i = -1; i < 2; i++) {
    	var obj = new GameObject();
    	obj.position = vec3.fromValues(i * 3, 0, -7);
    	quat.fromEuler(obj.rotation, Math.random() * 180,
    				Math.random() * 180, Math.random() * 180);
    	scene.AddGameObject(obj);
    	
    	var renderer = new MeshRenderer();
    	renderer.mesh = cubeMesh;
    	renderer.material = standardMat;
    	obj.meshRenderer = renderer;
    }

    scene.camera.gameObject.position =  vec3.fromValues(0, 0, -2.5)
    
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    window.addEventListener('resize', resizeCanvas, false);
    
    document.getElementById("loadingtext").textContent = "";
    tick();
}