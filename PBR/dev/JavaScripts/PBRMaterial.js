class PBRMaterial
{
	constructor() {
		this.is_init = false;
		
		this.shaderProgram;
	}
	
	init(gl) {
		if (this.is_init) {
			return;
		}
		
		var vertexShader = getShader(PBRvert, "x-shader/x-vertex");
		var fragmentShader = getShader(PBRfrag, "x-shader/x-fragment");
		
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

    	this.shaderProgram.irradianceMap = gl.getUniformLocation(this.shaderProgram, "uIrradianceMap");
    	this.shaderProgram.prefilterMap = gl.getUniformLocation(this.shaderProgram, "uPrefilterMap");
    	this.shaderProgram.brdfLUT = gl.getUniformLocation(this.shaderProgram, "uBrdfLUT");
    	
	    this.shaderProgram.albedo = gl.getUniformLocation(this.shaderProgram, "uAlbedo");
	    
	    this.shaderProgram.metallic = gl.getUniformLocation(this.shaderProgram, "uMetallic");
	    this.shaderProgram.roughness = gl.getUniformLocation(this.shaderProgram, "uRoughness");
	    
	    this.shaderProgram.mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
	    this.shaderProgram.pMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
	    this.shaderProgram.nMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uNMatrix");
	    this.shaderProgram.objectToWorld = gl.getUniformLocation(this.shaderProgram, "uObjectToWorld");
	    
	    this.shaderProgram.worldSpaceCameraPos = gl.getUniformLocation(this.shaderProgram, "uWorldSpaceCameraPos");

	    this.shaderProgram.lightingDirectionUniform = gl.getUniformLocation(this.shaderProgram, "uLightingDirection");
	    this.shaderProgram.directionalColorUniform = gl.getUniformLocation(this.shaderProgram, "uDirectionalColor");
		
		this.is_init = true;
	}
}