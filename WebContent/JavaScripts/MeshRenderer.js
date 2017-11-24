class MeshRenderer {
	constructor() {
		this.model;
		this.materials = [];
	}
	
	renderShadow(gl, mvMatrix, pLightMatrix) {
		if (typeof this.model == 'undefined' || typeof this.materials.length == 0) {
			return;
		}
		
		if (!this.model.isInit()) {
			this.model.init(gl);
		}
		
		for (var i = 0; i < this.model.meshes.length; i++) {
			var matIndex = Math.min(i, this.materials.length - 1);
			gl.useProgram(this.materials[matIndex].shaderProgramShadow);
			
			gl.uniformMatrix4fv(this.materials[matIndex].shaderProgramShadow.pMatrixUniform, false, pLightMatrix);
			gl.uniformMatrix4fv(this.materials[matIndex].shaderProgramShadow.mvMatrixUniform, false, mvMatrix);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.model.meshes[i].vertexPositionBuffer);
		    gl.vertexAttribPointer(this.materials[matIndex].shaderProgramShadow.vertexPositionAttribute,
		    		this.model.meshes[i].vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		    
		    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.meshes[i].vertexIndexBuffer);
		    
		    gl.drawElements(gl.TRIANGLES, this.model.meshes[i].vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}
	
	render(gl, pMatrix, mMatrix, mvMatrix, camera, lightingDirection, depthTexture,
			lightMatrix, pLightMatrix) {
		if (typeof this.model == 'undefined' || typeof this.materials.length == 0) {
			return;
		}
		
		if (!this.model.isInit()) {
			this.model.init(gl);
		}
		
		for (var i = 0; i < this.model.meshes.length; i++) {
			var matIndex = Math.min(i, this.materials.length - 1);
			gl.useProgram(this.materials[matIndex].shaderProgram);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.model.meshes[i].vertexPositionBuffer);
		    gl.vertexAttribPointer(this.materials[matIndex].shaderProgram.vertexPositionAttribute,
		    		this.model.meshes[i].vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		    if (this.materials[matIndex].shaderProgram.vertexNormalAttribute != -1) {
			    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.meshes[i].vertexNormalBuffer);
			    gl.vertexAttribPointer(this.materials[matIndex].shaderProgram.vertexNormalAttribute,
			    		this.model.meshes[i].vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		    }
		    
	    	if (this.materials[matIndex].shaderProgram.textureCoordAttribute != -1) {
			    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.meshes[i].vertexTextureCoordBuffer);
			    gl.vertexAttribPointer(this.materials[matIndex].shaderProgram.textureCoordAttribute,
			    		this.model.meshes[i].vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
		    }
		
		    gl.activeTexture(gl.TEXTURE0);
		    gl.bindTexture(gl.TEXTURE_2D, depthTexture.texture);
		    gl.uniform1i(this.materials[matIndex].shaderProgram.samplerUniform, 0);
		    
		   gl.uniform3f(
					this.materials[matIndex].shaderProgram.ambientColorUniform,
					0.2,
		            0.2,
		            0.2
					);
			
//			var lightingDirection = [
//		        -0.25,
//		        -0.25,
//		        -1
//		    ];
			
			var adjustedLD = vec3.create();
		    vec3.normalize(adjustedLD, lightingDirection);
		    vec3.scale(adjustedLD, adjustedLD, -1);
		    gl.uniform3fv(this.materials[matIndex].shaderProgram.lightingDirectionUniform, adjustedLD);
		    
		    gl.uniform3f(
		    		this.materials[matIndex].shaderProgram.directionalColorUniform,
		        1,
		        1,
		        0.9
		    );
		    
		    if (this.materials[matIndex].shaderProgram.color != null) {
		    	gl.uniform3f(this.materials[matIndex].shaderProgram.color,
		    			this.materials[matIndex].color[0],
		    			this.materials[matIndex].color[1],
		    			this.materials[matIndex].color[2]);
		    }
		    
		    if (this.materials[matIndex].shaderProgram.metallic != null) {
		    	gl.uniform1f(this.materials[matIndex].shaderProgram.metallic,
		    			this.materials[matIndex].metallic);
		    }
		    
		    if (this.materials[matIndex].shaderProgram.smoothness != null) {
		    	gl.uniform1f(this.materials[matIndex].shaderProgram.smoothness,
		    			this.materials[matIndex].smoothness);
		    }
		    
		    if(this.materials[matIndex].shaderProgram.worldSpaceCameraPos != null) {
		    	gl.uniform3f(this.materials[matIndex].shaderProgram.worldSpaceCameraPos,
		    			camera.gameObject.position[0],
		    			camera.gameObject.position[1],
		    			camera.gameObject.position[2]);
		    }
		    
		    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.meshes[i].vertexIndexBuffer);
		    
		    
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.pMatrixUniform, false, pMatrix);
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.mvMatrixUniform, false, mvMatrix);
		    
		    var normalMatrix = mat3.create();
		    mat3.normalFromMat4(normalMatrix, mMatrix);
		    gl.uniformMatrix3fv(this.materials[matIndex].shaderProgram.nMatrixUniform, false, normalMatrix);
		    
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.objectToWorld, false, mMatrix);
		    
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.lightMViewMatrix, false, lightMatrix);
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.lightProjectionMatrix, false, pLightMatrix);
		    
		    gl.drawElements(gl.TRIANGLES, this.model.meshes[i].vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}
	
	init(gl) {
		model.init(gl);
		for (var i = 0; i < materials.length; i++) {
			material.init(gl);
		}
	}
}

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
	
	screen() {
		this.vertices = [
			0, 0, -1,
			0, 1, -1,
			1, 1, -1,
			1, 0, -1
		];
		
		this.uvs = [
		      // Front face
		      0.0, 0.0,
		      0.0, 1.0,
		      1.0, 1.0,
		      1.0, 0.0
	      ];
		
		this.triangles = [
	        0, 1, 2,      0, 2, 3, 
        ];
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

function handleLoadedTexture(gl, texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
}

class Texture {
	constructor() {
		this.is_init = false;
		
		this.texture;
	}
	
	init(gl, file) {
		if (this.is_init) {
			return;
		}
		
		this.texture = gl.createTexture();
		this.texture.image = new Image();
		var temp = this.texture;
		
		this.texture.image.onload = function () {
	        handleLoadedTexture(gl, temp);
	    }

		this.texture.image.src = file;
		
		this.is_init = true;
	}
}

class RenderTexture {
	constructor(gl, width, height) {
		this.textureWidth = width;
		this.textureHeight = height;
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		{
			const level = 0;
			const internalFormat = gl.RGBA;
			const border = 0;
			const format = gl.RGBA;
			const type = gl.UNSIGNED_BYTE;
			const data = null;
			gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
					this.textureWidth, this.textureHeight, border,
					format, type, data);
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		
		this.fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
		 
		const attachmentPoint = gl.COLOR_ATTACHMENT0;
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.texture, 0);

		const depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
		
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.textureWidth, this.textureHeight);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
	}
}

