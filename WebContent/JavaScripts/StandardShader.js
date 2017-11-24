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

var vertexColorShaderSource = `#version 300 es
	in vec3 aVertexPosition; 
	in vec3 aVertexNormal;
	
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat3 uNMatrix;
	uniform mat4 uObjectToWorld;
	
	uniform mat4 uLightMViewMatrix;
	uniform mat4 uLightProjectionMatrix;
	
	out vec3 vNormal;
	out vec3 vWorldPos;
	
	out vec2 vDepthUv;
	out vec4 vShadowPos;
	
	const mat4 texUnitConverter = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 
		0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
	
	void main(void) {
	    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	    vWorldPos = (uObjectToWorld * vec4(aVertexPosition, 1.0)).xyz;
	    
        vNormal = uNMatrix * aVertexNormal;
        
        vShadowPos = texUnitConverter * uLightProjectionMatrix *
        uLightMViewMatrix * vec4(aVertexPosition, 1.0);
	}`;

var fragmentColorShaderSource =`#version 300 es
	precision mediump float;
	out vec4 fragmentColor;

	uniform vec3 uWorldSpaceCameraPos;

	uniform vec3 uAmbientColor;
	
	uniform vec3 uLightingDirection;
	uniform vec3 uDirectionalColor;
    in vec3 vNormal;
    
    in vec3 vWorldPos;

	in vec2 vDepthUv;
	in vec4 vShadowPos;

	uniform vec3 uColor;
	
	uniform float uMetallic;
	uniform float uSmoothness;	
	
	uniform sampler2D uDepthColorTexture;

	vec2 poissonDisk[16] = vec2[]( 
   vec2( -0.94201624, -0.39906216 ), 
   vec2( 0.94558609, -0.76890725 ), 
   vec2( -0.094184101, -0.92938870 ), 
   vec2( 0.34495938, 0.29387760 ), 
   vec2( -0.91588581, 0.45771432 ), 
   vec2( -0.81544232, -0.87912464 ), 
   vec2( -0.38277543, 0.27676845 ), 
   vec2( 0.97484398, 0.75648379 ), 
   vec2( 0.44323325, -0.97511554 ), 
   vec2( 0.53742981, -0.47373420 ), 
   vec2( -0.26496911, -0.41893023 ), 
   vec2( 0.79197514, 0.19090188 ), 
   vec2( -0.24188840, 0.99706507 ), 
   vec2( -0.81409955, 0.91437590 ), 
   vec2( 0.19984126, 0.78641367 ), 
   vec2( 0.14383161, -0.14100790 ) 
);	

	float decodeFloat (vec4 color) {
	  const vec4 bitShift = vec4(
	    1.0 / (256.0 * 256.0 * 256.0),
	    1.0 / (256.0 * 256.0),
	    1.0 / 256.0,
	    1
	  );
	  return dot(color, bitShift);
	}

	float random(vec4 seed) {
		float dot_product = dot(seed, vec4(12.9898, 78.233, 45.164, 94.673));
		return fract(sin(dot_product) * 43758.5453);
	}

    void main(void) {
    	//shadow
    	float cosLight = min(max(dot(uLightingDirection, vNormal), 0.0), 1.0);
    	
    	vec3 fragmentDepth = vShadowPos.xyz;
    	float shadowAcneRemover = 0.0003 * tan(acos(cosLight));
    	shadowAcneRemover = min(max(shadowAcneRemover, 0.0), 0.015);
    	fragmentDepth.z -= shadowAcneRemover;
    	
    	float texelSize = 1.0 / 2048.0;
    	float amountInLight = 0.0;
    	
//		for(int x = -1; x <= 1; x++) {
//			for (int y = -1; y <= 1; y++) {
//				float texelDepth = decodeFloat(texture(uDepthColorTexture,
//					fragmentDepth.xy + vec2(x, y) * texelSize));
//				if (fragmentDepth.z < texelDepth) {
//					amountInLight += 1.0;
//				}
//			}
//		}
//		amountInLight /= 9.0;
//		
//		float texelDepth = decodeFloat(texture2D(uDepthColorTexture,
//			fragmentDepth.xy));
//		if (fragmentDepth.z < texelDepth) {
//			amountInLight = 1.0;
//		}
    
		for (int i = 0; i < 4; i++){
			int index = int(16.0 * random(vec4(fragmentDepth.xyy, i))) % 16;
			float texelDepth = decodeFloat(texture(uDepthColorTexture,
				fragmentDepth.xy + poissonDisk[index]/1400.0));
			if (fragmentDepth.z < texelDepth) {
				amountInLight += 0.25;
			}
		}
    
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
        
        fragmentColor = vec4(col + (uAmbientColor * albedo), 1);
        //fragmentColor = vec4(amountInLight, amountInLight, amountInLight, 1);
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