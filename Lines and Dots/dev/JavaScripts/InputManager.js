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