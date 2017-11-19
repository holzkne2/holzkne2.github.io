/**
 * 
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
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
}


var mainTexture;

function initTexture() {
	mainTexture = gl.createTexture();
	mainTexture.image = new Image();
	
	mainTexture.image.onload = function () {
        handleLoadedTexture(mainTexture)
    }

	mainTexture.image.src = "Texture.png";
}

function setMatrixUniforms(pMatrix, mvMatrix, shaderProgram) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    
    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

var currentlyPressedKeys = {};

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
	
	if (String.fromCharCode(event.keyCode) == "F") {
		filter += 1;
		if (filter == 3)
			filter = 0;
	}
	
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
    mat4.perspective(70, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    for (var i = 0; i < scene.gameObjects.length; i++)
    {
	    var worldMatrix = scene.gameObjects[i].WorldMatrix();
	
	    var renderer = scene.gameObjects[i].meshRenderer;
	    
	    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.mesh.vertexPositionBuffer);
	    gl.vertexAttribPointer(renderer.material.shaderProgram.vertexPositionAttribute, renderer.mesh.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.mesh.vertexNormalBuffer);
	    gl.vertexAttribPointer(renderer.material.shaderProgram.vertexNormalAttribute, renderer.mesh.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    
	    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.mesh.vertexTextureCoordBuffer);
	    gl.vertexAttribPointer(renderer.material.shaderProgram.textureCoordAttribute, renderer.mesh.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, mainTexture);
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
	    vec3.normalize(lightingDirection, adjustedLD);
	    vec3.scale(adjustedLD, -1);
	    gl.uniform3fv(renderer.material.shaderProgram.lightingDirectionUniform, adjustedLD);
	    
	    gl.uniform3f(
	    		renderer.material.shaderProgram.directionalColorUniform,
	        0.8,
	        0.8,
	        0.8
	    );
	    
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderer.mesh.vertexIndexBuffer);
	    setMatrixUniforms(pMatrix, worldMatrix, renderer.material.shaderProgram);
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
    
    for (var i = -1; i < 2; i++) {
    	var obj = new GameObject();
    	obj.position = vec3.create([i * 3, 0, -7]);
    	quat4.normalize(quat4.create([Math.random(),
    				Math.random(), Math.random(), Math.random()]),
    				obj.rotation);
    	scene.AddGameObject(obj);
    	
    	var renderer = new MeshRenderer();
    	renderer.mesh = cubeMesh;
    	renderer.material = standardMat;
    	obj.meshRenderer = renderer;
    }
    
    //initBuffers();
    initTexture();

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    window.addEventListener('resize', resizeCanvas, false);
    
    tick();
}