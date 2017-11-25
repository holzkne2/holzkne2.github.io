var simplePostVertex = `
	attribute vec3 aVertexPosition;
	attribute vec2 aTextureCoord;
	
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	
	varying vec2 vTextureCoord;
	
	void main(void) {
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
		vTextureCoord = aTextureCoord;
	}
	`;

var passthroughPostFragment = `
	precision mediump float;
	varying vec2 vTextureCoord;
	
	uniform sampler2D uSampler;
	
	void main(void) {
		vec3 col = texture2D(uSampler, vTextureCoord).rgb;
		gl_FragColor = vec4(col, 1.0);
	}
	`;