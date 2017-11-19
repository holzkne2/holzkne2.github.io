class GameObject {	
	constructor(name) {
		this.position = vec3.fromValues(0, 0, 0);
		this.rotation = quat.fromValues(0, 0, 0, 1);
		this.scale = vec3.fromValues(1, 1, 1);
		
		this.name = name;
	}
	
	WorldMatrix(){
		var world = mat4.create();
		mat4.identity(world);
	    
		mat4.fromRotationTranslationScale(world, this.rotation, this.position, this.scale);
		
	    
	    return world;
	}
}