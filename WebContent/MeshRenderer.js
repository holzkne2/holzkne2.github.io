class MeshRenderer {
	constructor() {
		this.mesh;
		this.material;
	}
	
	init(gl) {
		mesh.init(gl);
		material.init(gl);
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

function getShader(source, id) {
    var shader;
    if (id == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (id == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

class StandardMaterial {
	constructor() {
		this.is_init = false;
		
		this.shaderProgram;
	}
	
	init(gl) {
		if (this.is_init) {
			return;
		}
		
		var fragmentShader = getShader(fragmentShaderSource, "x-shader/x-fragment");
	    var vertexShader = getShader(vertexShaderSource, "x-shader/x-vertex");
	    
	    this.shaderProgram = gl.createProgram();
	    gl.attachShader(this.shaderProgram, vertexShader);
	    gl.attachShader(this.shaderProgram, fragmentShader);
	    gl.linkProgram(this.shaderProgram);

	    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
	        alert("Could not initialise shaders");
	    }

	    gl.useProgram(this.shaderProgram);

	    this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
	    gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

	    this.shaderProgram.vertexNormalAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
	    gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
	    
	    this.shaderProgram.textureCoordAttribute = gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
	    gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

	    this.shaderProgram.pMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
	    this.shaderProgram.mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
	    this.shaderProgram.nMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uNMatrix");
	    this.shaderProgram.samplerUniform = gl.getUniformLocation(this.shaderProgram, "uSampler");
	    this.shaderProgram.ambientColorUniform = gl.getUniformLocation(this.shaderProgram, "uAmbientColor");
	    this.shaderProgram.lightingDirectionUniform = gl.getUniformLocation(this.shaderProgram, "uLightingDirection");
	    this.shaderProgram.directionalColorUniform = gl.getUniformLocation(this.shaderProgram, "uDirectionalColor");
	}
}