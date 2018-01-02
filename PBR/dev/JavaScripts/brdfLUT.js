var brdfLUTvert = `#version 300 es
in vec3 aVertexPosition;
in vec2 aTextureCoord;

out vec2 vTextureCoord;

void main(void) {
	gl_Position = vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;
}
`;

var brdfLUTfrag = `#version 300 es
precision mediump float;

out vec4 fragmentColor;

in vec2 vTextureCoord;

const float PI = 3.14159265359;

// http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
// efficient VanDerCorpus calculation.
float RadicalInverse_VdC(uint bits) 
{
     bits = (bits << 16u) | (bits >> 16u);
     bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
     bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
     bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
     bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
     return float(bits) * 2.3283064365386963e-10; // / 0x100000000
}

vec2 Hammersley(uint i, uint N)
{
	return vec2(float(i)/float(N), RadicalInverse_VdC(i));
}

vec3 ImportanceSampleGGX(vec2 Xi, vec3 N, float roughness)
{
	float a = roughness*roughness;
	
	float phi = 2.0 * PI * Xi.x;
	float cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));
	float sinTheta = sqrt(1.0 - cosTheta*cosTheta);
	
	// from spherical coordinates to cartesian coordinates - halfway vector
	vec3 H;
	H.x = cos(phi) * sinTheta;
	H.y = sin(phi) * sinTheta;
	H.z = cosTheta;
	
	// from tangent-space H vector to world-space sample vector
	vec3 up          = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
	vec3 tangent   = normalize(cross(up, N));
	vec3 bitangent = cross(N, tangent);
	
	vec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;
	return normalize(sampleVec);
}

float GeometrySchlickGGX(float NdotV, float roughness)
{
    // note that we use a different k for IBL
    float a = roughness;
    float k = (a * a) / 2.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

vec2 IntegrateBRDF(float NdotV, float roughness)
{
    vec3 V;
    V.x = sqrt(1.0 - NdotV*NdotV);
    V.y = 0.0;
    V.z = NdotV;

    float A = 0.0;
    float B = 0.0; 

    vec3 N = vec3(0.0, 0.0, 1.0);
    
    const uint SAMPLE_COUNT = 1024u;
    for(uint i = 0u; i < SAMPLE_COUNT; ++i)
    {
        // generates a sample vector that's biased towards the
        // preferred alignment direction (importance sampling).
        vec2 Xi = Hammersley(i, SAMPLE_COUNT);
        vec3 H = ImportanceSampleGGX(Xi, N, roughness);
        vec3 L = normalize(2.0 * dot(V, H) * H - V);

        float NdotL = max(L.z, 0.0);
        float NdotH = max(H.z, 0.0);
        float VdotH = max(dot(V, H), 0.0);

        if(NdotL > 0.0)
        {
            float G = GeometrySmith(N, V, L, roughness);
            float G_Vis = (G * VdotH) / (NdotH * NdotV);
            float Fc = pow(1.0 - VdotH, 5.0);

            A += (1.0 - Fc) * G_Vis;
            B += Fc * G_Vis;
        }
    }
    A /= float(SAMPLE_COUNT);
    B /= float(SAMPLE_COUNT);
    return vec2(A, B);
}
    
void main() 
{
    vec2 integratedBRDF = IntegrateBRDF(vTextureCoord.x, vTextureCoord.y);
    fragmentColor = vec4(integratedBRDF, 0.0, 1.0);
}
`;

class BrdfLUT {
	generate(gl, size) {
		
		// Mesh
		{
			var vertices = [
				-1, -1, 0,
				-1, 1, 0,
				1, -1, 0,
				1, 1, 0
			];
			
			this.vertexPositionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			this.vertexPositionBuffer.itemSize = 3;
			this.vertexPositionBuffer.numItems = vertices.length / 3;
			
			var uvs = [
				0, 0,
				0, 1,
				1, 0,
				1, 1
			];
			
			this.vertexTextureCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
			this.vertexTextureCoordBuffer.itemSize = 2;
			this.vertexTextureCoordBuffer.numItems = uvs.length / 2;
		}
		
		{
			var vertexShader = getShader(brdfLUTvert, "x-shader/x-vertex");
			var fragmentShader = getShader(brdfLUTfrag, "x-shader/x-fragment");
		    
		    this.shaderProgram = gl.createProgram();
		    gl.attachShader(this.shaderProgram, vertexShader);
		    gl.attachShader(this.shaderProgram, fragmentShader);
		    gl.linkProgram(this.shaderProgram);
		    
		    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
		        alert("Could not initialise shaders");
		        return;
		    }
		    
		    gl.useProgram(this.shaderProgram);
		    
		    this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		    gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
		    
		    this.shaderProgram.textureCoordAttribute = gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
	    	gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
	    	
	    	gl.useProgram(null);
		}
		
		// Render & Setup
		{
			this.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			
			gl.texImage2D(gl.TEXTURE_2D, 0,
					gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			
			this.fb = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
			this.rb = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, this.rb);
			
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
			
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, size, size);		
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
					gl.RENDERBUFFER, this.rb);
			
			gl.viewport(0, 0, size, size);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
			// Render
			{
				gl.useProgram(this.shaderProgram);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
				gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
						this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
			    gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute,
			    		this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
			    
			    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexPositionBuffer.numItems);
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			
		}
	}
}