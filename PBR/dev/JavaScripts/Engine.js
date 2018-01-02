var gl;
var camera;

var screen;
var mainRenderTexture;

var showFPS = false;

var sphereSingle

function initGL(canvas) {
	try {
		 gl = canvas.getContext("webgl2");
		gl.viewportWidth = canvas.width = window.innerWidth;
	    gl.viewportHeight = canvas.height = window.innerHeight;
	} catch (e) {
		
	}
	if (!gl) {
		alert("Could not initialise WebGL 2!");
	}
}

function render() {
	
	// Reflection Probe
	if (!GlobalProbe.rendered && skybox.texture.texture.loaded)
	{
		GlobalProbe.render(gl);
		GlobalProbe.rendered = true;
	}
	
	
    var pMatrix = mat4.create();
    camera.perspective(mainRenderTexture.textureWidth / mainRenderTexture.textureHeight, pMatrix);
    
    var vMatrix = camera.viewMatrix();
    
    var mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, pMatrix, vMatrix);
    
    // Render Scene
    {
    	gl.bindFramebuffer(gl.FRAMEBUFFER, mainRenderTexture.fb);
        gl.viewport(0, 0, mainRenderTexture.textureWidth, mainRenderTexture.textureHeight);
        gl.clearColor(1.0, 0.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    	
	    // Render Skybox
	    {
	    	gl.depthMask(false);
	    	
	    	var vMatrixSkybox = mat4.create();
	    	mat4.fromQuat(vMatrixSkybox, camera.gameObject.rotation);
	    	mat4.invert(vMatrixSkybox, vMatrixSkybox);
	        
	        var mvpMatrixSkybox = mat4.create();
	        mat4.multiply(mvpMatrixSkybox, pMatrix, vMatrixSkybox);
	        
	        skybox.render(gl, mvpMatrixSkybox);
	    }
	    
		// Render Objects
	    {
	    	gl.depthMask(true);
	    	
//	    	sphereSingle.meshRenderer.materials[0].albedo = [1.0, 0.0, 0.0];
	        sphereSingle.meshRenderer.materials[0].metallic = options.metallic;
	        sphereSingle.meshRenderer.materials[0].roughness = options.roughness;
	        
	    	sphereSingle.meshRenderer.render(gl,
	    			pMatrix, sphereSingle.WorldMatrix(), vMatrix,
	    			camera, [1, -0.5, 0.25],
	    			GlobalProbe.irradianceMap, GlobalProbe.prefilterMap,
	    			GlobalProbe.brdfLUT.texture);
	    }
    }
    
    // Post Processing
    gl.depthMask(false);
    {    	
    	// Vig and Gamma Correction
    	if (true)
    	{
	    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	    	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	        gl.clearColor(0, 0, 0, 1.0);
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        
	        screen.render(gl, mainRenderTexture.texture);
    	}
    }
    gl.depthMask(true);
}

function resizeCanvas() {
	var canvas = document.getElementById("Game-canvas");
	gl.viewportWidth = canvas.width = window.innerWidth;
    gl.viewportHeight = canvas.height = window.innerHeight;
    
    mainRenderTexture = new RenderTexture(gl, gl.viewportWidth, gl.viewportHeight);

}

function tick() {
	requestAnimFrame(tick);
	timer.update();
	handleKeys();
	
	options.update();
	
	camera.update();
	
	render();
	
	inputManager.clear();
}

function webGLStart() {
	var canvas = document.getElementById("Game-canvas");
    initGL(canvas);
    
    screen = new Screen();
    screen.init(gl);
    mainRenderTexture = new RenderTexture(gl, gl.viewportWidth, gl.viewportHeight);
    
    camera = new Camera();
    camera.gameObject = new GameObject();
    
    sphereSingle = new GameObject();
    sphereSingle.meshRenderer = new MeshRenderer();
    sphereSingle.meshRenderer.model.meshes[0] = new Mesh();
    sphereSingle.meshRenderer.model.meshes[0].sphere(1);
    
    sphereSingle.meshRenderer.materials[0] = new PBRMaterial();
    sphereSingle.meshRenderer.materials[0].albedo = [0.5, 0.5, 0.5];
    sphereSingle.meshRenderer.materials[0].metallic = 0.0;
    sphereSingle.meshRenderer.materials[0].roughness = 0.5;
    
    sphereSingle.meshRenderer.init(gl);
    
    skybox.init(gl);
    
    GlobalProbe.init(gl, 256);
    GlobalProbe.rendered = false;
    
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    
    window.addEventListener('mousewheel', handleMouseWheel, false);
    // Firefox
    window.addEventListener("DOMMouseScroll", handleMouseWheel, false);
    
    window.addEventListener('resize', resizeCanvas, false);
    
    gl.enable(gl.DEPTH_TEST);
    
    tick();
}