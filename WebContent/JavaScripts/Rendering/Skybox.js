var skyboxVertexSoruce =`#version 300 es
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uObjectToWorld;

out vec2 vTextureCoord;
out vec3 vWorldPos;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vWorldPos = (uObjectToWorld * vec4(aVertexPosition, 1.0)).xyz;
    vTextureCoord = aTextureCoord * 4.0;
}


`;

var skyboxFragmentSource = `#version 300 es
precision mediump float;

out vec4 fragmentColor;

uniform vec3 uWorldSpaceCameraPos;
uniform sampler2D uTexture;

uniform vec3 uLightingDirection;
uniform vec3 uDirectionalColor;

in vec2 vTextureCoord;
in vec3 vWorldPos;

void main(void) {
	vec3 viewDirection = normalize(uWorldSpaceCameraPos - vWorldPos);
	vec3 lightDirection = normalize(uLightingDirection);
	vec3 lightColor = uDirectionalColor;
	
	vec3 col = texture(uTexture, vTextureCoord).rgb;
	fragmentColor = vec4(col.rgb, 1.0);
	//fragmentColor = vec4(vTextureCoord.rg, 1.0, 1.0);
}
`;

class Skybox {
	constructor() {
		this.material = new StandardMaterial();
		this.model = new Model();
		this.model.load("Assets/Models/Skybox.obj");
		
	    var texture = new Texture();
	    texture.init(gl, "Assets/Textures/Stars.jpg");
		this.material.mainTexture = texture;
	}
	
	init(gl) {
		this.model.init(gl);
		this.material.init(gl, skyboxFragmentSource, skyboxVertexSoruce);
	}
}