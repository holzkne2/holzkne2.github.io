class MeshRenderer {
	constructor() {
		this.model = new Model();
		this.materials = [];
	}
	
	render(gl, pMatrix, mMatrix, mvMatrix, camera, lightingDirection,
			irradianceMap) {
		if (typeof this.model == 'undefined' || typeof this.materials.length == 0) {
			return;
		}
		
		if (!this.model.isInit()) {
			this.model.init(gl);
		}
		
		for (var i = 0; i < this.model.meshes.length; i++) {
			var matIndex = Math.min(i, this.materials.length - 1);
			gl.useProgram(this.materials[matIndex].shaderProgram);
			
			// Vertex
			gl.bindBuffer(gl.ARRAY_BUFFER, this.model.meshes[i].vertexPositionBuffer);
		    gl.vertexAttribPointer(this.materials[matIndex].shaderProgram.vertexPositionAttribute,
		    		this.model.meshes[i].vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		    // Normals
		    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.meshes[i].vertexNormalBuffer);
		    gl.vertexAttribPointer(this.materials[matIndex].shaderProgram.vertexNormalAttribute,
		    		this.model.meshes[i].vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    	
	    	// Light Color and Direction
			var adjustedLD = vec3.create();
		    vec3.normalize(adjustedLD, lightingDirection);
		    vec3.scale(adjustedLD, adjustedLD, -1);
		    gl.uniform3fv(this.materials[matIndex].shaderProgram.lightingDirectionUniform, adjustedLD);
		    
		    gl.uniform3f(
		    		this.materials[matIndex].shaderProgram.directionalColorUniform,
		        1,
		        1,
		        1
		    );
		    
		    // Irradiance Map
		    gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, irradianceMap);
			gl.uniform1i(this.materials[matIndex].shaderProgram.irradianceMap, 0);
		    
		    // Color
		    if (this.materials[matIndex].shaderProgram.albedo != null) {
		    	gl.uniform3f(this.materials[matIndex].shaderProgram.albedo,
		    			this.materials[matIndex].albedo[0],
		    			this.materials[matIndex].albedo[1],
		    			this.materials[matIndex].albedo[2]);
		    }
		    
		    // Metallic
		    if (this.materials[matIndex].shaderProgram.metallic != null) {
		    	gl.uniform1f(this.materials[matIndex].shaderProgram.metallic,
		    			this.materials[matIndex].metallic);
		    }
		    
		    // Smoothness
		    if (this.materials[matIndex].shaderProgram.roughness != null) {
		    	gl.uniform1f(this.materials[matIndex].shaderProgram.roughness,
		    			this.materials[matIndex].roughness);
		    }
		    
		    // Camera World Space
		    if(this.materials[matIndex].shaderProgram.worldSpaceCameraPos != null) {
		    	gl.uniform3f(this.materials[matIndex].shaderProgram.worldSpaceCameraPos,
		    			camera.gameObject.position[0],
		    			camera.gameObject.position[1],
		    			camera.gameObject.position[2]);
		    }
		    
		    // Triangles
		    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.meshes[i].vertexIndexBuffer);
		    
		    // Matrices
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.pMatrixUniform, false, pMatrix);
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.mvMatrixUniform, false, mvMatrix);
		    
		    // Normal Matrix
		    var normalMatrix = mat3.create();
		    mat3.normalFromMat4(normalMatrix, mMatrix);
		    gl.uniformMatrix3fv(this.materials[matIndex].shaderProgram.nMatrixUniform, false, normalMatrix);
		    
		    // Object to World Matrix
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.objectToWorld, false, mMatrix);
		    
		    // Draw
		    gl.drawElements(gl.TRIANGLES, this.model.meshes[i].vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}
	
	init(gl) {
		this.model.init(gl);
		for (var i = 0; i < this.materials.length; i++) {
			this.materials[i].init(gl);
		}
	}
}

