function fileLoaded(data, model) {
	
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
			vertices.push(0 - parseFloat(tokens[3]))
		}
		else if (tokens[0] == "vn") {
			normals.push(parseFloat(tokens[1]))
			normals.push(parseFloat(tokens[2]))
			normals.push(0 - parseFloat(tokens[3]))
		}
		else if (tokens[0] == "vt") {
			uvs.push(parseFloat(tokens[1]))
			uvs.push(parseFloat(tokens[2]))
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
	
	for(var m = 0; m < materials.length; m++) {
		var subMesh = new Mesh();
		var c = 0;
		for(var f = 0; f < objects[materials[m]].length; f++) {
			var tokens = objects[materials[m]][f].split('/');
			
			subMesh.vertices.push(vertices[(parseInt(tokens[0]) - 1) * 3]);
			subMesh.vertices.push(vertices[(parseInt(tokens[0]) - 1) * 3 + 1]);
			subMesh.vertices.push(vertices[(parseInt(tokens[0]) - 1) * 3 + 2]);
			
			if (tokens[1] != "") {
				subMesh.uvs.push(uvs[(parseInt(tokens[1]) - 1) * 2]);
				subMesh.uvs.push(uvs[(parseInt(tokens[1]) - 1) * 2 + 1]);
			} else {
				subMesh.uvs.push(0);
				subMesh.uvs.push(0);
			}
			
			if (tokens[2] != "") {
				subMesh.normals.push(normals[(parseInt(tokens[2]) - 1) * 3]);
				subMesh.normals.push(normals[(parseInt(tokens[2]) - 1) * 3 + 1]);
				subMesh.normals.push(normals[(parseInt(tokens[2]) - 1) * 3 + 2]);
				
			} else {
				subMesh.normals.push(0);
				subMesh.normals.push(0);
				subMesh.normals.push(0);
			}
			subMesh.triangles.push(c);
			c += 1;
		}
		model.meshes.push(subMesh);
	}
}

var loadingObjects = 0;

function OBJLoader(meshFile, mesh) {
	loadingObjects += 1;
	document.getElementById("loadingtext").textContent = "Loading Object(s)...";
	var request = new XMLHttpRequest();
    request.open("GET", meshFile);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
        	fileLoaded(request.responseText, mesh)
        	loadingObjects -= 1;
        	if (loadingObjects == 0) {
        		document.getElementById("loadingtext").textContent = "";
        	}
        }
    }
    request.send();

}