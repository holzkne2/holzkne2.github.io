var gl;
var camera;
var lines;

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
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var pMatrix = mat4.create();
    camera.perspective(gl.viewportWidth / gl.viewportHeight, pMatrix);
    
    var vMatrix = camera.viewMatrix();
    
    var mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, pMatrix, vMatrix);
    
	// Render Lines
    {
    	lines.render(gl, mvpMatrix);
    }
}

function resizeCanvas() {
	var canvas = document.getElementById("Game-canvas");
	gl.viewportWidth = canvas.width = window.innerWidth;
    gl.viewportHeight = canvas.height = window.innerHeight;
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
    
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    tick();
}