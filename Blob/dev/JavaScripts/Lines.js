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
		gl.drawElements(gl.LINES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
//		gl.drawArrays(gl.LINE_STRIP, 0, this.vertexPositionBuffer.numItems);
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
		
		this.count = 0;
		var radius = 2.5;
		var t = (1.0 + Math.sqrt(5)) / 2.0;
		this.points = [
			-1,  t,  0,
			 1,  t,  0,
			-1, -t,  0,
			 1, -t,  0,
			
			 0, -1,  t,
			 0,  1,  t,
			 0, -1, -t,
			 0,  1, -t,
			 
			 t,  0, -1,
			 t,  0,  1,
			-t,  0, -1,
			-t,  0,  1
			 ];
		this.count = this.points.length / 3;
		
		for (var i = 0; i < this.points.length; i++) {
			this.points[i] *= radius;
		}
		
		this.triangles = [
			0, 11, 11, 5, 5, 0,
			0, 5, 5, 1, 1, 0,
			0, 1, 1, 7, 7, 0,
			0, 7, 7, 10, 10, 0,
			0, 10, 10, 11, 11, 0,
			
			1, 5, 5, 9, 9, 1,
			5, 11, 11, 4, 4, 5,
			11, 10, 10, 2, 2, 11,
			10, 7, 7, 6, 6, 10,
			7, 1, 1, 8, 8, 7,
			
			3, 9, 9, 4, 4, 3,
			3, 4, 4, 2, 2, 3,
			3, 2, 2, 6, 6, 3,
			3, 6, 6, 8, 8, 3,
			3, 8, 8, 9, 9, 3
		];
		
//		this.triangles = [
//			0, 11, 5,
//			0, 5, 1,
//			0, 1, 7,
//			0, 7, 10,
//			0, 10, 11,
//			
//			1, 5, 9,
//			5, 11, 4,
//			11, 10, 2,
//			10, 7, 6,
//			7, 1, 8,
//			
//			3, 9, 4,
//			3, 4, 2,
//			3, 2, 6,
//			3, 6, 8,
//			3, 8, 9,
//			
//			4, 9, 5,
//			2, 4, 11,
//			6, 2, 10,
//			8, 6, 7,
//			9, 8, 1
//		];
		
		this.moveData = [];
		for (var i = 0; i < this.count; i++) {
	    	var data = new MoveData(vec3.fromValues(this.points[i*3], this.points[i*3+1], this.points[i*3+2]),
	    			0.5, remap(Math.random(), 0, 1, 0.2, 0.3));
	    	this.moveData.push(data);
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