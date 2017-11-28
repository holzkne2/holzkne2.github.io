function handleMouseDown(event) {
	inputManager.mouseDown = true;
	inputManager.lastMouseX = event.clientX;
	inputManager.lastMouseY = event.clientY;
}

function handleMouseUp(event) {
	inputManager.mouseDown = false;
}

function handleMouseMove(event) {
	
	var newX = event.clientX;
	var newY = event.clientY;
	
	inputManager.deltaX = newX - inputManager.lastMouseX;
	var around = vec3.create();	
	inputManager.deltaY = newY - inputManager.lastMouseY;
	
	inputManager.lastMouseX = newX;
	inputManager.lastMouseY = newY;
}

function handleKeyDown(event) {
	inputManager.currentlyPressedKeys[event.keyCode] = true;
	
	// F key (show FPS)
	if (inputManager.currentlyPressedKeys[70] === true) {
		showFPS = !showFPS;
	}
	
	
	// 1 Key
	if (inputManager.currentlyPressedKeys[49] === true) {
		lines.color = [0,0,0];
		skybox.topColor = [0.95, 0.95, 0.95];
		skybox.bottomColor = [0.95, 0.95, 0.95];
	}
	
	// 2 Key
	if (inputManager.currentlyPressedKeys[50] === true) {
		lines.color = [1,1,1];
		skybox.topColor = [0.96, 0.38, 0.09];
		skybox.bottomColor = [0.04, 0.28, 0.42];
	}
	
	// 3 Key
	if (inputManager.currentlyPressedKeys[51] === true) {
		lines.color = [1,1,1];
		skybox.topColor = [0.13, 0.59, 0.95];
		skybox.bottomColor = [0.96, 0.26, 0.21];
	}
	
	// 4 Key
	if (inputManager.currentlyPressedKeys[52] === true) {
		lines.color = [1,1,1];
		skybox.topColor = [0.40, 1.0, 0.0];
		skybox.bottomColor = [0.66, 0.0, 0.47];
	}
	
	// 5 Key
	if (inputManager.currentlyPressedKeys[53] === true) {
		lines.color = [1,1,1];
		skybox.topColor = [0.23, 0.68, 0.77];
		skybox.bottomColor = [0.83, 0.62, 0.22];
	}
}

function handleKeyUp(event) {
	inputManager.currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
	
}

function handleMouseWheel(event) {
	inputManager.deltaWheel = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
}

class InputManager {
	constructor() {
		this.currentlyPressedKeys = {};
		this.mouseDown = false;
		this.lastMouseX = null;
		this.lastMouseY = null;
		this.deltaX = 0;
		this.deltaY = 0;
		this.deltaWheel = 0;
	}
	
	clear() {
		this.deltaX = 0;
		this.deltaY = 0;
		this.deltaWheel = 0;
	}
}
	
var inputManager = new InputManager();