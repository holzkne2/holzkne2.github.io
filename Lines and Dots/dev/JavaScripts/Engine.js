var gl;
var camera;
var lines;

var screen;
var mainRenderTexture;

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
    
	// Render Dots & Lines
    {
    	gl.depthMask(true);
    	gl.bindFramebuffer(gl.FRAMEBUFFER, mainRenderTexture.fb);
        gl.viewport(0, 0, gl.viewportWidth, mainRenderTexture.textureHeight);
        gl.clearColor(0.95, 0.95, 0.95, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
    	lines.renderLines(gl, mvpMatrix);
    	lines.renderDots(gl, mvpMatrix);
    }
    
    // Post Processing
    {
    	gl.depthMask(false);
    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        screen.render(gl, mainRenderTexture.texture);
    }
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
    
    camera = new Camera();
    camera.gameObject = new GameObject();
    
    lines = new Lines();
    lines.init(gl);
    
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