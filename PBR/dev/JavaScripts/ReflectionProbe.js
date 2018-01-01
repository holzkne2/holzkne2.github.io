class ReflectionProbe
{
	constructor() {
		
	}
	
	render(gl) {
		var pMatrix = mat4.create();
		mat4.perspective(pMatrix, toRadians(90), 1.0, 0.1, 100.0);
	}
	
	init(gl, size) {
		this.captureFBO = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.captureFBO);
		this.caputreRBO = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.caputreRBO);
		
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);		
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, this.caputreRBO);
		
		this.enviromentMap = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.enviromentMap);
		for (var i = 0; i < 6; i++) {
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0,
					gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		}
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	}
}

var GlobalProbe = new ReflectionProbe();