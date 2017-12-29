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

const int NUM_CASCADES =  3;

uniform mat4 uMVPlight[NUM_CASCADES];

out vec3 vNormal;
out vec3 vWorldPos;

out vec4 vShadowPos;

out vec4 vLightSpacePos[NUM_CASCADES];
out float vClipSpacePosZ;

const mat4 texUnitConverter = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 
	0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vWorldPos = (uObjectToWorld * vec4(aVertexPosition, 1.0)).xyz;
    
    vNormal = uNMatrix * aVertexNormal;
    
    for(int i = 0; i < NUM_CASCADES; i++) {
    	vLightSpacePos[i] = texUnitConverter * 
			uMVPlight[i] * vec4(aVertexPosition, 1.0);
    }
    vClipSpacePosZ = gl_Position.z;
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

in vec4 vShadowPos;

uniform vec3 uColor;

uniform float uMetallic;
uniform float uSmoothness;

const int NUM_CASCADES = 3;
in vec4 vLightSpacePos[NUM_CASCADES];
in float vClipSpacePosZ;

uniform sampler2D uShadowMap[NUM_CASCADES];
uniform float uCascadeEndClipSpace[NUM_CASCADES];

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

float decodeFloat (vec3 color) {
//return color.r;

  const vec3 bitShift = vec3(
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

float CalcShadowFactor(int CascadeIndex, vec4 LightSpacePos) {
	vec3 fragmentDepth = LightSpacePos.xyz / LightSpacePos.w;
	vec3 normal = normalize(vNormal);
	
	float cosLight = clamp(dot(-uLightingDirection, normal), 0.0, 1.0);
	
	float shadowAcneRemover = 0.005 * tan(acos(cosLight));
	shadowAcneRemover = clamp(shadowAcneRemover, 0.0, 0.007);
	fragmentDepth.z -= shadowAcneRemover;
	
	float amountInLight = 0.0;

	for (int i = 0; i < 4; i++){
		int index = int(16.0 * random(vec4(fragmentDepth.xyy, i))) % 16;
		float texelDepth = decodeFloat(texture(uShadowMap[CascadeIndex],
			fragmentDepth.xy + poissonDisk[index]/1400.0).rgb);
		if (fragmentDepth.z < texelDepth) {
			amountInLight += 0.25;
		}
	}
	
	return amountInLight;
}

const float PI = 3.14159265359;

vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
} 

float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a      = roughness*roughness;
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;
	
    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
	
    return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;
	
    return nom / denom;
}
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2  = GeometrySchlickGGX(NdotV, roughness);
    float ggx1  = GeometrySchlickGGX(NdotL, roughness);
	
    return ggx1 * ggx2;
}

void main(void) {
	vec3 albedo = uColor;
	float metallic = uMetallic;
	float roughness = 1.0 - uSmoothness;

	vec3 N = normalize(vNormal);

	//shadow    
	float amountInLight = 0.0;
	for (int i = 0; i < NUM_CASCADES ; i++){
		if (vClipSpacePosZ <= uCascadeEndClipSpace[i]) {
			amountInLight = CalcShadowFactor(i, vLightSpacePos[i]);
			break;
		}
	}
	if (vClipSpacePosZ > uCascadeEndClipSpace[NUM_CASCADES - 1]) {
		amountInLight = 1.0;
	}

    vec3 V = normalize(uWorldSpaceCameraPos - vWorldPos);
    
    vec3 F0 = vec3(0.04, 0.04, 0.04);
    F0 = mix(F0, albedo, metallic);
    
    vec3 L = normalize(uLightingDirection);
    vec3 H = normalize(L + V);
    
	vec3 radiance = uDirectionalColor * amountInLight;
	
	float NDF = DistributionGGX(N, H, roughness);        
    float G   = GeometrySmith(N, V, L, roughness);      
    vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);  
	
	vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallic;	  
    
    vec3 nominator    = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
    vec3 specular     = nominator / max(denominator, 0.001); 
	
    float NdotL = max(dot(N, L), 0.0);                
    vec3 Lo = (kD * albedo / PI + specular) * radiance * NdotL;
    
    vec3 ambient = uAmbientColor * albedo * 0.02;
    vec3 col = ambient + Lo;
    
    col = col / (col + vec3(1.0, 1.0, 1.0));
    float gamma = 1.0 / 1.1;
	col = pow(col, vec3(gamma, gamma, gamma));
    fragmentColor = vec4(col, 1.0);
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

	vec3 encodeFloat (float depth) {
	//return vec4(depth, depth, depth, 1);
	  const vec3 bitShift = vec3(
	    256 * 256,
	    256,
	    1.0
	  );
	  const vec3 bitMask = vec3(
	    0,
	    1.0 / 256.0,
	    1.0 / 256.0
	  );
	  vec3 comp = fract(depth * bitShift);
	  comp -= comp.xxy * bitMask;
	  return comp;
	}

	void main (void) {
	  gl_FragColor = vec4(encodeFloat(gl_FragCoord.z), 1.0);
	}`
	;