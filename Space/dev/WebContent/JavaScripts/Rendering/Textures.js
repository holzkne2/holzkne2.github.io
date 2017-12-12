function handleLoadedTexture(gl, texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
}

class Texture {
	constructor() {
		this.is_init = false;
		
		this.texture;
	}
	
	init(gl, file) {
		if (this.is_init) {
			return;
		}
		
		this.texture = gl.createTexture();
		this.texture.image = new Image();
		var temp = this.texture;
		
		this.texture.image.onload = function () {
	        handleLoadedTexture(gl, temp);
	    }

		this.texture.image.src = file;
		
		this.is_init = true;
	}
}

class RenderTexture {
	constructor(gl, width, height) {
		this.textureWidth = width * 2;
		this.textureHeight = height * 2;
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		{
			const level = 0;
			const internalFormat = gl.RGBA;
			const border = 0;
			const format = gl.RGBA;
			const type = gl.UNSIGNED_BYTE;
			const data = null;
			gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
					this.textureWidth, this.textureHeight, border,
					format, type, data);
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		
		this.fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
		 
		const attachmentPoint = gl.COLOR_ATTACHMENT0;
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.texture, 0);

		const depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
		
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.textureWidth, this.textureHeight);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
	}
}

class DepthTexture {
	constructor(gl, width, height) {
		
		this.textureWidth = width;
		this.textureHeight = height;
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		{
			const level = 0;
			const internalFormat = gl.RGBA;
			const border = 0;
			const format = gl.RGBA;
			const type = gl.UNSIGNED_BYTE;
			const data = null;
			gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
					this.textureWidth, this.textureHeight, border,
					format, type, data);
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		
		this.fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
		
		this.renderBuffer = gl.createRenderbuffer()
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer)
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
				width, height)
		 
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D, this.texture, 0)
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, this.renderBuffer)
		
		gl.bindTexture(gl.TEXTURE_2D, null)
		gl.bindRenderbuffer(gl.RENDERBUFFER, null)
	}
}
