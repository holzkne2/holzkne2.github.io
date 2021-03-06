function clamp(num, min, max) {
	  return Math.min(Math.max(num, min), max);
};

function toRadians(deg) {
	return deg * Math.PI / 180;
}
	
class Camera {
	constructor () {
		this.fov = 45;
		this.near = 0.1;
		this.far = 100;
		
		this.target = vec3.fromValues(0,0,0);
		
		this.distance = 20;
		
		this.xSpeed = 1;
		this.ySpeed = 10;
		
		this.yMinLimit = -20;
		this.yMaxLimit = 80;
		
		this.distanceMin = 6;
		this.distanceMax = 25;
		
		this.x = 0;
		this.y = 0
	}
	
	perspective(aspect, matrix) {
		mat4.perspective(matrix, toRadians(this.fov), aspect, this.near, this.far);
	}
	
	skyboxPerspective(aspect, matrix) {
		mat4.perspective(matrix, toRadians(this.fov), aspect, 700, 2000);
	}
	
	viewMatrix() {
		var view = this.gameObject.WorldMatrix();
		return mat4.invert(view, view);
	}
	
	update() {
		
		this.distance = clamp(this.distance - inputManager.deltaWheel * 0.5, this.distanceMin, this.distanceMax);

		if (inputManager.mouseDown)
		{
			this.x -= inputManager.deltaX * this.xSpeed * this.distance * 0.01;
			this.y -= inputManager.deltaY * this.ySpeed * 0.02;
		}
		
		
		var rotation = quat.create();
		quat.fromEuler(rotation, this.y, this.x, 0);
		
		var position = vec3.create();
		vec3.transformQuat(position, vec3.fromValues(0, 0, this.distance), rotation);
		vec3.add(position, position, this.target);
		
		
		this.gameObject.rotation = rotation;
		this.gameObject.position = position;
	}
}