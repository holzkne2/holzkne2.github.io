class MeshRenderer {
	constructor() {
		this.model;
		this.materials = [];
	}
	
	renderShadow(gl, mvMatrix, pLightMatrix) {
		if (typeof this.model == 'undefined' || typeof this.materials.length == 0) {
			return;
		}
		
		if (!this.model.isInit()) {
			this.model.init(gl);
		}
		
		for (var i = 0; i < this.model.meshes.length; i++) {
			var matIndex = Math.min(i, this.materials.length - 1);
			gl.useProgram(this.materials[matIndex].shaderProgramShadow);
			
			gl.uniformMatrix4fv(this.materials[matIndex].shaderProgramShadow.pMatrixUniform, false, pLightMatrix);
			gl.uniformMatrix4fv(this.materials[matIndex].shaderProgramShadow.mvMatrixUniform, false, mvMatrix);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.model.meshes[i].vertexPositionBuffer);
		    gl.vertexAttribPointer(this.materials[matIndex].shaderProgramShadow.vertexPositionAttribute,
		    		this.model.meshes[i].vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		    
		    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.meshes[i].vertexIndexBuffer);
		    
		    gl.drawElements(gl.TRIANGLES, this.model.meshes[i].vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}
	
	render(gl, pMatrix, mMatrix, mvMatrix, camera, lightingDirection, shadowMaps, mvpLights, cascadeEnd) {
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
		    if (this.materials[matIndex].shaderProgram.vertexNormalAttribute != -1) {
			    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.meshes[i].vertexNormalBuffer);
			    gl.vertexAttribPointer(this.materials[matIndex].shaderProgram.vertexNormalAttribute,
			    		this.model.meshes[i].vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		    }
		    
		    // UVs
	    	if (this.materials[matIndex].shaderProgram.textureCoordAttribute != -1) {
			    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.meshes[i].vertexTextureCoordBuffer);
			    gl.vertexAttribPointer(this.materials[matIndex].shaderProgram.textureCoordAttribute,
			    		this.model.meshes[i].vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
		    }
	    	
	    	// Shadow Maps
		    gl.activeTexture(gl.TEXTURE0);
		    gl.bindTexture(gl.TEXTURE_2D, shadowMaps[0].texture);
		    //gl.uniform1i(this.materials[matIndex].shaderProgram.shadowMap[0], 0);
		    
		    gl.activeTexture(gl.TEXTURE1);
		    gl.bindTexture(gl.TEXTURE_2D, shadowMaps[1].texture);
		    //gl.uniform1i(this.materials[matIndex].shaderProgram.shadowMap[1], 0);
		    
		    gl.activeTexture(gl.TEXTURE2);
		    gl.bindTexture(gl.TEXTURE_2D, shadowMaps[2].texture);
		    //gl.uniform1i(this.materials[matIndex].shaderProgram.shadowMap[2], 0);
		    gl.uniform1iv(this.materials[matIndex].shaderProgram.shadowMaps, [0, 1, 2]);
		    
		    // Ambient Color
		   gl.uniform3f(
					this.materials[matIndex].shaderProgram.ambientColorUniform,
					0.2,
		            0.2,
		            0.2
					);
			
		   // Light Color and Direction
			var adjustedLD = vec3.create();
		    vec3.normalize(adjustedLD, lightingDirection);
		    vec3.scale(adjustedLD, adjustedLD, -1);
		    gl.uniform3fv(this.materials[matIndex].shaderProgram.lightingDirectionUniform, adjustedLD);
		    
		    gl.uniform3f(
		    		this.materials[matIndex].shaderProgram.directionalColorUniform,
		        1,
		        1,
		        0.9
		    );
		    
		    // Color
		    if (this.materials[matIndex].shaderProgram.color != null) {
		    	gl.uniform3f(this.materials[matIndex].shaderProgram.color,
		    			this.materials[matIndex].color[0],
		    			this.materials[matIndex].color[1],
		    			this.materials[matIndex].color[2]);
		    }
		    
		    // Metallic
		    if (this.materials[matIndex].shaderProgram.metallic != null) {
		    	gl.uniform1f(this.materials[matIndex].shaderProgram.metallic,
		    			this.materials[matIndex].metallic);
		    }
		    
		    // Smoothness
		    if (this.materials[matIndex].shaderProgram.smoothness != null) {
		    	gl.uniform1f(this.materials[matIndex].shaderProgram.smoothness,
		    			this.materials[matIndex].smoothness);
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
		    
		    // Light Matrix
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.lightMVP[0], false, mvpLights[0]);
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.lightMVP[1], false, mvpLights[1]);
		    gl.uniformMatrix4fv(this.materials[matIndex].shaderProgram.lightMVP[2], false, mvpLights[2]);
		    
		    // Cascade End Clip Space
		    gl.uniform1f(this.materials[matIndex].shaderProgram.cascadeEndClipSpace[0], cascadeEnd[0]);
		    gl.uniform1f(this.materials[matIndex].shaderProgram.cascadeEndClipSpace[1], cascadeEnd[1]);
		    gl.uniform1f(this.materials[matIndex].shaderProgram.cascadeEndClipSpace[2], cascadeEnd[2]);
		    
		    // Draw
		    gl.drawElements(gl.TRIANGLES, this.model.meshes[i].vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}
	
	init(gl) {
		model.init(gl);
		for (var i = 0; i < materials.length; i++) {
			material.init(gl);
		}
	}
}

