class Options {
	constructor() {
		this.show = false;
		this.dots = true;
		this.metallic = 0.5;
		this.roughness = 0.5;
		this.skybox = 1;
		this.lastSkybox = 1;
	}
	
	skyboxDirty()
	{
		return this.skybox != this.lastSkybox;
	}
	
	update() {
		this.lastSkybox = this.skybox;
		
		var div = document.getElementById("Options");
		if (this.show)
			div.style.display = 'block';
		else
			div.style.display = 'none';
				
		this.metallic = document.getElementById("metallic").value;
		this.roughness = document.getElementById("roughness").value;
		
		var radios = document.getElementsByName("skybox");
		for (var i = 0; i < radios.length; i++) {
			if (radios[i].checked) {
				this.skybox = radios[i].value;
				break;
			}
		}
	}
}

var options = new Options();