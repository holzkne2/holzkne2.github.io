var simplePostVertex=`attribute vec3 aVertexPosition;attribute vec2 aTextureCoord;varying vec2 vTextureCoord;void main(void) {gl_Position = vec4(aVertexPosition, 1.0);vTextureCoord = aTextureCoord;}`;var passthroughPostFragment=`precision mediump float;varying vec2 vTextureCoord;uniform sampler2D uTexture;void main(void) {vec3 col = texture2D(uTexture, vTextureCoord).rgb;vec2 uvs = vTextureCoord * (1.0 - vTextureCoord.yx);float vig = uvs.x * uvs.y * 15.0;vig = pow(vig, 0.5);col *= vig;float gamma = 1.0/2.2;col = pow(col, vec3(gamma, gamma, gamma));gl_FragColor = vec4(col, 1.0);}`;var UnlitColorVertexSource=`#version 300 es
in vec3 aVertexPosition;uniform mat4 uMVPmatrix;void main(void) {gl_Position = uMVPmatrix * vec4(aVertexPosition, 1.0);}`;var UnlitColorFragmentSource=`#version 300 es
precision mediump float;out vec4 fragmentColor;uniform vec3 uColor;void main(void) {vec3 col = uColor;fragmentColor = vec4(uColor, 1.0);}`;function getShader(source,id){var shader;if(id=="x-shader/x-fragment"){shader=gl.createShader(gl.FRAGMENT_SHADER)}else if(id=="x-shader/x-vertex"){shader=gl.createShader(gl.VERTEX_SHADER)}else{return null}
gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){alert(gl.getShaderInfoLog(shader));return null}
return shader}
class UnlitColorMaterial{constructor(){this.is_init=!1;this.shaderProgram}
init(gl){if(this.is_init){return}
var fragmentShader=getShader(UnlitColorFragmentSource,"x-shader/x-fragment");var vertexShader=getShader(UnlitColorVertexSource,"x-shader/x-vertex");this.shaderProgram=gl.createProgram();gl.attachShader(this.shaderProgram,vertexShader);gl.attachShader(this.shaderProgram,fragmentShader);gl.linkProgram(this.shaderProgram);if(!gl.getProgramParameter(this.shaderProgram,gl.LINK_STATUS)){alert("Could not initialise shaders");return}
gl.useProgram(this.shaderProgram);this.shaderProgram.vertexPositionAttribute=gl.getAttribLocation(this.shaderProgram,"aVertexPosition");gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);this.shaderProgram.color=gl.getUniformLocation(this.shaderProgram,"uColor");this.shaderProgram.mvpMatrixUniform=gl.getUniformLocation(this.shaderProgram,"uMVPmatrix");gl.useProgram(null);this.is_init=!0}}
var ColorVertexSource=`#version 300 es
in vec3 aVertexPosition;
in vec3 aVertexNormal;

uniform mat4 uMVPmatrix;
uniform mat3 uNmatrix;

out vec3 vNormal;

void main(void) {
	gl_Position = uMVPmatrix * vec4(aVertexPosition, 1.0);
	vNormal = uNmatrix * aVertexNormal;
}
`;var ColorFragmentSource=`#version 300 es
precision mediump float;

in vec3 vNormal;

out vec4 fragmentColor;

uniform vec3 uColor;

float remap(float value, float low1, float high1, float low2, float high2) {
	return (value - low1) * (high2 - low2) / (high1 - low1) + low2;
}

void main(void) {
	float diffuse = remap(dot(vNormal, normalize(vec3(0.05, 0.9, 0.2))), -1.0, 1.0, 0.05, 1.0);
	
	vec3 col = uColor * diffuse;
	fragmentColor = vec4(col, 1.0);
}
`;function getShader(source,id){var shader;if(id=="x-shader/x-fragment"){shader=gl.createShader(gl.FRAGMENT_SHADER)}else if(id=="x-shader/x-vertex"){shader=gl.createShader(gl.VERTEX_SHADER)}else{return null}
gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){alert(gl.getShaderInfoLog(shader));return null}
return shader}
class ColorLightMaterial{constructor(){this.is_init=!1;this.shaderProgram}
init(gl){if(this.is_init){return}
var fragmentShader=getShader(ColorFragmentSource,"x-shader/x-fragment");var vertexShader=getShader(ColorVertexSource,"x-shader/x-vertex");this.shaderProgram=gl.createProgram();gl.attachShader(this.shaderProgram,vertexShader);gl.attachShader(this.shaderProgram,fragmentShader);gl.linkProgram(this.shaderProgram);if(!gl.getProgramParameter(this.shaderProgram,gl.LINK_STATUS)){alert("Could not initialise shaders");return}
gl.useProgram(this.shaderProgram);this.shaderProgram.vertexPositionAttribute=gl.getAttribLocation(this.shaderProgram,"aVertexPosition");gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);this.shaderProgram.vertexNormalAttribute=gl.getAttribLocation(this.shaderProgram,"aVertexNormal");gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);this.shaderProgram.nMatrixUniform=gl.getUniformLocation(this.shaderProgram,"uNmatrix");this.shaderProgram.color=gl.getUniformLocation(this.shaderProgram,"uColor");this.shaderProgram.mvpMatrixUniform=gl.getUniformLocation(this.shaderProgram,"uMVPmatrix");gl.useProgram(null);this.is_init=!0}}
class Options{constructor(){this.show=!1;this.dots=!0;this.lines=!0;this.mesh=!0;this.meshScale=0.9}
update(){var div=document.getElementById("Options");if(this.show)
div.style.display='block';else div.style.display='none';this.dots=document.getElementById("dots").checked;this.lines=document.getElementById("lines").checked;this.mesh=document.getElementById("mesh").checked;this.meshScale=document.getElementById("meshScale").value}}
var options=new Options();class Timer{constructor(){this.time=new Date().getTime();this.deltaTimer=0;this.fpsBuffer=[];this.fpsMax=60}
update(){var now=new Date().getTime();this.deltaTime=now-this.time;this.time=now;var fps=1.0/(this.deltaTime/1000.0);this.fpsBuffer.push(fps);if(this.fpsBuffer.length>this.fpsMax){this.fpsBuffer.shift()}
var sum=0;for(var i=0;i<this.fpsBuffer.length;i++){sum+=this.fpsBuffer[i]}
sum/=this.fpsBuffer.length;if(showFPS){document.getElementById("FPS_Counter").textContent="FPS: "+Math.round(sum)}else{document.getElementById("FPS_Counter").textContent=""}}}
var timer=new Timer();class Dots{constructor(){this.is_init=!1}
init(gl,radius){if(this.is_init){return}
this.sphere(radius);this.vertexPositionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.vertices),gl.STATIC_DRAW);this.vertexPositionBuffer.itemSize=3;this.vertexPositionBuffer.numItems=this.vertices.length/3;this.vertexIndexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.vertexIndexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.triangles),gl.STATIC_DRAW);this.vertexIndexBuffer.itemSize=1;this.vertexIndexBuffer.numItems=this.triangles.length;this.is_init=!0}
sphere(radius){var latBands=20;var longBands=20;this.vertices=[];for(var lat=0;lat<=latBands;lat++){var theta=lat*Math.PI/latBands;var sinTheta=Math.sin(theta);var cosTheta=Math.cos(theta);for(var long=0;long<=longBands;long++){var phi=long*2*Math.PI/longBands;var sinPhi=Math.sin(phi);var cosPhi=Math.cos(phi);var x=cosPhi*sinTheta;var y=cosTheta;var z=sinPhi*sinTheta;this.vertices.push(radius*x);this.vertices.push(radius*y);this.vertices.push(radius*z)}}
this.triangles=[];for(var lat=0;lat<latBands;lat++){for(var long=0;long<longBands;long++){var first=(lat*(longBands+1))+long;var second=first+longBands+1;this.triangles.push(first);this.triangles.push(second);this.triangles.push(first+1);this.triangles.push(second);this.triangles.push(second+1);this.triangles.push(first+1)}}}}
class InnerMesh{constructor(){this.color=[0.8,0.8,0.8]
this.material=new ColorLightMaterial();this.smoothTriangles=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1]}
render(gl,mvpMatrix,mMatrix)
{gl.useProgram(this.material.shaderProgram);gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);gl.vertexAttribPointer(this.material.shaderProgram.vertexPositionAttribute,this.vertexPositionBuffer.itemSize,gl.FLOAT,!1,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);gl.vertexAttribPointer(this.material.shaderProgram.vertexNormalAttribute,this.vertexNormalBuffer.itemSize,gl.FLOAT,!1,0,0);gl.uniformMatrix4fv(this.material.shaderProgram.mvpMatrixUniform,!1,mvpMatrix);var normalMatrix=mat3.create();mat3.normalFromMat4(normalMatrix,mMatrix);gl.uniformMatrix3fv(this.material.shaderProgram.nMatrixUniform,!1,normalMatrix);gl.uniform3f(this.material.shaderProgram.color,this.color[0],this.color[1],this.color[2]);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.vertexIndexBuffer);gl.drawElements(gl.TRIANGLES,this.vertexIndexBuffer.numItems,gl.UNSIGNED_SHORT,0)}
init(gl,points)
{this.material.init(gl);this.flatShade(points)
this.vertexPositionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.vertices),gl.DYNAMIC_DRAW);this.vertexPositionBuffer.itemSize=3;this.vertexPositionBuffer.numItems=this.vertices.length/3;this.vertexNormalBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.normals),gl.DYNAMIC_DRAW);this.vertexNormalBuffer.itemSize=3;this.vertexNormalBuffer.numItems=this.normals.length/3;this.vertexIndexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.vertexIndexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.triangles),gl.STATIC_DRAW);this.vertexIndexBuffer.itemSize=1;this.vertexIndexBuffer.numItems=this.triangles.length}
flatShade(points)
{var scale=options.meshScale;this.vertices=[];this.triangles=[]
for(var t=0;t<this.smoothTriangles.length;t+=3){this.triangles.push(t);this.triangles.push(t+1);this.triangles.push(t+2);this.vertices.push(points[this.smoothTriangles[t]*3]*scale);this.vertices.push(points[this.smoothTriangles[t]*3+1]*scale);this.vertices.push(points[this.smoothTriangles[t]*3+2]*scale);this.vertices.push(points[this.smoothTriangles[t+1]*3]*scale);this.vertices.push(points[this.smoothTriangles[t+1]*3+1]*scale);this.vertices.push(points[this.smoothTriangles[t+1]*3+2]*scale);this.vertices.push(points[this.smoothTriangles[t+2]*3]*scale);this.vertices.push(points[this.smoothTriangles[t+2]*3+1]*scale);this.vertices.push(points[this.smoothTriangles[t+2]*3+2]*scale)}
this.normalize()}
normalize()
{this.normals=[];for(var t=0;t<this.triangles.length;t+=3){var normal=vec3.create();var a=vec3.fromValues(this.vertices[this.triangles[t]*3],this.vertices[this.triangles[t]*3+1],this.vertices[this.triangles[t]*3+2]);var b=vec3.fromValues(this.vertices[this.triangles[t+1]*3],this.vertices[this.triangles[t+1]*3+1],this.vertices[this.triangles[t+1]*3+2]);var c=vec3.fromValues(this.vertices[this.triangles[t+2]*3],this.vertices[this.triangles[t+2]*3+1],this.vertices[this.triangles[t+2]*3+2]);var subb=vec3.create();vec3.subtract(subb,b,a);var subc=vec3.create();vec3.subtract(subc,c,a);vec3.cross(normal,subb,subc)
vec3.normalize(normal,normal);this.normals[this.triangles[t]*3]=normal[0];this.normals[this.triangles[t]*3+1]=normal[1];this.normals[this.triangles[t]*3+2]=normal[2];this.normals[this.triangles[t+1]*3]=normal[0];this.normals[this.triangles[t+1]*3+1]=normal[1];this.normals[this.triangles[t+1]*3+2]=normal[2];this.normals[this.triangles[t+2]*3]=normal[0];this.normals[this.triangles[t+2]*3+1]=normal[1];this.normals[this.triangles[t+2]*3+2]=normal[2]}}
update(gl,points)
{this.flatShade(points)
gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.vertices),gl.DYNAMIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.normals),gl.DYNAMIC_DRAW)}}
function lerpvec3(x,y,t){var a=vec3.create();vec3.scale(a,x,(1.0-t));var b=vec3.create();vec3.scale(b,y,t);var c=vec3.create();vec3.add(c,a,b)
return c}
function remap(value,low1,high1,low2,high2){return(value-low1)*(high2-low2)/(high1-low1)+low2}
class MoveData{constructor(origin,radius,speed){this.origin=origin;this.radius=radius;this.a=vec3.create();this.b=vec3.create();this.speed=speed;this.progress=1}
newB(){this.progress=0;var vector=vec3.create();vec3.random(vector,1);var posE=vec3.create();vec3.scale(posE,vector,this.radius);var copy=vec3.fromValues(this.b[0],this.b[1],this.b[2]);this.a=copy;vec3.add(this.b,posE,this.origin)}}
class Lines{constructor(){this.count;this.color=[0,0,0]
this.innerMesh=new InnerMesh();this.points=[];this.moveData=[];this.material=new UnlitColorMaterial();this.dots=new Dots()}
renderLines(gl,mvpMatrix){gl.useProgram(this.material.shaderProgram);gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);gl.vertexAttribPointer(this.material.shaderProgram.vertexPositionAttribute,this.vertexPositionBuffer.itemSize,gl.FLOAT,!1,0,0);gl.uniformMatrix4fv(this.material.shaderProgram.mvpMatrixUniform,!1,mvpMatrix);gl.uniform3f(this.material.shaderProgram.color,this.color[0],this.color[1],this.color[2]);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.vertexIndexBuffer);gl.drawElements(gl.LINES,this.vertexIndexBuffer.numItems,gl.UNSIGNED_SHORT,0)}
renderDots(gl,vpMatrix){gl.useProgram(this.material.shaderProgram);for(var i=0;i<this.count;i++){gl.bindBuffer(gl.ARRAY_BUFFER,this.dots.vertexPositionBuffer);gl.vertexAttribPointer(this.material.shaderProgram.vertexPositionAttribute,this.dots.vertexPositionBuffer.itemSize,gl.FLOAT,!1,0,0);var mMatrix=mat4.create();mat4.fromTranslation(mMatrix,vec3.fromValues(this.points[i*3],this.points[i*3+1],this.points[i*3+2]));var mvpMatrix=mat4.create();mat4.multiply(mvpMatrix,vpMatrix,mMatrix);gl.uniformMatrix4fv(this.material.shaderProgram.mvpMatrixUniform,!1,mvpMatrix);gl.uniform3f(this.material.shaderProgram.color,this.color[0],this.color[1],this.color[2]);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.dots.vertexIndexBuffer);gl.drawElements(gl.TRIANGLES,this.dots.vertexIndexBuffer.numItems,gl.UNSIGNED_SHORT,0)}}
init(gl){this.material.init(gl);this.dots.init(gl,0.05);this.count=0;var radius=2.5;var t=(1.0+Math.sqrt(5))/2.0;this.points=[-1,t,0,1,t,0,-1,-t,0,1,-t,0,0,-1,t,0,1,t,0,-1,-t,0,1,-t,t,0,-1,t,0,1,-t,0,-1,-t,0,1];this.count=this.points.length/3;this.innerMesh.init(gl,this.points);for(var i=0;i<this.points.length;i++){this.points[i]*=radius}
this.triangles=[0,11,11,5,5,0,0,5,5,1,1,0,0,1,1,7,7,0,0,7,7,10,10,0,0,10,10,11,11,0,1,5,5,9,9,1,5,11,11,4,4,5,11,10,10,2,2,11,10,7,7,6,6,10,7,1,1,8,8,7,3,9,9,4,4,3,3,4,4,2,2,3,3,2,2,6,6,3,3,6,6,8,8,3,3,8,8,9,9,3];var moveRadius=vec3.distance(vec3.fromValues(this.points[0],this.points[1],this.points[2]),vec3.fromValues(this.points[3],this.points[4],this.points[5]));moveRadius/=2;this.moveData=[];for(var i=0;i<this.count;i++){var data=new MoveData(vec3.fromValues(this.points[i*3],this.points[i*3+1],this.points[i*3+2]),moveRadius,remap(Math.random(),0,1,0.2,0.3));this.moveData.push(data)}
this.vertexPositionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.points),gl.DYNAMIC_DRAW);this.vertexPositionBuffer.itemSize=3;this.vertexPositionBuffer.numItems=this.points.length/3;this.vertexIndexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.vertexIndexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.triangles),gl.STATIC_DRAW);this.vertexIndexBuffer.itemSize=1;this.vertexIndexBuffer.numItems=this.triangles.length}
update(gl){var deltaTime=(timer.deltaTime/1000);if(deltaTime>1.0/23.0){return}
for(var i=0;i<this.count;i++){var data=this.moveData[i];var pos=lerpvec3(data.a,data.b,data.progress);data.progress+=data.speed*deltaTime;if(data.progress>=1){data.newB()}
this.points[i*3]=pos[0];this.points[i*3+1]=pos[1];this.points[i*3+2]=pos[2]}
gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.points),gl.DYNAMIC_DRAW);this.innerMesh.update(gl,this.points)}}
var skyboxVertexSoruce=`#version 300 es
in vec3 aVertexPosition;
uniform mat4 uMVPmatrix;uniform mat4 uObjectToWorld;out vec3 vWorldPos;void main(void) {gl_Position = uMVPmatrix * vec4(aVertexPosition, 1.0);vWorldPos = (uObjectToWorld * vec4(aVertexPosition, 1.0)).xyz;}`;var skyboxFragmentSource=`#version 300 es
precision mediump float;out vec4 fragmentColor;uniform vec3 uTopColor;uniform vec3 uBottomColor;in vec3 vWorldPos;float remap(float value, float low1, float high1, float low2, float high2) {return (value - low1) * (high2 - low2) / (high1 - low1) + low2;}vec3 lerp (vec3 a, vec3 b, float t) {return a * (1.0 - t) + b * (t);}void main(void) {vec3 viewDirection = normalize(vec3(0.0, 0.0, 0.0) - vWorldPos);float y = remap(viewDirection.y, -0.3, 0.3, 0.0, 1.0);vec3 col = lerp(uTopColor, uBottomColor, y);col[0] = clamp(col[0], 0.0, 1.0);col[1] = clamp(col[1], 0.0, 1.0);col[2] = clamp(col[2], 0.0, 1.0);fragmentColor = vec4(col, 1.0);}`;class Skybox{constructor(){this.dots=new Dots();this.topColor=[0.95,0.95,0.95];this.bottomColor=[0.95,0.95,0.95]}
render(gl,mvpMatrix,camera){gl.useProgram(this.shaderProgram);gl.bindBuffer(gl.ARRAY_BUFFER,this.dots.vertexPositionBuffer);gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,this.dots.vertexPositionBuffer.itemSize,gl.FLOAT,!1,0,0);gl.uniformMatrix4fv(this.shaderProgram.mvpMatrixUniform,!1,mvpMatrix);gl.uniform3f(this.shaderProgram.topColor,this.topColor[0],this.topColor[1],this.topColor[2]);gl.uniform3f(this.shaderProgram.bottomColor,this.bottomColor[0],this.bottomColor[1],this.bottomColor[2]);gl.uniformMatrix4fv(this.shaderProgram.objectToWorld,!1,mat4.create());gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.dots.vertexIndexBuffer);gl.drawElements(gl.TRIANGLES,this.dots.vertexIndexBuffer.numItems,gl.UNSIGNED_SHORT,0)}
init(gl){this.dots.init(gl,1000)
var fragmentShader=getShader(skyboxFragmentSource,"x-shader/x-fragment");var vertexShader=getShader(skyboxVertexSoruce,"x-shader/x-vertex");this.shaderProgram=gl.createProgram();gl.attachShader(this.shaderProgram,vertexShader);gl.attachShader(this.shaderProgram,fragmentShader);gl.linkProgram(this.shaderProgram);if(!gl.getProgramParameter(this.shaderProgram,gl.LINK_STATUS)){alert("Could not initialise shaders");return}
gl.useProgram(this.shaderProgram);this.shaderProgram.vertexPositionAttribute=gl.getAttribLocation(this.shaderProgram,"aVertexPosition");gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);this.shaderProgram.mvpMatrixUniform=gl.getUniformLocation(this.shaderProgram,"uMVPmatrix");this.shaderProgram.topColor=gl.getUniformLocation(this.shaderProgram,"uTopColor");this.shaderProgram.bottomColor=gl.getUniformLocation(this.shaderProgram,"uBottomColor");this.shaderProgram.objectToWorld=gl.getUniformLocation(this.shaderProgram,"uObjectToWorld");this.shaderProgram.worldSpaceCameraPos=gl.getUniformLocation(this.shaderProgram,"uWorldSpaceCameraPos")}}
function handleMouseDown(event){inputManager.mouseDown=!0;inputManager.lastMouseX=event.clientX;inputManager.lastMouseY=event.clientY}
function handleMouseUp(event){inputManager.mouseDown=!1}
function handleMouseMove(event){var newX=event.clientX;var newY=event.clientY;inputManager.deltaX=newX-inputManager.lastMouseX;var around=vec3.create();inputManager.deltaY=newY-inputManager.lastMouseY;inputManager.lastMouseX=newX;inputManager.lastMouseY=newY}
function handleKeyDown(event){inputManager.currentlyPressedKeys[event.keyCode]=!0;if(inputManager.currentlyPressedKeys[70]===!0){showFPS=!showFPS}
if(inputManager.currentlyPressedKeys[79]===!0){options.show=!options.show}}
function handleKeyUp(event){inputManager.currentlyPressedKeys[event.keyCode]=!1}
function handleKeys(){}
function handleMouseWheel(event){inputManager.deltaWheel=Math.max(-1,Math.min(1,(event.wheelDelta||-event.detail)))}
class InputManager{constructor(){this.currentlyPressedKeys={};this.mouseDown=!1;this.lastMouseX=null;this.lastMouseY=null;this.deltaX=0;this.deltaY=0;this.deltaWheel=0}
clear(){this.deltaX=0;this.deltaY=0;this.deltaWheel=0}}
var inputManager=new InputManager();function clamp(num,min,max){return Math.min(Math.max(num,min),max)};function toRadians(deg){return deg*Math.PI/180}
class Camera{constructor(){this.fov=45;this.near=0.1;this.far=100;this.target=vec3.fromValues(0,0,0);this.distance=20;this.xSpeed=1;this.ySpeed=10;this.yMinLimit=-20;this.yMaxLimit=80;this.distanceMin=6;this.distanceMax=25;this.x=0;this.y=0}
perspective(aspect,matrix){mat4.perspective(matrix,toRadians(this.fov),aspect,this.near,this.far)}
skyboxPerspective(aspect,matrix){mat4.perspective(matrix,toRadians(this.fov),aspect,700,2000)}
viewMatrix(){var view=this.gameObject.WorldMatrix();return mat4.invert(view,view)}
update(){this.distance=clamp(this.distance-inputManager.deltaWheel*0.5,this.distanceMin,this.distanceMax);if(inputManager.mouseDown)
{this.x-=inputManager.deltaX*this.xSpeed*this.distance*0.01;this.y-=inputManager.deltaY*this.ySpeed*0.02}
var rotation=quat.create();quat.fromEuler(rotation,this.y,this.x,0);var position=vec3.create();vec3.transformQuat(position,vec3.fromValues(0,0,this.distance),rotation);vec3.add(position,position,this.target);this.gameObject.rotation=rotation;this.gameObject.position=position}}
class GameObject{constructor(name){this.position=vec3.fromValues(0,0,0);this.rotation=quat.fromValues(0,0,0,1);this.scale=vec3.fromValues(1,1,1);this.name=name;this.positionLast;this.rotationLast;this.scaleLast;this.worldMatrix}
WorldMatrix(){if(this.positionLast!==this.postion||this.rotationLast!==this.rotation||this.scaleLast!==this.scale){this.worldMatrix=mat4.create();mat4.fromRotationTranslationScale(this.worldMatrix,this.rotation,this.position,this.scale);this.positionLast=this.postion;this.rotationLast=this.rotation;this.scaleLast=this.scale}
return this.worldMatrix}}
class RenderTexture{constructor(gl,width,height){this.textureWidth=width;this.textureHeight=height;this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);{const level=0;const internalFormat=gl.RGBA;const border=0;const format=gl.RGBA;const type=gl.UNSIGNED_BYTE;const data=null;gl.texImage2D(gl.TEXTURE_2D,level,internalFormat,this.textureWidth,this.textureHeight,border,format,type,data);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}
this.fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.fb);const attachmentPoint=gl.COLOR_ATTACHMENT0;gl.framebufferTexture2D(gl.FRAMEBUFFER,attachmentPoint,gl.TEXTURE_2D,this.texture,0);const depthBuffer=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,depthBuffer);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,this.textureWidth,this.textureHeight);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depthBuffer)}}
class Screen{constructor(){this.is_init=!1}
render(gl,texture){gl.useProgram(this.shaderProgram);gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,this.vertexPositionBuffer.itemSize,gl.FLOAT,!1,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTextureCoordBuffer);gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute,this.vertexTextureCoordBuffer.itemSize,gl.FLOAT,!1,0,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(this.shaderProgram.texture,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,this.vertexPositionBuffer.numItems)}
init(gl){if(this.is_init){return}
{var vertices=[-1,-1,0,-1,1,0,1,-1,0,1,1,0];this.vertexPositionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);this.vertexPositionBuffer.itemSize=3;this.vertexPositionBuffer.numItems=vertices.length/3;var uvs=[0,0,0,1,1,0,1,1];this.vertexTextureCoordBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTextureCoordBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(uvs),gl.STATIC_DRAW);this.vertexTextureCoordBuffer.itemSize=2;this.vertexTextureCoordBuffer.numItems=uvs.length/2}
{var fragmentShader=getShader(passthroughPostFragment,"x-shader/x-fragment");var vertexShader=getShader(simplePostVertex,"x-shader/x-vertex");this.shaderProgram=gl.createProgram();gl.attachShader(this.shaderProgram,vertexShader);gl.attachShader(this.shaderProgram,fragmentShader);gl.linkProgram(this.shaderProgram);if(!gl.getProgramParameter(this.shaderProgram,gl.LINK_STATUS)){alert("Could not initialise shaders");return}
gl.useProgram(this.shaderProgram);this.shaderProgram.vertexPositionAttribute=gl.getAttribLocation(this.shaderProgram,"aVertexPosition");gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);this.shaderProgram.textureCoordAttribute=gl.getAttribLocation(this.shaderProgram,"aTextureCoord");gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);this.shaderProgram.texture=gl.getUniformLocation(this.shaderProgram,"uTexture");gl.useProgram(null)}
this.is_init=!0}}
var gl;var camera;var lines;var screen;var mainRenderTexture;var skybox;var showFPS=!1;function initGL(canvas){try{gl=canvas.getContext("webgl2");gl.viewportWidth=canvas.width=window.innerWidth;gl.viewportHeight=canvas.height=window.innerHeight}catch(e){}
if(!gl){alert("Could not initialise WebGL 2!")}}
function render(){var pMatrix=mat4.create();camera.perspective(mainRenderTexture.textureWidth/mainRenderTexture.textureHeight,pMatrix);var vMatrix=camera.viewMatrix();var mvpMatrix=mat4.create();mat4.multiply(mvpMatrix,pMatrix,vMatrix);{gl.bindFramebuffer(gl.FRAMEBUFFER,mainRenderTexture.fb);gl.viewport(0,0,gl.viewportWidth,mainRenderTexture.textureHeight);gl.clearColor(0.95,0.95,0.95,1.0);gl.clear(gl.COLOR_BUFFER_BIT);{gl.depthMask(!1);gl.clear(gl.DEPTH_BUFFER_BIT);var pMatrixSkybox=mat4.create();camera.skyboxPerspective(mainRenderTexture.textureWidth/mainRenderTexture.textureHeight,pMatrixSkybox);var vMatrixSkybox=mat4.create();mat4.fromQuat(vMatrixSkybox,camera.gameObject.rotation);mat4.invert(vMatrixSkybox,vMatrixSkybox);var mvpMatrixSkybox=mat4.create();mat4.multiply(mvpMatrixSkybox,pMatrixSkybox,vMatrixSkybox);skybox.render(gl,mvpMatrixSkybox,camera)}
{gl.depthMask(!0);gl.clear(gl.DEPTH_BUFFER_BIT);if(options.lines)
lines.renderLines(gl,mvpMatrix);if(options.dots)
lines.renderDots(gl,mvpMatrix);if(options.mesh)
lines.innerMesh.render(gl,mvpMatrix,mat4.create())}}
{{gl.depthMask(!1);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);gl.clearColor(0,0,0,1.0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);screen.render(gl,mainRenderTexture.texture)}}}
function resizeCanvas(){var canvas=document.getElementById("Game-canvas");gl.viewportWidth=canvas.width=window.innerWidth;gl.viewportHeight=canvas.height=window.innerHeight;mainRenderTexture=new RenderTexture(gl,gl.viewportWidth,gl.viewportHeight)}
function tick(){requestAnimFrame(tick);timer.update();handleKeys();options.update();lines.update(gl);camera.update();render();inputManager.clear()}
function webGLStart(){var canvas=document.getElementById("Game-canvas");initGL(canvas);screen=new Screen();screen.init(gl);mainRenderTexture=new RenderTexture(gl,gl.viewportWidth,gl.viewportHeight);camera=new Camera();camera.gameObject=new GameObject();lines=new Lines();lines.init(gl);skybox=new Skybox();skybox.init(gl);document.onkeydown=handleKeyDown;document.onkeyup=handleKeyUp;canvas.onmousedown=handleMouseDown;document.onmouseup=handleMouseUp;document.onmousemove=handleMouseMove;window.addEventListener('mousewheel',handleMouseWheel,!1);window.addEventListener("DOMMouseScroll",handleMouseWheel,!1);window.addEventListener('resize',resizeCanvas,!1);gl.enable(gl.DEPTH_TEST);tick()}