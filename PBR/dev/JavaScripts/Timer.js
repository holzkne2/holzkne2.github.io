class Timer {
	constructor() {
		this.time = new Date().getTime();
		this.deltaTimer = 0;
		
		this.fpsBuffer = [];
		this.fpsMax = 60;
	}
	
	update() {
		var now = new Date().getTime();
		this.deltaTime = now - this.time;
		this.time = now;
		
		var fps = 1.0 / (this.deltaTime / 1000.0);
		this.fpsBuffer.push(fps);
		if (this.fpsBuffer.length > this.fpsMax) {
			this.fpsBuffer.shift();
		}
		
		var sum = 0;
		for (var i = 0; i < this.fpsBuffer.length; i++) {
			sum += this.fpsBuffer[i];
		}
		sum /= this.fpsBuffer.length;
		
		if (showFPS) {
			document.getElementById("FPS_Counter").textContent = "FPS: " + Math.round(sum);
		} else {
			document.getElementById("FPS_Counter").textContent = "";
		}
	}
}

var timer = new Timer();