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

class MoveData {
	constructor(origin, radius, speed) {
		this.origin = origin;
		this.radius = radius;
		this.a = origin;
		this.b = origin;
		this.speed = speed;
		this.progress = 1;
	}
	
	newB() {
		this.progress = 0;
		
		var vector = vec3.create();
		vec3.random(vector, 1);
		
		var posE = vec3.create();
    	vec3.scale(posE, vector, this.radius);
    	
    	var copy = vec3.fromValues(this.b[0], this.b[1], this.b[2]);
    	this.a = copy;
    	vec3.add(this.b, posE, this.origin);
	}
}

class Lines {
	constructor() {
		this.count;
		
		this.color = [0, 0, 0]
		
		this.points = [];
		this.moveData = [];
		this.material = new UnlitColorMaterial();
		this.dots = new Dots();
	}
	
	renderLines(gl, mvpMatrix) {
		gl.useProgram(this.material.shaderProgram);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.vertexAttribPointer(this.material.shaderProgram.vertexPositionAttribute,
				this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.uniformMatrix4fv(this.material.shaderProgram.mvpMatrixUniform, false, mvpMatrix);
		
		gl.uniform3f(this.material.shaderProgram.color, 
				this.color[0],
				this.color[1],
				this.color[2]);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		gl.drawElements(gl.LINE_STRIP, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
	renderDots(gl, vpMatrix) {
		gl.useProgram(this.material.shaderProgram);
		
		for (var i = 0; i < this.count; i++) {
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.dots.vertexPositionBuffer);
			gl.vertexAttribPointer(this.material.shaderProgram.vertexPositionAttribute,
					this.dots.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
			
			var mMatrix = mat4.create();
			mat4.fromTranslation(mMatrix, vec3.fromValues(
					this.points[i * 3],
					this.points[i * 3 + 1],
					this.points[i * 3 + 2]
			));
			var mvpMatrix = mat4.create();
			mat4.multiply(mvpMatrix, vpMatrix, mMatrix);
			
			gl.uniformMatrix4fv(this.material.shaderProgram.mvpMatrixUniform, false, mvpMatrix);
			
			gl.uniform3f(this.material.shaderProgram.color,
					this.color[0],
					this.color[1],
					this.color[2]);
			
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.dots.vertexIndexBuffer);
			gl.drawElements(gl.TRIANGLES, this.dots.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}
	
	init(gl) {
		this.material.init(gl);
		
		this.dots.init(gl, 0.05);
		
		var radius = 5;
		this.points = [
			0, -radius, 0,
			0, 0, radius,
			radius, 0, 0,
			0, 0, -radius,
			-radius, 0, 0,
			0, radius, 0
		];
		this.count = this.points.length / 3;		
		
		this.moveData = [];
		for (var i = 0; i < this.count; i++) {
	    	var data = new MoveData(vec3.fromValues(this.points[i*3], this.points[i*3+1], this.points[i*3+2]),
	    			0.5, remap(Math.random(), 0, 1, 0.2, 0.3));
	    	this.moveData.push(data);
		}
		
		this.triangles = [
			0, 1, 2,
			0, 2, 3,
			0, 3, 4,
			0, 4, 1,
			
			5, 2, 1,
			5, 3, 2,
			5, 4, 3,
			5, 1, 4
		];
		
		
		this.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points), gl.DYNAMIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = this.points.length / 3;
		
		this.vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.triangles), gl.STATIC_DRAW);
		this.vertexIndexBuffer.itemSize = 1;
		this.vertexIndexBuffer.numItems = this.triangles.length;
	}
	
	update(gl) {
		var deltaTime = (timer.deltaTime / 1000);
		
		if (deltaTime > 0.5) {
			return;
		}
		
		return;
		
		for (var i = 0; i < this.count; i++) {
			var data = this.moveData[i];
			var pos = lerp(data.a, data.b, data.progress);
	    	
			data.progress += data.speed * deltaTime;

	    	if (data.progress >= 1) {
	    		data.newB();
	    	}
	    	
	    	this.points[i * 3] = pos[0];
	    	this.points[i * 3 + 1] = pos[1];
	    	this.points[i * 3 + 2] = pos[2];
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.points), gl.DYNAMIC_DRAW);
		
	}
}