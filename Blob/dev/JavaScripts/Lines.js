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
		
//		this.mesh = new Model();
//		OBJLoader("SphereMesh.obj", this.mesh);
		
		this.points = [];
		this.moveData = [];
		this.material = new UnlitColorMaterial();
		this.dots = new Dots();
	}
	
	renderLines(gl, mvpMatrix) {
//		if (!this.mesh.is_init)
//			return;
		
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
			0.693908, -0.000000, -0.428859,
			0.693908, 0.000000, 0.428859,
			-0.693908, -0.000000, 0.428859,
			-0.693908, 0.000000, -0.428859,
			-0.000000, -0.428859, 0.693908,
			0.000000, 0.428859, 0.693908,
			-0.000000, 0.428859, -0.693908,
			0.000000, -0.428859, -0.693908,
			-0.428859, -0.693908, -0.000000,
			0.428859, -0.693908, 0.000000,
			0.428859, 0.693908, -0.000000,
			-0.428859, 0.693908, 0.000000,
			-0.231405, -0.605826, 0.374421,
			-0.231405, 0.605826, 0.374421,
			-0.374421, 0.231405, -0.605826,
			-0.374421, -0.231405, -0.605826,
			-0.231405, 0.605826, -0.374421,
			-0.231405, -0.605826, -0.374421,
			0.000000, -0.748843, 0.000000,
			0.000000, 0.748843, 0.000000,
			0.605826, -0.374421, 0.231405,
			0.748843, 0.000000, 0.000000,
			0.605826, -0.374421, -0.231405,
			0.605826, 0.374421, -0.231405,
			0.605826, 0.374421, 0.231405,
			0.374421, -0.231405, -0.605826,
			0.374421, 0.231405, -0.605826,
			0.000000, 0.000000, -0.748843,
			0.231405, 0.605826, -0.374421,
			0.231405, -0.605826, -0.374421,
			0.374421, -0.231405, 0.605826,
			0.000000, -0.000000, 0.748843,
			0.374421, 0.231405, 0.605826,
			0.231405, -0.605826, 0.374421,
			0.231405, 0.605826, 0.374421,
			-0.605826, -0.374421, -0.231405,
			-0.748843, 0.000000, 0.000000,
			-0.605826, -0.374421, 0.231405,
			-0.605826, 0.374421, 0.231405,
			-0.605826, 0.374421, -0.231405,
			-0.374421, -0.231405, 0.605826,
			-0.374421, 0.231405, 0.605826,
			0.742344, -0.283550, 0.000000,
			0.742344, 0.283550, 0.000000,
			0.283550, 0.000000, -0.742344,
			0.458794, 0.458794, -0.458794,
			0.458794, -0.458794, -0.458794,
			0.283550, 0.000000, 0.742344,
			0.458794, -0.458794, 0.458794,
			0.458794, 0.458794, 0.458794,
			-0.742344, -0.283550, 0.000000,
			-0.742344, 0.283550, 0.000000,
			-0.283550, -0.000000, 0.742344,
			-0.458794, -0.458794, 0.458794,
			-0.458794, 0.458794, 0.458794,
			-0.283550, 0.000000, -0.742344,
			-0.458794, 0.458794, -0.458794,
			-0.458794, -0.458794, -0.458794,
			0.000000, -0.742344, 0.283550,
			0.000000, 0.742344, 0.283550,
			0.000000, 0.742344, -0.283550,
			0.000000, -0.742344, -0.283550,
		];
		this.count = this.points.length / 3;	
		
		for (var i = 0; i < this.points.length; i++) {
			this.points[i] *= radius;
		}
		
		this.moveData = [];
		for (var i = 0; i < this.count; i++) {
	    	var data = new MoveData(vec3.fromValues(this.points[i*3], this.points[i*3+1], this.points[i*3+2]),
	    			0.5, remap(Math.random(), 0, 1, 0.2, 0.3));
	    	this.moveData.push(data);
		}
		
		this.triangles = [
			2, 21, 22,
			22, 21, 43,
			10, 23, 21,
			21, 23, 43,
			1, 22, 23,
			23, 22, 43,
			1, 24, 22,
			22, 24, 44,
			11, 25, 24,
			24, 25, 44,
			2, 22, 25,
			25, 22, 44,
			1, 26, 27,
			27, 26, 45,
			8, 28, 26,
			26, 28, 45,
			7, 27, 28,
			28, 27, 45,
			1, 27, 24,
			24, 27, 46,
			7, 29, 27,
			27, 29, 46,
			11, 24, 29,
			29, 24, 46,
			1, 23, 26,
			26, 23, 47,
			10, 30, 23,
			23, 30, 47,
			8, 26, 30,
			30, 26, 47,
			5, 31, 32,
			32, 31, 48,
			2, 33, 31,
			31, 33, 48,
			6, 32, 33,
			33, 32, 48,
			10, 21, 34,
			34, 21, 49,
			2, 31, 21,
			21, 31, 49,
			5, 34, 31,
			31, 34, 49,
			2, 25, 33,
			33, 25, 50,
			11, 35, 25,
			25, 35, 50,
			6, 33, 35,
			35, 33, 50,
			4, 36, 37,
			37, 36, 51,
			9, 38, 36,
			36, 38, 51,
			3, 37, 38,
			38, 37, 51,
			3, 39, 37,
			37, 39, 52,
			12, 40, 39,
			39, 40, 52,
			4, 37, 40,
			40, 37, 52,
			5, 32, 41,
			41, 32, 53,
			6, 42, 32,
			32, 42, 53,
			3, 41, 42,
			42, 41, 53,
			3, 38, 41,
			41, 38, 54,
			9, 13, 38,
			38, 13, 54,
			5, 41, 13,
			13, 41, 54,
			6, 14, 42,
			42, 14, 55,
			12, 39, 14,
			14, 39, 55,
			3, 42, 39,
			39, 42, 55,
			7, 28, 15,
			15, 28, 56,
			8, 16, 28,
			28, 16, 56,
			4, 15, 16,
			16, 15, 56,
			4, 40, 15,
			15, 40, 57,
			12, 17, 40,
			40, 17, 57,
			7, 15, 17,
			17, 15, 57,
			4, 16, 36,
			36, 16, 58,
			8, 18, 16,
			16, 18, 58,
			9, 36, 18,
			18, 36, 58,
			5, 13, 34,
			34, 13, 59,
			9, 19, 13,
			13, 19, 59,
			10, 34, 19,
			19, 34, 59,
			6, 35, 14,
			14, 35, 60,
			11, 20, 35,
			35, 20, 60,
			12, 14, 20,
			20, 14, 60,
			7, 17, 29,
			29, 17, 61,
			12, 20, 17,
			17, 20, 61,
			11, 29, 20,
			20, 29, 61,
			8, 30, 18,
			18, 30, 62,
			10, 19, 30,
			30, 19, 62,
			9, 18, 19,
			19, 18, 62
		];
		for (var i = 0; i < this.triangles.length; i++) {
			this.triangles[i] -= 1;
		}
		
		
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