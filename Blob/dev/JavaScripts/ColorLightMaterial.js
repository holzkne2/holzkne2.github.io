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

class ColorLightMaterial {
	constructor() {
		this.is_init = false;
		
		this.shaderProgram;
	}
	
	init(gl) {
		if (this.is_init) {
			return;
		}
		
		var fragmentShader = getShader(ColorFragmentSource, "x-shader/x-fragment");
	    var vertexShader = getShader(ColorVertexSource, "x-shader/x-vertex");
	    
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
	    gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
	    
	    this.shaderProgram.nMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uNmatrix");
	    
	    this.shaderProgram.color = gl.getUniformLocation(this.shaderProgram, "uColor");
	    
	    this.shaderProgram.mvpMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVPmatrix");
	    
	    gl.useProgram(null);
	    
	    this.init_normalDepth(gl);
	    
	    this.is_init = true;
	}
	
	init_normalDepth(gl) {
		var fragmentShader = getShader(DepthNormalFragmentSource, "x-shader/x-fragment");
	    var vertexShader = getShader(DepthNormalVertexSource, "x-shader/x-vertex");
	    
	    this.NDshaderProgram = gl.createProgram();
	    gl.attachShader(this.NDshaderProgram, vertexShader);
	    gl.attachShader(this.NDshaderProgram, fragmentShader);
	    gl.linkProgram(this.NDshaderProgram);
	    
	    if (!gl.getProgramParameter(this.NDshaderProgram, gl.LINK_STATUS)) {
	        alert("Could not initialise Normal Depth shaders");
	        return;
	    }
	    
	    gl.useProgram(this.NDshaderProgram);
	    
	    this.NDshaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.NDshaderProgram, "aVertexPosition");
	    gl.enableVertexAttribArray(this.NDshaderProgram.vertexPositionAttribute);
	    
	    this.NDshaderProgram.vertexNormalAttribute = gl.getAttribLocation(this.NDshaderProgram, "aVertexNormal");
	    gl.enableVertexAttribArray(this.NDshaderProgram.vertexNormalAttribute);
	    
	    this.NDshaderProgram.nMatrixUniform = gl.getUniformLocation(this.NDshaderProgram, "uNmatrix");
	    	    
	    this.NDshaderProgram.mvpMatrixUniform = gl.getUniformLocation(this.NDshaderProgram, "uMVPmatrix");
	    this.NDshaderProgram.mvMatrixUniform = gl.getUniformLocation(this.NDshaderProgram, "uMVmatrix");
	    
	    gl.useProgram(null);
	}
}