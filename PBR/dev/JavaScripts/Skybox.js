var skyboxVertexSoruce =`#version 300 es
in vec3 aVertexPosition;

uniform mat4 uMVPmatrix;

out vec3 vLocalPos;

void main(void) {
	gl_Position = uMVPmatrix * vec4(aVertexPosition, 1.0);
    vLocalPos = aVertexPosition;
}
`;

var skyboxFragmentSource = `#version 300 es
precision mediump float;

out vec4 fragmentColor;

in vec3 vLocalPos;

uniform sampler2D uEquirectangularMap;

vec2 SampleSphericalMap(vec3 v)
{
	vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
	uv *= vec2(0.1591, 0.3183);
	uv += 0.5;
	return uv; 
}

void main(void) {
	vec2 uv = SampleSphericalMap(normalize(vLocalPos));
	vec3 col = texture(uEquirectangularMap, uv).rgb;
	
	fragmentColor = vec4(col, 1.0);
}
`;

class Skybox {
	constructor() {
		this.model = new Model();
	}
	
	render(gl, mvpMatrix) {
		gl.useProgram(this.shaderProgram);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.model.meshes[0].vertexPositionBuffer);
		gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
				this.model.meshes[0].vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.uniformMatrix4fv(this.shaderProgram.mvpMatrixUniform, false, mvpMatrix);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture.texture);
		gl.uniform1i(this.shaderProgram.equirectangularMap, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.meshes[0].vertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, this.model.meshes[0].vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
	init(gl) {
		var texture = new Texture();
	    texture.init(gl, "Alexs_Apt_8k.jpg");
		this.texture = texture;
		
		this.model.meshes[0] = new Mesh();
		this.model.meshes[0].cube();
		this.model.init(gl)
		
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
	    
	    this.shaderProgram.equirectangularMap = gl.getUniformLocation(this.shaderProgram, "uEquirectangularMap");
	    
	    this.shaderProgram.mvpMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVPmatrix");
	}
}

var skybox = new Skybox();