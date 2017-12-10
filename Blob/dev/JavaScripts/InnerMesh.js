class InnerMesh {
	constructor() {
		this.color = [0.8, 0.8, 0.8]
		
		this.material = new ColorLightMaterial();
		
		this.smoothTriangles = [
			0, 11, 5,
			0, 5, 1,
			0, 1, 7,
			0, 7, 10,
			0, 10, 11,
			
			1, 5, 9,
			5, 11, 4,
			11, 10, 2,
			10, 7, 6,
			7, 1, 8,
			
			3, 9, 4,
			3, 4, 2,
			3, 2, 6,
			3, 6, 8,
			3, 8, 9,
			
			4, 9, 5,
			2, 4, 11,
			6, 2, 10,
			8, 6, 7,
			9, 8, 1
		];
	}
	
	render_normalDepth(gl, mvpMatrix, mMatrix, mvMatrix)
	{
		gl.useProgram(this.material.NDshaderProgram);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.vertexAttribPointer(this.material.NDshaderProgram.vertexPositionAttribute,
				this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
	    gl.vertexAttribPointer(this.material.NDshaderProgram.vertexNormalAttribute,
	    		this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.uniformMatrix4fv(this.material.NDshaderProgram.mvpMatrixUniform, false, mvpMatrix);
		
		gl.uniformMatrix4fv(this.material.NDshaderProgram.mvMatrixUniform, false, mvMatrix);
		
		var normalMatrix = mat3.create();
	    mat3.normalFromMat4(normalMatrix, mMatrix);
		gl.uniformMatrix3fv(this.material.NDshaderProgram.nMatrixUniform, false, normalMatrix);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
	render(gl, mvpMatrix, mMatrix)
	{
		gl.useProgram(this.material.shaderProgram);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.vertexAttribPointer(this.material.shaderProgram.vertexPositionAttribute,
				this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
	    gl.vertexAttribPointer(this.material.shaderProgram.vertexNormalAttribute,
	    		this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.uniformMatrix4fv(this.material.shaderProgram.mvpMatrixUniform, false, mvpMatrix);
		
		var normalMatrix = mat3.create();
	    mat3.normalFromMat4(normalMatrix, mMatrix);
		gl.uniformMatrix3fv(this.material.shaderProgram.nMatrixUniform, false, normalMatrix);
		
		gl.uniform3f(this.material.shaderProgram.color, 
				this.color[0],
				this.color[1],
				this.color[2]);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
	init(gl, points)
	{
		this.material.init(gl);

		this.flatShade(points)
		
		this.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = this.vertices.length / 3;
		
		this.vertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.DYNAMIC_DRAW);
		this.vertexNormalBuffer.itemSize = 3;
		this.vertexNormalBuffer.numItems = this.normals.length / 3;
		
		this.vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.triangles), gl.STATIC_DRAW);
		this.vertexIndexBuffer.itemSize = 1;
		this.vertexIndexBuffer.numItems = this.triangles.length;
	}
	
	flatShade(points)
	{
		var scale = options.meshScale;
		
		this.vertices = [];
		this.triangles = []
		for (var t = 0; t < this.smoothTriangles.length; t+=3) {
			this.triangles.push(t);
			this.triangles.push(t+1);
			this.triangles.push(t+2);
			
			this.vertices.push(points[this.smoothTriangles[t]*3] * scale);
			this.vertices.push(points[this.smoothTriangles[t]*3+1] * scale);
			this.vertices.push(points[this.smoothTriangles[t]*3+2] * scale);
			
			this.vertices.push(points[this.smoothTriangles[t+1]*3] * scale);
			this.vertices.push(points[this.smoothTriangles[t+1]*3+1] * scale);
			this.vertices.push(points[this.smoothTriangles[t+1]*3+2] * scale);
			
			this.vertices.push(points[this.smoothTriangles[t+2]*3] * scale);
			this.vertices.push(points[this.smoothTriangles[t+2]*3+1] * scale);
			this.vertices.push(points[this.smoothTriangles[t+2]*3+2] * scale);
		}
		
		this.normalize();
	}
	
	normalize()
	{
		this.normals = [];
		for(var t = 0; t < this.triangles.length; t+=3) {
			var normal = vec3.create();
			var a = vec3.fromValues(this.vertices[this.triangles[t] * 3],
					this.vertices[this.triangles[t] * 3 + 1],
					this.vertices[this.triangles[t] * 3 + 2]);
			var b = vec3.fromValues(this.vertices[this.triangles[t+1] * 3],
					this.vertices[this.triangles[t+1] * 3 + 1],
					this.vertices[this.triangles[t+1] * 3 + 2]);
			var c = vec3.fromValues(this.vertices[this.triangles[t+2] * 3],
					this.vertices[this.triangles[t+2] * 3 + 1],
					this.vertices[this.triangles[t+2] * 3 + 2]);
			var subb = vec3.create();
			vec3.subtract(subb, b, a);
			var subc = vec3.create();
			vec3.subtract(subc, c, a);			
			vec3.cross(normal, subb, subc)
			
			vec3.normalize(normal, normal);
			
			this.normals[this.triangles[t] * 3] = normal[0];
			this.normals[this.triangles[t] * 3 + 1] = normal[1];
			this.normals[this.triangles[t] * 3 + 2] = normal[2];
			this.normals[this.triangles[t+1] * 3] = normal[0];
			this.normals[this.triangles[t+1] * 3 + 1] = normal[1];
			this.normals[this.triangles[t+1] * 3 + 2] = normal[2];
			this.normals[this.triangles[t+2] * 3] = normal[0];
			this.normals[this.triangles[t+2] * 3 + 1] = normal[1];
			this.normals[this.triangles[t+2] * 3 + 2] = normal[2];
		}
		
		
	}
	
	update(gl, points)
	{
		this.flatShade(points)
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.DYNAMIC_DRAW);
	}
}