class Scene {
	constructor () {
		this.gameObjects = [];
		
		var cameraObj = new GameObject();
		cameraObj.camera = new Camera();
		cameraObj.camera.gameObject = cameraObj;
		this.camera = cameraObj.camera;
	}
	
	AddGameObject(obj) {
		this.gameObjects.push(obj);
	}
}

class Camera {
	constructor () {
		this.fov = 90;
		this.near = 0.1;
		this.far = 1000;
	}
	
	perspective(aspect, matrix) {
		mat4.perspective(this.fov, aspect, this.near, this.far, matrix);
	}
	
	viewMatrix() {
		var view = this.gameObject.WorldMatrix();
		return mat4.inverse(view);
	}
}