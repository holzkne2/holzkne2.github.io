class Screen {
	constructor() {
		this.is_init = false;
	}
	
	render(gl, texture) {
		gl.useProgram(this.shaderProgram);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
				this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
	    gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute,
	    		this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.uniform1i(this.shaderProgram.texture, 0);
	    
	    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexPositionBuffer.numItems);
	}
	
	init(gl) {
		if (this.is_init) {
			return;
		}
		
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
			var fragmentShader = getShader(passthroughPostFragment, "x-shader/x-fragment");
		    var vertexShader = getShader(simplePostVertex, "x-shader/x-vertex");
		    
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
	    	
	    	this.shaderProgram.texture = gl.getUniformLocation(this.shaderProgram, "uTexture");
	    	
	    	gl.useProgram(null);
		}
		
		this.is_init = true;
	}
}