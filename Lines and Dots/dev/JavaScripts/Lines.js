function lerp(x, y, t) {
	var a = vec3.create();
	vec3.scale(a, x, (1.0 - t));
	
	var b = vec3.create();
	vec3.scale(b, y, t);
	
	var c = vec3.create();
	vec3.add(c, a, b)
	return c;
}

function remap(value, low1, high1, low2, high2) {
	return (value - low1) * (high2 - low2) / (high1 - low1) + low2;
}

class Lines {
	constructor() {
		this.points = [];
		this.start = [];
		this.end = [];
		this.speed = [];
		this.progress = [];
		this.material = new UnlitColorMaterial();
	}
	
	render(gl, mvpMatrix) {
		gl.useProgram(this.material.shaderProgram);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.vertexAttribPointer(this.material.shaderProgram.vertexPositionAttribute,
				this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.uniformMatrix4fv(this.material.shaderProgram.mvpMatrixUniform, false, mvpMatrix);
		
		gl.uniform3f(this.material.shaderProgram.color, 0,0,0);
		
		gl.drawArrays(gl.LINE_LOOP, 0, this.vertexPositionBuffer.numItems);
	}
	
	init(gl) {
		this.material.init(gl);
		
		this.points = [];
		for (var i = 0; i < 50; i++) {
	    	var vector = vec3.create();
	    	vec3.random(vector, 1);
	    	
	    	var minRadius = Math.random() * 5;
	    	var maxRadius = Math.random() * 5 + 5;
	    	
	    	var posS = vec3.create();
	    	vec3.scale(posS, vector, minRadius);
	    	this.start.push(posS);
	    	
	    	var posE = vec3.create();
	    	vec3.scale(posE, vector, maxRadius);
	    	this.end.push(posE);
	    	
	    	this.speed.push(remap(Math.random(), 0, 1, 0.2, 0.3));
	    	if (Math.random() < 0.5) {
	    		this.speed[i] = 0 - this.speed[i];
	    	}
	    	
	    	this.progress.push(Math.random());
	    	
	    	this.points.push(posS[0]);
	    	this.points.push(posS[1]);
	    	this.points.push(posS[2]);
		}
//		this.points.push(-0.5);
//		this.points.push(-0.5);
//		this.points.push(0.5);
//		this.points.push(0.5);
//		this.points.push(0.5);
//		this.points.push(0.5);
//		this.points.push(0.5);
//		this.points.push(-0.5);
//		this.points.push(0.5);
		
		this.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points), gl.DYNAMIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = this.points.length / 3;
	}
	
	update(gl) {
		var deltaTime = (timer.deltaTime / 1000);
		
		if (deltaTime > 0.5) {
			return;
		}
		
		for (var i = 0; i < 50; i++) {
			var pos = lerp(this.start[i], this.end[i], this.progress[i]);
	    	
	    	this.progress[i] += this.speed[i] * deltaTime;

	    	if ((this.progress[i] >= 1 && this.speed[i] > 0 ) || (this.progress[i] <= 0 && this.speed[i] < 0)) {
	    		this.speed[i] = 0 - this.speed[i];
	    	}
	    	
	    	this.points[i * 3] = pos[0];
	    	this.points[i * 3 + 1] = pos[1];
	    	this.points[i * 3 + 2] = pos[2];
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points), gl.DYNAMIC_DRAW);
		
	}
}