var PBRvert = `#version 300 es
in vec3 aVertexPosition;
in vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform mat4 uObjectToWorld;

out vec3 vNormal;
out vec3 vWorldPos;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	vWorldPos = (uObjectToWorld * vec4(aVertexPosition, 1.0)).xyz;
    
    vNormal = uNMatrix * aVertexNormal;
}
`;

var PBRfrag = `#version 300 es
precision mediump float;
out vec4 fragmentColor;

uniform vec3 uWorldSpaceCameraPos;

uniform vec3 uLightingDirection;
uniform vec3 uDirectionalColor;

in vec3 vNormal;
in vec3 vWorldPos;

// IBL
uniform samplerCube uIrradianceMap;
uniform samplerCube uPrefilterMap;
uniform sampler2D uBrdfLUT;

uniform vec3 uAlbedo;

uniform float uMetallic;
uniform float uRoughness;

const float PI = 3.14159265359;

vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness)
{
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
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
	vec3 albedo = uAlbedo;
	float metallic = uMetallic;
	float roughness = uRoughness;

	vec3 N = normalize(vNormal);
	vec3 V = normalize(uWorldSpaceCameraPos - vWorldPos);
	vec3 R = reflect(-V, N);
	
	vec3 F0 = vec3(0.04, 0.04, 0.04);
    F0 = mix(F0, albedo, metallic);
    
    //-------------
    vec3 L = normalize(uLightingDirection);
    vec3 H = normalize(L + V);
    
    vec3 radiance = uDirectionalColor;
    
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
    //-------------
    
    F = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, roughness);;
    
    kS = F;
    kD = 1.0 - kS;
    kD *= 1.0 - metallic;
    vec3 irradiance = texture(uIrradianceMap, N).rgb;
    vec3 diffuse = irradiance * albedo;
    
    const float MAX_REFLECTION_LOD = 4.0;
    vec3 prefilteredColor = textureLod(uPrefilterMap, R, roughness * MAX_REFLECTION_LOD).rgb;
    vec2 brdf  = texture(uBrdfLUT, vec2(max(dot(N, V), 0.0), roughness)).rg;
    specular = prefilteredColor * (F * brdf.x + brdf.y);
    
    vec3 ambient = kD * diffuse + specular;
    
    vec3 col = ambient + Lo;
    
    col = col / (col + vec3(1.0, 1.0, 1.0));
    float gamma = 1.0/2.2;
	col = pow(col, vec3(gamma, gamma, gamma));
    
    fragmentColor = vec4(col, 1.0);
}
`;