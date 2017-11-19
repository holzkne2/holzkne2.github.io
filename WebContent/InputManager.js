function handleMouseDown(event) {
	inputManager.mouseDown = true;
	inputManager.lastMouseX = event.clientX;
	inputManager.lastMouseY = event.clientY;
}

function handleMouseUp(event) {
	inputManager.mouseDown = false;
}

function handleMouseMove(event) {
	if (!inputManager.mouseDown) {
		return;
	}
	
	var newX = event.clientX;
	var newY = event.clientY;
	
	inputManager.deltaX = newX - inputManager.lastMouseX;
	var around = vec3.create();
//	vec3.copy(around, scene.camera.target.position);
//	around[1] = scene.camera.gameObject.position[1];
//	vec3.rotateY(scene.camera.gameObject.position, scene.camera.gameObject.position,
//			around, deltaX / 100);
	
	inputManager.deltaY = newY - inputManager.lastMouseY;
//	vec3.rotateX(scene.camera.gameObject.position, scene.camera.gameObject.position,
//			scene.camera.target.position, deltaY / 100);
	
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

class InputManager {
	constructor() {
		this.currentlyPressedKeys = {};
		this.mouseDown = false;
		this.lastMouseX = null;
		this.lastMouseY = null;
		this.deltaX = 0;
		this.deltaY = 0;
	}
}
	
var inputManager = new InputManager();