class GameObject {	
	constructor(name) {
		this.position = vec3.fromValues(0, 0, 0);
		this.rotation = quat.fromValues(0, 0, 0, 1);
		this.scale = vec3.fromValues(1, 1, 1);
		
		this.name = name;
		
		this.positionLast;
		this.rotationLast;
		this.scaleLast;
		
		this.worldMatrix;
	}
	
	WorldMatrix(){
		if (this.positionLast !== this.postion || this.rotationLast !== this.rotation || this.scaleLast !== this.scale) {
			this.worldMatrix = mat4.create();
			mat4.fromRotationTranslationScale(this.worldMatrix, this.rotation, this.position, this.scale);
		    this.positionLast = this.postion; this.rotationLast = this.rotation; this.scaleLast = this.scale;
		}
		return this.worldMatrix;
	}
}