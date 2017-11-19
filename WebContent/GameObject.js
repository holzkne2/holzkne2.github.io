class GameObject {	
	constructor(name) {
		this.position = vec3.create([0, 0, 0]);
		this.rotation = quat4.create([0, 0, 0, 1]);
		this.scale = vec3.create([1, 1, 1]);
		
		this.name = name;
	}
	
	WorldMatrix(){
		var world = mat4.create();
		mat4.identity(world);
	    
	    mat4.translate(world, this.position);
	    
	    var rotationMatrix = mat4.create();
	    mat4.identity(rotationMatrix)
	    quat4.toMat4(this.rotation, rotationMatrix);
	    mat4.multiply(world, rotationMatrix);
	    
	    mat4.scale(world, this.scale);
	    
	    return world;
	}
}