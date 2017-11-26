/**
 * Main Engine
 */

var gl;
var scene;
var timer;
var mainRenderTarget;
var shadowMaps = [];
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

cascadeEnd = [4];

function toRadians(deg) {
	return deg * Math.PI / 180;
}

// obsolete
function calcOthoProjs(lightR) {
	// Get Camera Rotation
	var camInv = mat4.create();
	mat4.fromQuat(camInv, scene.camera.gameObject.rotation);
	mat4.invert(camInv, camInv);
	
	// Get Light Rotation
	var lightM = mat4.create();
	mat4.fromQuat(lightM, lightR);
	
	var LightCamMatrix = mat4.create();
	mat4.multiply(LightCamMatrix, lightM, camInv);
	
	// Aspect Ration
	var ar = mainRenderTarget.textureWidth / mainRenderTarget.textureHeight;
	// Horizonal
	var tanHalfHFOV = Math.tan(toRadians(scene.camera.fov / 2.0));
	// Vertical
	var tanHalfVFOV = Math.tan(toRadians((scene.camera.fov * ar) / 2.0));
	
	for(var i = 0; i < 3; i++) {
		var xn = cascadeEnd[i] * tanHalfHFOV;
		var xf = cascadeEnd[i + 1] * tanHalfHFOV;
		var yn = cascadeEnd[i] * tanHalfVFOV;
		var yf = cascadeEnd[i + 1] * tanHalfVFOV;
		
		var frustumCorners = [
			// near
			xn, yn, cascadeEnd[i], 1,
			-xn, yn, cascadeEnd[i], 1,
			xn, -yn, cascadeEnd[i], 1,
			-xn, -yn, cascadeEnd[i], 1,
			
			// far
			xf, yf, cascadeEnd[i + 1], 1,
			-xf, yf, cascadeEnd[i + 1], 1,
			xf, -yf, cascadeEnd[i + 1], 1,
			-xf, -yf, cascadeEnd[i + 1], 1				
		];
		
		var frustumCornersL = [8 * 4];
		
		var minX = 1000000;
		var maxX = -1000000;
		var minY = 1000000;
		var maxY = -1000000;
		var minZ = 1000000;
		var maxZ = -100000;
		
		for(var j = 0; j < 8; j++) {
			var vW = vec4.fromValues(frustumCorners[j*4],
					frustumCorners[j*4 + 1],
					frustumCorners[j*4 + 2],
					frustumCorners[j*4 + 3]);
			
			var fcL = vec4.create();
			vec4.transformMat4(fcL, vW, LightCamMatrix);
			
			frustumCornersL[j * 4] = fcL[0];
			frustumCornersL[j * 4 + 1] = fcL[1];
			frustumCornersL[j * 4 + 2] = fcL[2];
			frustumCornersL[j * 4 + 3] = fcL[3];
			
			minX = Math.min(minX, frustumCornersL[j * 4]);
			maxX = Math.max(maxX, frustumCornersL[j * 4]);
			minY = Math.min(minY, frustumCornersL[j * 4 + 1]);
			maxY = Math.max(maxY, frustumCornersL[j * 4 + 1]);
			minZ = Math.min(minZ, frustumCornersL[j * 4 + 2]);
			maxZ = Math.max(maxZ, frustumCornersL[j * 4 + 2]);
		}
		
		mat4.ortho(shadowMaps[i].pMatrix, minX, maxX, minY, maxY, minZ, maxZ);  
		if (i == 0) {
//			console.log(minX, maxX, minY, maxY, minZ, maxZ);
			console.log(frustumCorners);
		}
	}	
}

// Lerp
function mix(x, y, a) {
	return x * (1.0 - a) + y * (a);
}

class Box {
	constructor() {
		this.bottomLeft;
		this.topRight;
	}
}

function computeBox(viewProjection, lightView)
{
	var t = mat4.create();
	mat4.invert(t, viewProjection);
	mat4.multiply(t, lightView, t);
	var v = [
		vec4.fromValues(-1, 1, -1, 1),
		vec4.fromValues(1, 1, -1, 1),
		vec4.fromValues(1, -1, -1, 1),
		vec4.fromValues(-1, -1, -1, 1),
		vec4.fromValues(-1, 1, 1, 1),
		vec4.fromValues(1, 1, 1, 1),
		vec4.fromValues(1, -1, 1, 1),
		vec4.fromValues(1, -1, 1, 1)
	];
	vec4.transformMat4(v[0], v[0], t);
	vec4.transformMat4(v[1], v[1], t);
	vec4.transformMat4(v[2], v[2], t);
	vec4.transformMat4(v[3], v[3], t);
	vec4.transformMat4(v[4], v[4], t);
	vec4.transformMat4(v[5], v[5], t);
	vec4.transformMat4(v[6], v[6], t);
	vec4.transformMat4(v[7], v[7], t);
	
	for (var i = 0; i < 8; i++) {
		vec4.scale(v[i], v[i], 1.0 / v[i][3]);
	}
	
	var out = new Box();
	out.bottomLeft = vec3.fromValues(1000000, 1000000, 1000000);
	out.topRight = vec3.fromValues(-1000000, -1000000, -1000000);
	
	for (var i = 0; i < 8; i++) {
		out.bottomLeft[0] = Math.min(v[i][0], out.bottomLeft[0]);
		out.topRight[0] = Math.max(v[i][0], out.topRight[0]);
		out.bottomLeft[1] = Math.min(v[i][1], out.bottomLeft[1]);
		out.topRight[1] = Math.max(v[i][1], out.topRight[1]);
		out.bottomLeft[2] = Math.min(v[i][2], out.bottomLeft[2]);
		out.topRight[2] = Math.max(v[i][2], out.topRight[2]);
	}
	
	return out;
}

