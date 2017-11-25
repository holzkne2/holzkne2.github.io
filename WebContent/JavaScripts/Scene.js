class Scene {
	constructor () {
		this.gameObjects = [];
		
		var cameraObj = new GameObject();
		cameraObj.camera = new Camera();
		cameraObj.camera.gameObject = cameraObj;
		this.camera = cameraObj.camera;
		this.skybox = new Skybox();
	}
	
	AddGameObject(obj) {
		this.gameObjects.push(obj);
	}
}