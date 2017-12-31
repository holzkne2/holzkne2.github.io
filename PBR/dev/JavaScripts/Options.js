class Options {
	constructor() {
		this.show = false;
		this.dots = true;
		this.metallic = 0.5;
		this.roughness = 0.5;
	}
	
	update() {
		var div = document.getElementById("Options");
		if (this.show)
			div.style.display = 'block';
		else
			div.style.display = 'none';
				
		this.metallic = document.getElementById("metallic").value;
		this.roughness = document.getElementById("roughness").value;
	}
}

var options = new Options();