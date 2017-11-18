class GameObject {	
	constructor(name) {
		this.position = vec3.create([0, 0, 0]);
		this.rotation = quat4.create([0, 0, 0, 1]);
		this.scale = vec3.create([1, 1, 1]);
		
		this.name = name;
		
		this.components = [];
	}
	
	AddComponent(component) {
		component.gameObject = this;
		components.push(component);
	}
}

class Component {
	constructor() {
		this.gameObject = null
	}
}