function computeShadowProjection(view, projection, lightView) {	
	var zNear = scene.camera.near;
	var zFar = 300;
	var fov = toRadians(scene.camera.fov);
	var ratio = mainRenderTarget.textureWidth / mainRenderTarget.textureHeight;
	
	var splitFar = [zFar, zFar, zFar, zFar];
	var splitNear = [zNear, zNear, zNear, zNear];
	var lambda = 0.5;
	var j = 1;
	for (var i = 0; i < 2; i++, j += 1)
	{
		splitFar[i] = mix(
			zNear + (j / 3) * (zFar - zNear),
			zNear + Math.pow(zFar / zNear, j / 3),
			lambda
		);
		splitNear[i + 1] = splitFar[i];
	}
	
	for (var i = 0; i < 3; i++) {
		var cameraViewProjection = mat4.create();
		mat4.perspective(cameraViewProjection, fov, ratio, zNear, splitFar[i])
		mat4.multiply(cameraViewProjection, cameraViewProjection, view);
	
		var box = computeBox(cameraViewProjection, lightView);
		mat4.ortho(shadowMaps[i].pMatrix, box.bottomLeft[0], box.topRight[0],
				box.bottomLeft[1], box.topRight[1],
				-box.topRight[2], -box.bottomLeft[2]);
	}
	
	zNear = splitFar[i];
	
	for (i = 3; i < 4; i++) {
		splitFar[i] = 1000000;
		splitNear[i] = -1000000;
	}
	
	cascadeEnd = splitFar;
}

function drawScene() {
	
	var lightingDirection = vec3.create();
	
	var lightRotation = quat.create();
	quat.fromEuler(lightRotation, 22, 44,180);
	
	vec3.transformQuat(lightingDirection, vec3.fromValues(0, 0, -1), lightRotation);	
	
	var pMatrix = mat4.create();
    scene.camera.perspective(mainRenderTarget.textureWidth / mainRenderTarget.textureHeight, pMatrix);
    
    var viewMatrix = scene.camera.viewMatrix();
	
    var lightViewMatrix = mat4.create();
	mat4.fromRotationTranslation(lightViewMatrix, lightRotation, scene.camera.gameObject.position);
	mat4.invert(lightViewMatrix, lightViewMatrix);
    
    computeShadowProjection(viewMatrix, pMatrix, lightViewMatrix);
//	calcOthoProjs(lightRotation);
	
	// Draw Shadows
	for (var s = 0; s < 3; s++)
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMaps[s].fb);
		gl.viewport(0, 0, shadowMaps[s].textureWidth, shadowMaps[s].textureHeight);
	    gl.clearColor(0, 0, 0, 1.0);
	    gl.clearDepth(1.0)
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	    
	    for (var i = 0; i < scene.gameObjects.length; i++)
	    {
	    	var renderer = scene.gameObjects[i].meshRenderer;
	    	if (typeof renderer == 'undefined') {
	    		continue;
	    	}
	    	
	    	var mvLightMatrix = mat4.create();
	    	mat4.multiply(mvLightMatrix, lightViewMatrix, scene.gameObjects[i].WorldMatrix())
	    	
		    renderer.renderShadow(gl, mvLightMatrix, shadowMaps[s].pMatrix);
	    }
	}
	
	// Draw Objects
	{		
		gl.bindFramebuffer(gl.FRAMEBUFFER, mainRenderTarget.fb);
	    gl.viewport(0, 0, mainRenderTarget.textureWidth, mainRenderTarget.textureHeight);
	    gl.clearColor(0.1, 0.1, 0.1, 1.0);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	    // Draw Skybox
	    gl.depthMask(false);
	    if (scene.skybox.model.meshes.length > 0)
	    {
	    	var program = scene.skybox.material.shaderProgram;
	    	var mesh = scene.skybox.model.meshes[0];
	    	mesh.init(gl);
	    	gl.useProgram(program);
	    	
	    	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexPositionBuffer);
		    gl.vertexAttribPointer(program.vertexPositionAttribute,
		    		mesh.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexTextureCoordBuffer);
		    gl.vertexAttribPointer(program.textureCoordAttribute,
		    		mesh.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

		    gl.activeTexture(gl.TEXTURE0);
		    gl.bindTexture(gl.TEXTURE_2D, scene.skybox.material.mainTexture.texture);
		    gl.uniform1i(program.mainTexture, 0);
		    
		    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.vertexIndexBuffer);	    
		    
		    var worldMatrix = mat4.create();
		    mat4.fromRotationTranslationScale(worldMatrix, quat.create(), scene.camera.gameObject.position, vec3.fromValues(200,200,200));
		    var mvMatrix = mat4.create();
		    mat4.multiply(mvMatrix, viewMatrix, worldMatrix);
		    
		    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
		    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);
		    
		    gl.drawElements(gl.TRIANGLES, mesh.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	    }
	    gl.depthMask(true);
	    
	    
	    for (var i = 0; i < scene.gameObjects.length; i++)
	    {
	    	var renderer = scene.gameObjects[i].meshRenderer;
	    	if (typeof renderer == 'undefined') {
	    		continue;
	    	}
	    	
		    var worldMatrix = scene.gameObjects[i].WorldMatrix();
		    var mvMatrix = mat4.create();
		    mat4.multiply(mvMatrix, viewMatrix, worldMatrix);
		    
		    var mvLightMatrix = mat4.create();
	    	mat4.multiply(mvLightMatrix, lightViewMatrix, scene.gameObjects[i].WorldMatrix())
	    	
	    	var mvpLights = [3];
	    	for (var p = 0; p < 3; p++) {
		    	mvpLights[p] = mat4.create();
				mat4.multiply(mvpLights[p], shadowMaps[p].pMatrix, mvLightMatrix);
	    	}
		    
		    renderer.render(gl, pMatrix, worldMatrix, mvMatrix, scene.camera, lightingDirection,
		    		shadowMaps, mvpLights, cascadeEnd);
	    }
	}
	
	//Draw Post Processing
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

