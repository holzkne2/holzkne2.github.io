function fileLoaded(data, model) {
	
	// o object_name | g group_name
	var object_pattern = /^[og]\s*(.+)?/;
	// usemtl material_name
	var material_use_pattern = /^usemtl /;
	
	var vertices = [];
	var normals = [];
	var uvs = [];
	
	var object = [];
	var objects = {};
	
	var materials = [];
	var currentMaterial = null;
	
	var lines = data.split('\n');
	for (var l = 0; l < lines.length; l++) {
		var tokens = lines[l].split(' ');
		if (tokens[0] == "" || tokens[0] == "#" || tokens[0] == "mtllib" || tokens[0] == "g") {
			continue;
		}
		if (tokens[0] == "v") {
			vertices.push(parseFloat(tokens[1]))
			vertices.push(parseFloat(tokens[2]))
			vertices.push(parseFloat(tokens[3]))
		}
		else if (tokens[0] == "vn") {
			normals.push(parseFloat(tokens[1]))
			normals.push(parseFloat(tokens[2]))
			normals.push(parseFloat(tokens[3]))
		}
		else if (tokens[0] == "vt") {
			uvs.push(parseFloat(tokens[1]))
			uvs.push(parseFloat(tokens[2]))
			uvs.push(parseFloat(tokens[3]))
		}
		else if (tokens[0] == "usemtl") {
			currentMaterial = tokens[1];
			//New Material
			if (!materials.includes(currentMaterial)) {
				materials.push(currentMaterial);
				objects[currentMaterial] = [];
			}			
		}
		else if (tokens[0] == "f") {
			objects[currentMaterial].push(tokens[1]);
			objects[currentMaterial].push(tokens[2]);
			objects[currentMaterial].push(tokens[3]);
		}
	}
	
	var subMesh = new Mesh();
	for(var m = 0; m < materials.length; m++) {
		for(var f = 0; f < objects[materials[m]].length; f++) {
			for(var i = 0; i < 3; i++) {
				var tokens = objects[materials[m]][i].split('/');
				
				subMesh.vertices.push(vertices[parseInt(tokens[0])]);
				
				if (tokens[1] != "") {
					subMesh.uvs.push(uvs[parseInt(tokens[1])]);
				}
				
				if (tokens[2] != "") {
					subMesh.normals.push(normals[parseInt(tokens[2])]);
				}
			}
		}
	}
}

function OBJLoader(meshFile, mesh) {
	
	var request = new XMLHttpRequest();
    request.open("GET", meshFile);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
        	fileLoaded(request.responseText, mesh);
        }
    }
    request.send();

}