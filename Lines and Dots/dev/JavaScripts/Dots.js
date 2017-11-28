class Dots {
	constructor() {
		this.is_init = false;
	}
	
	init(gl, radius) {
		if (this.is_init) {
			return;
		}
		
		this.sphere(radius);
		
		this.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = this.vertices.length / 3;
		
		this.vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.triangles), gl.STATIC_DRAW);
		this.vertexIndexBuffer.itemSize = 1;
		this.vertexIndexBuffer.numItems = this.triangles.length;
		
		this.is_init = true;
	}
	
	sphere(radius) {
		var latBands = 20;
		var longBands = 20;
		this.vertices = [];
		
		for (var lat = 0; lat <= latBands; lat++) {
			var theta = lat * Math.PI / latBands;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);
			
			for (var long = 0; long <= longBands; long++) {
				var phi = long * 2 * Math.PI / longBands;
				var sinPhi = Math.sin(phi);
				var cosPhi = Math.cos(phi);
				
				var x = cosPhi * sinTheta;
				var y = cosTheta;
				var z = sinPhi * sinTheta;
				
				this.vertices.push(radius * x);
				this.vertices.push(radius * y);
				this.vertices.push(radius * z);
			}
		}
		
		this.triangles = [];
		for (var lat = 0; lat < latBands; lat++) {
			for (var long = 0; long < longBands; long++) {
				var first = (lat * (longBands + 1)) + long;
				var second = first + longBands + 1;
				this.triangles.push(first);
				this.triangles.push(second);
				this.triangles.push(first + 1);
				
				this.triangles.push(second);
				this.triangles.push(second + 1);
				this.triangles.push(first + 1);
			}
		}
	}
}