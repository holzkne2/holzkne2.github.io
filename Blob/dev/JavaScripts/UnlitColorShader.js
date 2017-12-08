var UnlitColorVertexSource = `#version 300 es
in vec3 aVertexPosition;

uniform mat4 uMVPmatrix;

void main(void) {
	gl_Position = uMVPmatrix * vec4(aVertexPosition, 1.0);
}
`;

var UnlitColorFragmentSource = `#version 300 es
precision mediump float;

out vec4 fragmentColor;

uniform vec3 uColor;

void main(void) {
	fragmentColor = vec4(uColor, 1.0);
}
`;