var ColorVertexSource = `#version 300 es
in vec3 aVertexPosition;
in vec3 aVertexNormal;

uniform mat4 uMVPmatrix;
uniform mat3 uNmatrix;

out vec3 vNormal;

void main(void) {
	gl_Position = uMVPmatrix * vec4(aVertexPosition, 1.0);
	vNormal = uNmatrix * aVertexNormal;
}
`;

var ColorFragmentSource = `#version 300 es
precision mediump float;

in vec3 vNormal;

out vec4 fragmentColor;

uniform vec3 uColor;

float remap(float value, float low1, float high1, float low2, float high2) {
	return (value - low1) * (high2 - low2) / (high1 - low1) + low2;
}

void main(void) {
	float diffuse = remap(dot(vNormal, normalize(vec3(0.05, 0.9, 0.2))), -1.0, 1.0, 0.05, 1.0);
	
	vec3 col = uColor * diffuse;
	fragmentColor = vec4(col, 1.0);
}
`;

var DepthNormalVertexSource = `#version 300 es
in vec3 aVertexPosition;
in vec3 aVertexNormal;

uniform mat4 uMVPmatrix;
uniform mat4 uMVmatrix;
uniform mat3 uNmatrix;

out vec3 vNormal;
out float vViewDepth;

void main(void) {
	gl_Position = uMVPmatrix * vec4(aVertexPosition, 1.0);
	vNormal = uNmatrix * aVertexNormal;
	vViewDepth = (uMVmatrix * vec4(aVertexPosition, 1.0)).z;
}
`;

var DepthNormalFragmentSource = `#version 300 es
precision mediump float;

in vec3 vNormal;
in float vViewDepth;

out vec4 fragmentColor;

void main(void) {
	fragmentColor = vec4(vNormal, vViewDepth);
}
`;