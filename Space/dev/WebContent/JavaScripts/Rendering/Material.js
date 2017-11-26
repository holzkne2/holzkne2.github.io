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

	    this.shaderProgram.shadowMaps = gl.getUniformLocation(this.shaderProgram, "uShadowMap");
	    
	    this.shaderProgram.mainTexture = gl.getUniformLocation(this.shaderProgram, "uTexture");
	    
	    this.shaderProgram.cascadeEndClipSpace = [3];
	    this.shaderProgram.cascadeEndClipSpace[0] = gl.getUniformLocation(this.shaderProgram, "uCascadeEndClipSpace[0]");
	    this.shaderProgram.cascadeEndClipSpace[1] = gl.getUniformLocation(this.shaderProgram, "uCascadeEndClipSpace[1]");
	    this.shaderProgram.cascadeEndClipSpace[2] = gl.getUniformLocation(this.shaderProgram, "uCascadeEndClipSpace[2]");
	    
	    this.shaderProgram.ambientColorUniform = gl.getUniformLocation(this.shaderProgram, "uAmbientColor");
	    this.shaderProgram.lightingDirectionUniform = gl.getUniformLocation(this.shaderProgram, "uLightingDirection");
	    this.shaderProgram.directionalColorUniform = gl.getUniformLocation(this.shaderProgram, "uDirectionalColor");
	    
	    this.shaderProgram.lightMVP = [3];
	    this.shaderProgram.lightMVP[0] = gl.getUniformLocation(this.shaderProgram, "uMVPlight[0]");
	    this.shaderProgram.lightMVP[1] = gl.getUniformLocation(this.shaderProgram, "uMVPlight[1]");
	    this.shaderProgram.lightMVP[2] = gl.getUniformLocation(this.shaderProgram, "uMVPlight[2]");
	    
	    this.initShadow(gl);
	    
	    this.is_init = true;
	}
}