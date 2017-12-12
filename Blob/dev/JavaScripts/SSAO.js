function lerp(a, b, t) {
	return a * (1 - t) + b * (t);
}

class SSAO {
	constructor() {
		this.is_init = false;
	}
	
	init(gl) {
		if (this.is_init)
			return;
		
		// Mesh
		{
			var vertices = [
				-1, -1, 0,
				-1, 1, 0,
				1, -1, 0,
				1, 1, 0
			];
			
			this.vertexPositionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			this.vertexPositionBuffer.itemSize = 3;
			this.vertexPositionBuffer.numItems = vertices.length / 3;
			
			var uvs = [
				0, 0,
				0, 1,
				1, 0,
				1, 1
			];
			
			this.vertexTextureCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
			this.vertexTextureCoordBuffer.itemSize = 2;
			this.vertexTextureCoordBuffer.numItems = uvs.length / 2;
		}
		
		// Material
		{
			var fragmentShader = getShader(ssaoPostFragment, "x-shader/x-fragment");
		    var vertexShader = getShader(ssaoPostVertex, "x-shader/x-vertex");
			
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
		    
		    this.shaderProgram.textureCoordAttribute = gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
	    	gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
		    
		    this.shaderProgram.aspectRatio = gl.getUniformLocation(this.shaderProgram, "uAspectRatio");
		    this.shaderProgram.tanHalfFOV = gl.getUniformLocation(this.shaderProgram, "uTanHalfFOV");
		    
	    	this.shaderProgram.texture = gl.getUniformLocation(this.shaderProgram, "uNormalDepthMap");
	    	
	    	this.shaderProgram.pMatrix = gl.getUniformLocation(this.shaderProgram, "uPmatrix");
		    
	    	this.shaderProgram.kernel = gl.getUniformLocation(this.shaderProgram, "uKernel");

	    	
		    gl.useProgram(null);
		}
	    
		this.is_init = true;
	}
	
	render(gl, ndrt, aspectRatio, tanHalfFOV, pMatrix) {
		this.init(gl);
		
		gl.useProgram(this.shaderProgram);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
				this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
	    gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute,
	    		this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    
	    gl.uniform1f(this.shaderProgram.aspectRatio, aspectRatio);
	    
	    gl.uniform1f(this.shaderProgram.tanHalfFOV, tanHalfFOV);
	    
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, ndrt);
	    gl.uniform1i(this.shaderProgram.texture, 0);
	    
		gl.uniformMatrix4fv(this.shaderProgram.pMatrix, false, pMatrix);

		// TODO: memorize
		var kernel = [];
		for (var i = 0; i < 64; ++i) {
		   var k = vec3.fromValues(
		   Math.random(-1.0, 1.0),
		   Math.random(-1.0, 1.0),
		   Math.random(-1.0, 1.0));
		   vec3.normalize(k,k);

		   var scale = i / 64;
		   scale = lerp(0.1, 1.0, scale * scale);
		   vec3.scale(k, k, scale);
		   
		   kernel[i*3] = k[0];
		   kernel[i*3+1] = k[1];
		   kernel[i*3+2] = k[2];
		}
		gl.uniform3fv(this.shaderProgram.kernel, kernel);
	    
	    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexPositionBuffer.numItems);
	}
}