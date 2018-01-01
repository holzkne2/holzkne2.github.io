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