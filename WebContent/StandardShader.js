var vertexShaderSource =
	`attribute vec3 aVertexPosition; 
	attribute vec3 aVertexNormal;
	attribute vec2 aTextureCoord;
	
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat3 uNMatrix;
	
	varying vec2 vTextureCoord;
	varying vec3 vNormal;
	
	void main(void) {
	    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	    vTextureCoord = aTextureCoord;
	    
        vNormal = uNMatrix * aVertexNormal;
	}`
	;

var fragmentShaderSource =
	`precision mediump float;

	uniform vec3 uAmbientColor;
	
	uniform vec3 uLightingDirection;
	uniform vec3 uDirectionalColor;

    varying vec2 vTextureCoord;
    varying vec3 vNormal;

    uniform sampler2D uSampler;

    void main(void) {
        vec4 textureColor = texture2D(uSampler, vTextureCoord);
        
        float light = max(dot(vNormal, uLightingDirection), 0.0);
       	
       	vec3 col = textureColor.rgb * (uAmbientColor + uDirectionalColor * light);
        
        gl_FragColor = vec4(col, 1);
    }`
	;