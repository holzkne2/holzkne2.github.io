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