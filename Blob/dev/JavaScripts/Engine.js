var gl;
var camera;
var lines;

var screen;
var mainRenderTexture;
//var normalDepthRenderTexture;
//var ssao;

var skybox;

var showFPS = false;

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
	
    var pMatrix = mat4.create();
    camera.perspective(mainRenderTexture.textureWidth / mainRenderTexture.textureHeight, pMatrix);
    
    var vMatrix = camera.viewMatrix();
    
    var mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, pMatrix, vMatrix);
    
    // Render Scene
    {
    	gl.bindFramebuffer(gl.FRAMEBUFFER, mainRenderTexture.fb);
        gl.viewport(0, 0, mainRenderTexture.textureWidth, mainRenderTexture.textureHeight);
        gl.clearColor(0.95, 0.95, 0.95, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    	
	    // Render Skybox
	    {
	    	gl.depthMask(false);
	    	gl.clear(gl.DEPTH_BUFFER_BIT);
	    	
	    	var pMatrixSkybox = mat4.create();
	    	camera.skyboxPerspective(mainRenderTexture.textureWidth / mainRenderTexture.textureHeight, pMatrixSkybox);
	    	
	    	var vMatrixSkybox = mat4.create();
	    	mat4.fromQuat(vMatrixSkybox, camera.gameObject.rotation);
	    	mat4.invert(vMatrixSkybox, vMatrixSkybox);
	        
	        var mvpMatrixSkybox = mat4.create();
	        mat4.multiply(mvpMatrixSkybox, pMatrixSkybox, vMatrixSkybox);
	        
	        skybox.render(gl, mvpMatrixSkybox, camera);
	    }
	    
		// Render Dots & Lines
	    {
	    	gl.depthMask(true);
	    	gl.clear(gl.DEPTH_BUFFER_BIT);
	        
	    	if (options.lines)
	    		lines.renderLines(gl, mvpMatrix);
	    	if (options.dots)
	    		lines.renderDots(gl, mvpMatrix);
	    	if (options.mesh)
	    		lines.innerMesh.render(gl, mvpMatrix, mat4.create());
	    }
    }
    
    // Post Processing
    {
    	// Normal & Depth Data
<<<<<<< HEAD
    	if (false)
    	{
    		gl.depthMask(true);
	    	gl.bindFramebuffer(gl.FRAMEBUFFER, normalDepthRenderTexture.fb);
	    	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	        gl.clearColor(0, 0, 0, 1.0);
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        
    		lines.innerMesh.render_normalDepth(gl, mvpMatrix, mat4.create(), vMatrix);
    	}
    	
    	// SSAO
    	if(false)
    	{
    		gl.depthMask(false);
	    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	    	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	        gl.clearColor(0, 0, 0, 1.0);
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        
	        ssao.render(gl, normalDepthRenderTexture.texture,
	        		mainRenderTexture.textureWidth / mainRenderTexture.textureHeight,
	        		Math.tan(camera.fov/2), pMatrix);
    	}
    	
    	// Vig and Gamma Correction
    	if (true)
=======
//    	{
//    		gl.depthMask(true);
//	    	gl.bindFramebuffer(gl.FRAMEBUFFER, normalDepthRenderTexture.fb);
//	    	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
//	        gl.clearColor(0, 0, 0, 1.0);
//	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//	        
//    		lines.innerMesh.render_normalDepth(gl, mvpMatrix, mat4.create(), vMatrix);
//    	}
    	
    	// SSAO
//    	{
//    		gl.depthMask(false);
//	    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
//	    	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
//	        gl.clearColor(0, 0, 0, 1.0);
//	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//	        
//	        ssao.render(gl, normalDepthRenderTexture.texture,
//	        		mainRenderTexture.textureWidth / mainRenderTexture.textureHeight,
//	        		Math.tan(camera.fov/2), pMatrix);
//    	}
    	
    	// Vig and Gamma Correction
>>>>>>> 1c5a52a150054e6c211c3e7c7fafb96cbccfdf33
    	{
	    	gl.depthMask(false);
	    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	    	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	        gl.clearColor(0, 0, 0, 1.0);
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        
	        screen.render(gl, mainRenderTexture.texture);
    	}
    }
}

function resizeCanvas() {
	var canvas = document.getElementById("Game-canvas");
	gl.viewportWidth = canvas.width = window.innerWidth;
    gl.viewportHeight = canvas.height = window.innerHeight;
    
    mainRenderTexture = new RenderTexture(gl, gl.viewportWidth, gl.viewportHeight);
//    normalDepthRenderTexture = new RenderTexture(gl, gl.viewportWidth, gl.viewportHeight);

}

function tick() {
	requestAnimFrame(tick);
	timer.update();
	handleKeys();
	
	options.update();
	
	lines.update(gl);
	
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
//    normalDepthRenderTexture = new RenderTexture(gl, gl.viewportWidth, gl.viewportHeight);
    
//    ssao = new SSAO();
//    ssao.init(gl);
    
    camera = new Camera();
    camera.gameObject = new GameObject();
    
    lines = new Lines();
    lines.init(gl);
    
    skybox = new Skybox();
    skybox.init(gl);
    
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