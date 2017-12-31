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
	vec3 col = pow(texture2D(uTexture, vTextureCoord).rgb, vec3(2.2, 2.2, 2.2));
	
	vec2 uvs = vTextureCoord * (1.0 - vTextureCoord.yx);
	
	float vig = uvs.x * uvs.y * 15.0;
	vig = pow(vig, 0.5);
	
	col *= vig;
	
	float gamma = 1.0/2.2;
	col = pow(col, vec3(gamma, gamma, gamma));
	gl_FragColor = vec4(col, 1.0);
}
`;