class DepthTexture {
	constructor(gl, width, height) {
//		var depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture");
//		if(!depthTextureExt) {
//			alert("Depth Texture Not Supported");
//			return;
//		}
		
		this.textureWidth = width;
		this.textureHeight = height;
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		{
			const level = 0;
			const internalFormat = gl.RGBA;
			const border = 0;
			const format = gl.RGBA;
			const type = gl.UNSIGNED_BYTE;
			const data = null;
			gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
					this.textureWidth, this.textureHeight, border,
					format, type, data);
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		
		this.fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
		
		this.renderBuffer = gl.createRenderbuffer()
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer)
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
				width, height)
		 
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D, this.texture, 0)
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, this.renderBuffer)
		
		gl.bindTexture(gl.TEXTURE_2D, null)
		gl.bindRenderbuffer(gl.RENDERBUFFER, null)
	}
}


class StandardMaterial {
	constructor() {
		this.is_init = false;
		
		this.shaderProgram;
	}
	
	initShadow(gl) {
		var fragmentShader = getShader(lightFragmentGLSL, "x-shader/x-fragment");
	    var vertexShader = getShader(lightVertexGLSL, "x-shader/x-vertex");
	    
	    this.shaderProgramShadow = gl.createProgram();
	    gl.attachShader(this.shaderProgramShadow, vertexShader);
	    gl.attachShader(this.shaderProgramShadow, fragmentShader);
	    gl.linkProgram(this.shaderProgramShadow);
	    
//	    f (!gl.getProgramParameter(this.shaderProgramShadow, gl.LINK_STATUS)) {
//	        alert("Could not initialise shaders");
//	    }

	    gl.useProgram(this.shaderProgramShadow);
	    
	    this.shaderProgramShadow.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgramShadow, "aVertexPosition");
	    gl.enableVertexAttribArray(this.shaderProgramShadow.vertexPositionAttribute);
	    
