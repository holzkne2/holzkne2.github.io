var skyboxVertexSoruce =`#version 300 es
in vec3 aVertexPosition;

uniform mat4 uMVPmatrix;
uniform mat4 uObjectToWorld;

out vec3 vWorldPos;

void main(void) {
	gl_Position = uMVPmatrix * vec4(aVertexPosition, 1.0);
    vWorldPos = (uObjectToWorld * vec4(aVertexPosition, 1.0)).xyz;
}


`;

var skyboxFragmentSource = `#version 300 es
precision mediump float;

out vec4 fragmentColor;

uniform vec3 uTopColor;
uniform vec3 uBottomColor;

in vec3 vWorldPos;

float remap(float value, float low1, float high1, float low2, float high2) {
	return (value - low1) * (high2 - low2) / (high1 - low1) + low2;
}

vec3 lerp (vec3 a, vec3 b, float t) {
	return a * (1.0 - t) + b * (t);
}

void main(void) {
	vec3 viewDirection = normalize(vec3(0.0, 0.0, 0.0) - vWorldPos);
	
	float y = remap(viewDirection.y, -0.3, 0.3, 0.0, 1.0);
	
	vec3 col = lerp(uTopColor, uBottomColor, y);
	
	fragmentColor = vec4(col, 1.0);
}
`;

class Skybox {
	constructor() {
		this.dots = new Dots();
		
		this.topColor = [0.95, 0.95, 0.95];
		this.bottomColor = [0.95, 0.95, 0.95];
	}
	
	render(gl, mvpMatrix, camera) {
		gl.useProgram(this.shaderProgram);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.dots.vertexPositionBuffer);
		gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
				this.dots.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.uniformMatrix4fv(this.shaderProgram.mvpMatrixUniform, false, mvpMatrix);
		
		gl.uniform3f(this.shaderProgram.topColor,
				this.topColor[0],
				this.topColor[1],
				this.topColor[2]);
		gl.uniform3f(this.shaderProgram.bottomColor,
				this.bottomColor[0],
				this.bottomColor[1],
				this.bottomColor[2]);
		
		gl.uniformMatrix4fv(this.shaderProgram.objectToWorld, false, mat4.create());
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.dots.vertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, this.dots.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
	init(gl) {
		this.dots.init(gl, 1000)
		
		var fragmentShader = getShader(skyboxFragmentSource, "x-shader/x-fragment");
	    var vertexShader = getShader(skyboxVertexSoruce, "x-shader/x-vertex");
	    
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
	    
	    this.shaderProgram.mvpMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVPmatrix");
	    
	    this.shaderProgram.topColor = gl.getUniformLocation(this.shaderProgram, "uTopColor");
	    this.shaderProgram.bottomColor = gl.getUniformLocation(this.shaderProgram, "uBottomColor");
	    
	    this.shaderProgram.objectToWorld = gl.getUniformLocation(this.shaderProgram, "uObjectToWorld");
	    
	    this.shaderProgram.worldSpaceCameraPos = gl.getUniformLocation(this.shaderProgram, "uWorldSpaceCameraPos");
	}
}