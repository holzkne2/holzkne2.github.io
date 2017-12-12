var simplePostVertex = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;

void main(void) {
	gl_Position = vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;
}
`;

var passthroughPostFragment = `
precision mediump float;
varying vec2 vTextureCoord;

uniform sampler2D uTexture;

void main(void) {
	vec3 col = texture2D(uTexture, vTextureCoord).rgb;
	
	vec2 uvs = vTextureCoord * (1.0 - vTextureCoord.yx);
	
	float vig = uvs.x * uvs.y * 15.0;
	vig = pow(vig, 0.5);
	
	col *= vig;
	
	float gamma = 1.0/2.2;
	col = pow(col, vec3(gamma, gamma, gamma));
	gl_FragColor = vec4(col, 1.0);
}
`;

var ssaoPostVertex = `#version 300 es
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform float uAspectRatio;
uniform float uTanHalfFOV;

out vec2 vTextureCoord;
out vec2 vViewRay;

void main(void) {
	gl_Position = vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;
	vViewRay.x = aVertexPosition.x * uAspectRatio * uTanHalfFOV;
	vViewRay.y = aVertexPosition.y * uTanHalfFOV;
}

`;

var ssaoPostFragment = `#version 300 es
precision highp float;
in vec2 vTextureCoord;
in vec2 vViewRay;

out vec4 fragmentColor;

uniform sampler2D uNormalDepthMap;
uniform mat4 uPmatrix;

const int MAX_KERNEL_SIZE = 64;
uniform vec3 uKernel[MAX_KERNEL_SIZE];

float CalcViewZ(vec2 Coords) {
	float Depth = texture(uNormalDepthMap, Coords).z;
	float ViewZ = uPmatrix[3][2] / (2.0 * Depth - 1.0 - uPmatrix[2][2]);
	return ViewZ;
}

void main(void) {
	vec3 pos = texture(uNormalDepthMap, vTextureCoord).xyz;
	
	float AO = 0.0;
	
	for (int i = 0; i < 1; i++) {
		vec3 samplePos = pos + uKernel[i];
		vec4 offset = vec4(samplePos, 1.0);
		offset = offset;
		offset.xy = offset.xy / offset.w;
		offset.xy = offset.xy * 0.5 + vec2(0.5);
		
		float sampleDepth = texture(uNormalDepthMap, offset.xy).z;
		
		if (abs(pos.z - sampleDepth) < 0.1) {
			AO += step(sampleDepth, samplePos.z);
		}
	}
	
	AO = 1.0 - AO / 64.0;
	
	fragmentColor = vec4(pow(AO, 2.0));
	fragmentColor.xyz = (vec4(pos, 1.0)).xyw;
}
`;