class Options {
	constructor() {
		this.show = false;
		this.dots = true;
		this.lines = true;
		this.mesh = true;
		this.meshScale = 0.9;
	}
	
	update() {
		var div = document.getElementById("Options");
		if (this.show)
			div.style.display = 'block';
		else
			div.style.display = 'none';
		
		this.dots = document.getElementById("dots").checked;
		this.lines = document.getElementById("lines").checked;
		this.mesh = document.getElementById("mesh").checked;
		
		this.meshScale = document.getElementById("meshScale").value;
	}
}

var options = new Options();