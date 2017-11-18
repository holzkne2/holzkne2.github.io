class GameObject {	
	constructor(name) {
		this.position = [0, 0, 0];
		this.rotation = [0, 0, 0, 1];
		this.scale = [1, 1, 1];
		
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