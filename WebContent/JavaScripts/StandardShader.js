var vertexShaderSource = `#version 300 es
	attribute vec3 aVertexPosition; 
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

var fragmentShaderSource = `#version 300 es
	precision mediump float;

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

var vertexColorShaderSource = `
	attribute vec3 aVertexPosition; 
	attribute vec3 aVertexNormal;
	
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat3 uNMatrix;
	uniform mat4 uObjectToWorld;
	
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	
	void main(void) {
	    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	    vWorldPos = (uObjectToWorld * vec4(aVertexPosition, 1.0)).xyz;
	    
        vNormal = uNMatrix * aVertexNormal;
	}`;

var fragmentColorShaderSource =`
	precision mediump float;

	uniform vec3 uWorldSpaceCameraPos;

	uniform vec3 uAmbientColor;
	
	uniform vec3 uLightingDirection;
	uniform vec3 uDirectionalColor;
    varying vec3 vNormal;
    
    varying vec3 vWorldPos;

	uniform vec3 uColor;
	
	uniform float uMetallic;
	uniform float uSmoothness;

    void main(void) {
        vec3 viewDir = normalize(uWorldSpaceCameraPos - vWorldPos);
        vec3 halfDir = normalize(uLightingDirection + viewDir);
        
		vec3 albedo = uColor;
        vec3 specTint = albedo * uMetallic;
        float oneMinusReflectivity = 1.0 - uMetallic;
        albedo = albedo * oneMinusReflectivity;
        
        float light = max(dot(vNormal, uLightingDirection), 0.0);
		vec3 specular = specTint * uDirectionalColor * pow(dot(halfDir, vNormal), uSmoothness);
       	
       	vec3 diffuse = albedo * uDirectionalColor * light;
        
        gl_FragColor = vec4(diffuse + specular + (uAmbientColor * albedo), 1);
    }`
	;

var vertexColorUnlitShaderSource = `
	attribute vec3 aVertexPosition; 
	attribute vec3 aVertexNormal;
	
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	
	void main(void) {
	    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	}`;

var fragmentColorUnlitShaderSource = `
	precision mediump float;

	uniform vec3 uColor;

    void main(void) {        
        gl_FragColor = vec4(uColor, 1);
    }`
	;