	    this.shaderProgramShadow.pMatrixUniform = gl.getUniformLocation(this.shaderProgramShadow, "uPMatrix");
	    this.shaderProgramShadow.mvMatrixUniform = gl.getUniformLocation(this.shaderProgramShadow, "uMVMatrix");
	}
	
	init(gl, fSource, vSource) {
		if (this.is_init) {
			return;
		}
		
		var fragmentShader = getShader(fSource, "x-shader/x-fragment");
	    var vertexShader = getShader(vSource, "x-shader/x-vertex");
	    
	    this.shaderProgram = gl.createProgram();
	    gl.attachShader(this.shaderProgram, vertexShader);
	    gl.attachShader(this.shaderProgram, fragmentShader);
	    gl.linkProgram(this.shaderProgram);

	    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
	        alert("Could not initialise shaders");
	        return;
	    }

	    gl.useProgram(this.shaderProgram);

	    this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
	    gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

	    this.shaderProgram.vertexNormalAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
	    if (this.shaderProgram.vertexNormalAttribute != -1) {
	    	gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
	    }
	    
	    this.shaderProgram.textureCoordAttribute = gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
	    if (this.shaderProgram.textureCoordAttribute != -1) {
	    	gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
	    }

	    this.shaderProgram.color = gl.getUniformLocation(this.shaderProgram, "uColor");
	    this.shaderProgram.metallic = gl.getUniformLocation(this.shaderProgram, "uMetallic");
	    this.shaderProgram.smoothness = gl.getUniformLocation(this.shaderProgram, "uSmoothness");
	    
	    this.shaderProgram.pMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
	    this.shaderProgram.mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
	    this.shaderProgram.nMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uNMatrix");
	    this.shaderProgram.objectToWorld = gl.getUniformLocation(this.shaderProgram, "uObjectToWorld")
	    
	    this.shaderProgram.worldSpaceCameraPos = gl.getUniformLocation(this.shaderProgram, "uWorldSpaceCameraPos");
	    
	    this.shaderProgram.samplerUniform = gl.getUniformLocation(this.shaderProgram, "uDepthColorTexture");
	    
	    this.shaderProgram.ambientColorUniform = gl.getUniformLocation(this.shaderProgram, "uAmbientColor");
	    this.shaderProgram.lightingDirectionUniform = gl.getUniformLocation(this.shaderProgram, "uLightingDirection");
	    this.shaderProgram.directionalColorUniform = gl.getUniformLocation(this.shaderProgram, "uDirectionalColor");
	    
	    this.shaderProgram.lightMViewMatrix = gl.getUniformLocation(this.shaderProgram, "uLightMViewMatrix");
	    this.shaderProgram.lightProjectionMatrix = gl.getUniformLocation(this.shaderProgram, "uLightProjectionMatrix");
	    
	    this.initShadow(gl);
	    
	    this.is_init = true;
	}
	
	render(gl) {
		
	}
}