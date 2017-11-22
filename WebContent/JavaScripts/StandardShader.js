//var vertexShaderSource = `#version 300 es
//	attribute vec3 aVertexPosition; 
//	attribute vec3 aVertexNormal;
//	attribute vec2 aTextureCoord;
//	
//	uniform mat4 uMVMatrix;
//	uniform mat4 uPMatrix;
//	uniform mat3 uNMatrix;
//	
//	varying vec2 vTextureCoord;
//	varying vec3 vNormal;
//	
//	void main(void) {
//	    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
//	    vTextureCoord = aTextureCoord;
//	    
//        vNormal = uNMatrix * aVertexNormal;
//	}`
//	;
//
//var fragmentShaderSource = `#version 300 es
//	precision mediump float;
//
//	uniform vec3 uAmbientColor;
//	
//	uniform vec3 uLightingDirection;
//	uniform vec3 uDirectionalColor;
//
//    varying vec2 vTextureCoord;
//    varying vec3 vNormal;
//
//    uniform sampler2D uSampler;
//
//    void main(void) {
//        vec4 textureColor = texture2D(uSampler, vTextureCoord);
//        
//        float light = max(dot(vNormal, uLightingDirection), 0.0);
//       	
//       	vec3 col = textureColor.rgb * (uAmbientColor + uDirectionalColor * light);
//        
//        gl_FragColor = vec4(col, 1);
//    }`
//	;

var vertexColorShaderSource = `
	attribute vec3 aVertexPosition; 
	attribute vec3 aVertexNormal;
	
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat3 uNMatrix;
	uniform mat4 uObjectToWorld;
	
	uniform mat4 uLightMViewMatrix;
	uniform mat4 uLightProjectionMatrix;
	
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	
	varying vec2 vDepthUv;
	varying vec4 vShadowPos;
	
	const mat4 texUnitConverter = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 
		0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
	
	void main(void) {
	    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	    vWorldPos = (uObjectToWorld * vec4(aVertexPosition, 1.0)).xyz;
	    
        vNormal = uNMatrix * aVertexNormal;
        
        vShadowPos = texUnitConverter * uLightProjectionMatrix *
        uLightMViewMatrix * vec4(aVertexPosition, 1.0);
	}`;

var fragmentColorShaderSource =`
	precision mediump float;

	uniform vec3 uWorldSpaceCameraPos;

	uniform vec3 uAmbientColor;
	
	uniform vec3 uLightingDirection;
	uniform vec3 uDirectionalColor;
    varying vec3 vNormal;
    
    varying vec3 vWorldPos;

	varying vec2 vDepthUv;
	varying vec4 vShadowPos;

	uniform vec3 uColor;
	
	uniform float uMetallic;
	uniform float uSmoothness;	
	
	uniform sampler2D uDepthColorTexture;

	float decodeFloat (vec4 color) {
	  const vec4 bitShift = vec4(
	    1.0 / (256.0 * 256.0 * 256.0),
	    1.0 / (256.0 * 256.0),
	    1.0 / 256.0,
	    1
	  );
	  return dot(color, bitShift);
	}

    void main(void) {
    	//shadow
//    	float cosLight = max(dot(-uLightingDirection, vNormal), 0.0);
//    	float slopeScale = 1.0 - cosLight;
//    	float normalOffset = 0.0005 * slopeScale;
    	
    	vec3 fragmentDepth = vShadowPos.xyz;
    	float shadowAcneRemover = 0.0002;
    	fragmentDepth.z -= shadowAcneRemover;
    	
    	float texelSize = 1.0 / 4096.0;
    	float amountInLight = 0.0;
    	
		for(int x = -1; x <= 1; x++) {
			for (int y = -1; y <= 1; y++) {
				float texelDepth = decodeFloat(texture2D(uDepthColorTexture,
					fragmentDepth.xy + vec2(x, y) * texelSize));
				if (fragmentDepth.z < texelDepth) {
					amountInLight += 1.0;
				}
			}
		}
		amountInLight /= 9.0;
//		
//		float texelDepth = decodeFloat(texture2D(uDepthColorTexture,
//			fragmentDepth.xy));
//		if (fragmentDepth.z < texelDepth) {
//			amountInLight = 1.0;
//		}
    
        vec3 viewDir = normalize(uWorldSpaceCameraPos - vWorldPos);
        vec3 halfDir = normalize(uLightingDirection + viewDir);
        
		vec3 albedo = uColor;
        vec3 specTint = albedo * uMetallic;
        float oneMinusReflectivity = 1.0 - uMetallic;
        albedo = albedo * oneMinusReflectivity;
        
        float light = max(dot(vNormal, uLightingDirection), 0.0);
		vec3 specular = specTint * uDirectionalColor * pow(dot(halfDir, vNormal), uSmoothness);
       	
       	vec3 diffuse = albedo * uDirectionalColor * light;
       	vec3 col = diffuse + specular;
       	col = col * amountInLight;
        
        gl_FragColor = vec4(col + (uAmbientColor * albedo), 1);
        //gl_FragColor = vec4(amountInLight, amountInLight, amountInLight, 1);
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

var lightVertexGLSL = `
	attribute vec3 aVertexPosition;

	uniform mat4 uPMatrix;
	uniform mat4 uMVMatrix;

	void main (void) {
	  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	}`
	;
	
var lightFragmentGLSL = `
	precision mediump float;

	vec4 encodeFloat (float depth) {
	  const vec4 bitShift = vec4(
	    256 * 256 * 256,
	    256 * 256,
	    256,
	    1.0
	  );
	  const vec4 bitMask = vec4(
	    0,
	    1.0 / 256.0,
	    1.0 / 256.0,
	    1.0 / 256.0
	  );
	  vec4 comp = fract(depth * bitShift);
	  comp -= comp.xxyz * bitMask;
	  return comp;
	}

	void main (void) {
	  gl_FragColor = encodeFloat(gl_FragCoord.z);
	}`
	;