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

class UnlitColorMaterial {
	constructor() {
		this.is_init = false;
		
		this.shaderProgram;
	}
	
	init(gl) {
		if (this.is_init) {
			return;
		}
		
		var fragmentShader = getShader(UnlitColorFragmentSource, "x-shader/x-fragment");
	    var vertexShader = getShader(UnlitColorVertexSource, "x-shader/x-vertex");
	    
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
	    
	    this.shaderProgram.color = gl.getUniformLocation(this.shaderProgram, "uColor");
	    
	    this.shaderProgram.mvpMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVPmatrix");
	    
	    gl.useProgram(null);
	    
	    this.is_init = true;
	}
}