var irradianceVert = `#version 300 es
in vec3 aVertexPosition;

uniform mat4 uMVPmatrix;

out vec3 vLocalPos;

void main(void) {
	gl_Position = uMVPmatrix * vec4(aVertexPosition, 1.0);
    vLocalPos = aVertexPosition;
}
`;

var irradianceFrag = `#version 300 es
precision mediump float;

out vec4 fragmentColor;

in vec3 vLocalPos;

uniform samplerCube uEnviromentMap;

const float PI = 3.14159265359;

void main(void)
{
	vec3 N = normalize(vLocalPos);
	
	vec3 irradiance = vec3(0.0, 0.0, 0.0);
	
	vec3 up = vec3(0.0, 1.0, 0.0);
	vec3 right = cross(up, N);
	up = cross(N, right);
	
	float sampleDelta = 0.025;
	float nrSamples = 0.0;
	for (float phi = 0.0; phi < 2.0 * PI; phi += sampleDelta)
	{
		for (float theta = 0.0; theta < 0.5 * PI; theta += sampleDelta)
		{
			vec3 tangentSample = vec3(sin(theta) * cos(phi),  sin(theta) * sin(phi), cos(theta));
			vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * N; 

            irradiance += texture(uEnviromentMap, sampleVec).rgb * cos(theta) * sin(theta);
            nrSamples += 1.0;
		}
	}
	
	irradiance = PI * irradiance * (1.0 / float(nrSamples));
    
    fragmentColor = vec4(irradiance, 1.0);
}
`;

class IrradianceMaterial {
	render(gl, model, mvpMatrix, enviromentMap) {
		gl.useProgram(this.shaderProgram);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, model.meshes[0].vertexPositionBuffer);
		gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
				model.meshes[0].vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.uniformMatrix4fv(this.shaderProgram.mvpMatrixUniform, false, mvpMatrix);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, enviromentMap);
		gl.uniform1i(this.shaderProgram.enviromentMap, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.meshes[0].vertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, model.meshes[0].vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
	init(gl) {
		var vertexShader = getShader(irradianceVert, "x-shader/x-vertex");
		var fragmentShader = getShader(irradianceFrag, "x-shader/x-fragment");
		
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
	    
	    this.shaderProgram.enviromentMap = gl.getUniformLocation(this.shaderProgram, "uEnviromentMap");
	    
	    this.shaderProgram.mvpMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVPmatrix");
	}
}