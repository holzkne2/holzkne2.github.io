class Timer {
	constructor() {
		this.time = new Date().getTime();
		this.deltaTimer = 0;
	}
	
	update() {
		var now = new Date().getTime();
		this.deltaTime = now - this.time;
		this.time = now;
	}
}