function loadShip() {
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
}

function newAstroid(model, material) {
	
    var obj = new GameObject();
    var renderer = new MeshRenderer();
    renderer.model = model;
    renderer.materials.push(material);
    
    obj.position = vec3.fromValues(Math.random() * 2000 - 1000,
    		Math.random() * 200 - 100, Math.random() * 200 - 100);
    
    var scale = Math.random() * 9 + 1;
    obj.scale = vec3.fromValues(scale,scale,scale);
    
    quat.fromEuler(obj.rotation, Math.random() * 360, Math.random() * 360, Math.random() * 360);
    obj.meshRenderer = renderer;
    
    scene.AddGameObject(obj);
}

function webGLStart() {
    var canvas = document.getElementById("Game-canvas");
    initGL(canvas);
    
    scene = new Scene();
    scene.skybox.init(gl);
    timer = new Timer();
    
    screenQuad = new Mesh();
    screenQuad.screen();
    screenQuad.init(gl);
    
    screenMat = new StandardMaterial();
    screenMat.init(gl, passthroughPostFragment, simplePostVertex);
    
    mainRenderTarget = new RenderTexture(gl, gl.viewportWidth, gl.viewportHeight);
    
    shadowMaps.push(new DepthTexture(gl, 2048, 2048));
    shadowMaps[0].pMatrix = mat4.create();
//    mat4.ortho(shadowMaps[0].pMatrix, -10, 10, -10, 10, -10.0, 20);
    
    shadowMaps.push(new DepthTexture(gl, 2048, 2048));
    shadowMaps[1].pMatrix = mat4.create();
//    mat4.ortho(shadowMaps[1].pMatrix, -200, 200, -200, 200, -200, 500);
   
    shadowMaps.push(new DepthTexture(gl, 2048, 2048));
    shadowMaps[2].pMatrix = mat4.create();
//    mat4.ortho(shadowMaps[2].pMatrix, -80, 80, -80, 80, 80.0, 260);    
    
    cascadeEnd = [4];   
    
    {
        var model = new Model();
        model.load("Assets/Models/Astroid.obj");
        model.init(gl);
    	
        var material = new StandardMaterial();
        material.color = [0.53, 0.46, 0.33];
        material.metallic = 0.3;
        material.smoothness = 1.0;
        material.init(gl, fragmentColorShaderSource, vertexColorShaderSource);
	    
        for (var i = 0; i < 100; i++) {
	    	newAstroid(model, material);
	    }
    }
    
    var model = new Model();
    model.load("Assets/Models/Astroid.obj");
    model.init(gl);
    var obj = new GameObject();
    var renderer = new MeshRenderer();
    renderer.model = model;
    renderer.materials.push(new StandardMaterial());
    renderer.materials[0].color = [0.53, 0.46, 0.33];
    renderer.materials[0].metallic = 0.3;
    renderer.materials[0].smoothness = 1.0;
    renderer.materials[0].init(gl, fragmentColorShaderSource, vertexColorShaderSource);
    
    obj.position = vec3.fromValues(0,0,-7.5);
    obj.scale = vec3.fromValues(5,5,5);
    obj.meshRenderer = renderer;
    scene.AddGameObject(obj);
    
    loadShip();
    
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