class ReflectionProbe
{
	constructor() {
		
	}
	
	render(gl) {
		var pMatrix = mat4.create();
		mat4.perspective(pMatrix, toRadians(90), 1.0, 0.1, 100.0);
		
		var captureViews = [mat4.create(),mat4.create(),mat4.create(),mat4.create(),mat4.create(),mat4.create()];
		mat4.lookAt(captureViews[0], vec3.fromValues(0, 0, 0), vec3.fromValues(1, 0, 0), vec3.fromValues(0, -1, 0));
		mat4.lookAt(captureViews[1], vec3.fromValues(0, 0, 0), vec3.fromValues(-1, 0, 0), vec3.fromValues(0, -1, 0));
		mat4.lookAt(captureViews[2], vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1));
		mat4.lookAt(captureViews[3], vec3.fromValues(0, 0, 0), vec3.fromValues(0, -1, 0), vec3.fromValues(0, 0, -1));
		mat4.lookAt(captureViews[4], vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(0, -1, 0));
		mat4.lookAt(captureViews[5], vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1), vec3.fromValues(0, -1, 0));
		
		// Render Enviroment Cube Map
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBenviroment);
		gl.viewport(0, 0, this.size, this.size);
		for (var i = 0; i < 6; i++) {
			var mvp = mat4.create();
			mat4.multiply(mvp, pMatrix, captureViews[i]);
			
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
					gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.enviromentMap, 0);
			
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
			skybox.render(gl, mvp);
		}
		
		// Render Irradiance Cube Map
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBirradiance);
		gl.viewport(0, 0, 32, 32);
		for (var i = 0; i < 6; i++) {
			var mvp = mat4.create();
			mat4.multiply(mvp, pMatrix, captureViews[i]);
			
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
					gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.irradianceMap, 0);
			
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
			this.irradianceMat.render(gl, skybox.model, mvp, this.enviromentMap);
		}
		
		// Render Prefilter Cube Map
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBprefilter);
		var maxMipLvls = 5;
		for (var mip = 0; mip < maxMipLvls; mip++) {
			var mipWidth = 128 * Math.pow(0.5, mip);
			var mipHeight = 128 * Math.pow(0.5, mip);
			
			gl.bindRenderbuffer(gl.RENDERBUFFER, this.RBprefilter);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, mipWidth, mipHeight);
			gl.viewport(0, 0, mipWidth, mipHeight);
			
			var roughness = mip / (maxMipLvls - 1);
			for (var i = 0; i < 6; i++) {
				var mvp = mat4.create();
				mat4.multiply(mvp, pMatrix, captureViews[i]);
				
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
						gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.prefilterMap, mip);
				
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				
				this.prefilterMat.render(gl, skybox.model, mvp, this.enviromentMap, roughness);
			}
		}
		
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	
	init(gl, size) {
		this.size = size;
		
		// Create Enviroment Cube Map
		this.FBenviroment = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBenviroment);
		this.RBenviroment = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.RBenviroment);
		
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);		
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, this.RBenviroment);
		
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
		
		// Create Irradiance Cube Map
		this.FBirradiance = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBirradiance);
		this.RBirradiance = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.RBirradiance);
		
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, 32, 32);		
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, this.RBirradiance);
		
		this.irradianceMap = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.irradianceMap);
		for (var i = 0; i < 6; i++) {
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0,
					gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		}
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
		
		this.irradianceMat = new IrradianceMaterial();
		this.irradianceMat.init(gl);
		
		// Create Prefilter Cube Map
		this.FBprefilter = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBprefilter);
		this.RBprefilter = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.RBprefilter);
	
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, this.RBprefilter);
		
		this.prefilterMap = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.prefilterMap);
		for (var i = 0; i < 6; i++) {
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0,
					gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		}
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		
		this.prefilterMat = new PrefilterMaterial();
		this.prefilterMat.init(gl);
		
		this.brdfLUT = new BrdfLUT();
		this.brdfLUT.generate(gl, 512);
	}
}

var GlobalProbe = new ReflectionProbe();