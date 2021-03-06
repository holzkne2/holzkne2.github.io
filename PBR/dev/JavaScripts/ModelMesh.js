class Model {
	constructor() {
		this.meshes = [];
	}
	
	load(file) {
		OBJLoader(file, this);
	}
	
	init(gl) {
		for (var i = 0; i < this.meshes.length; i++) {
			this.meshes[i].init(gl);
		}
	}
	
	isInit() {
		for (var i = 0; i < this.meshes.length; i++) {
			if (!this.meshes[i].is_init) {
				return false;
			}
		}
		return true;
	}
}

class Mesh {
	constructor() {
		this.is_init = false;
		
		this.vertexPositionBuffer;
		this.vertexNormalBuffer;
		this.vertexTextureCoordBuffer;
		this.vertexIndexBuffer;
		
		this.vertices = [];
		this.normals = [];
		this.uvs = [];
		this.triangles = [];
	}
	
	init(gl) {
		if (this.is_init) {
			return;
		}
		
		this.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = this.vertices.length / 3;
		
		this.vertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
		this.vertexNormalBuffer.itemSize = 3;
		this.vertexNormalBuffer.numItems = this.normals.length / 3;
		
		this.vertexTextureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
		this.vertexTextureCoordBuffer.itemSize = 2;
		this.vertexTextureCoordBuffer.numItems = this.uvs.length / 2;
		
		this.vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.triangles), gl.STATIC_DRAW);
		this.vertexIndexBuffer.itemSize = 1;
		this.vertexIndexBuffer.numItems = this.triangles.length;
		
		this.is_init = true;
	}
	
	recalculateNormals() {
		
	}
	
	sphere(radius) {
		var latBands = 40;
		var longBands = 40;
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
				
				this.normals.push(x);
				this.normals.push(y);
				this.normals.push(z);
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
	
	cube() {
		this.vertices = [
	        // Front face
	        -1.0, -1.0,  1.0,
	         1.0, -1.0,  1.0,
	         1.0,  1.0,  1.0,
	        -1.0,  1.0,  1.0,

	        // Back face
	        -1.0, -1.0, -1.0,
	        -1.0,  1.0, -1.0,
	         1.0,  1.0, -1.0,
	         1.0, -1.0, -1.0,

	        // Top face
	        -1.0,  1.0, -1.0,
	        -1.0,  1.0,  1.0,
	         1.0,  1.0,  1.0,
	         1.0,  1.0, -1.0,

	        // Bottom face
	        -1.0, -1.0, -1.0,
	         1.0, -1.0, -1.0,
	         1.0, -1.0,  1.0,
	        -1.0, -1.0,  1.0,

	        // Right face
	         1.0, -1.0, -1.0,
	         1.0,  1.0, -1.0,
	         1.0,  1.0,  1.0,
	         1.0, -1.0,  1.0,

	        // Left face
	        -1.0, -1.0, -1.0,
	        -1.0, -1.0,  1.0,
	        -1.0,  1.0,  1.0,
	        -1.0,  1.0, -1.0,
	    ];
		
		this.normals = [
	        // Front face
	         0.0,  0.0,  1.0,
	         0.0,  0.0,  1.0,
	         0.0,  0.0,  1.0,
	         0.0,  0.0,  1.0,
	        // Back face
	         0.0,  0.0, -1.0,
	         0.0,  0.0, -1.0,
	         0.0,  0.0, -1.0,
	         0.0,  0.0, -1.0,
	        // Top face
	         0.0,  1.0,  0.0,
	         0.0,  1.0,  0.0,
	         0.0,  1.0,  0.0,
	         0.0,  1.0,  0.0,
	        // Bottom face
	         0.0, -1.0,  0.0,
	         0.0, -1.0,  0.0,
	         0.0, -1.0,  0.0,
	         0.0, -1.0,  0.0,
	        // Right face
	         1.0,  0.0,  0.0,
	         1.0,  0.0,  0.0,
	         1.0,  0.0,  0.0,
	         1.0,  0.0,  0.0,
	        // Left face
	        -1.0,  0.0,  0.0,
	        -1.0,  0.0,  0.0,
	        -1.0,  0.0,  0.0,
	        -1.0,  0.0,  0.0
	    ];
		
		this.uvs = [
		      // Front face
		      0.0, 0.0,
		      1.0, 0.0,
		      1.0, 1.0,
		      0.0, 1.0,

		      // Back face
		      1.0, 0.0,
		      1.0, 1.0,
		      0.0, 1.0,
		      0.0, 0.0,

		      // Top face
		      0.0, 1.0,
		      0.0, 0.0,
		      1.0, 0.0,
		      1.0, 1.0,

		      // Bottom face
		      1.0, 1.0,
		      0.0, 1.0,
		      0.0, 0.0,
		      1.0, 0.0,

		      // Right face
		      1.0, 0.0,
		      1.0, 1.0,
		      0.0, 1.0,
		      0.0, 0.0,

		      // Left face
		      0.0, 0.0,
		      1.0, 0.0,
		      1.0, 1.0,
		      0.0, 1.0,
		    ];
		
		this.triangles = [
	        0, 1, 2,      0, 2, 3,    // Front face
	        4, 5, 6,      4, 6, 7,    // Back face
	        8, 9, 10,     8, 10, 11,  // Top face
	        12, 13, 14,   12, 14, 15, // Bottom face
	        16, 17, 18,   16, 18, 19, // Right face
	        20, 21, 22,   20, 22, 23  // Left face
	    ];
	}
	
}