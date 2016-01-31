"use strict";

document.addEventListener("DOMContentLoaded", main);

var gl;
var shaderProgram;

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;
var squareVertexPositionBuffer;
var squareVertexColorBuffer;

var lastTime = 0;
var rTri = 0;
var rSquare = 0;

function main(){
	var canvas = document.getElementById("canvas");

	gl = canvas.getContext("experimental-webgl");
	if(!gl){
		throw new Error("Could not get webgl context");
	}
	
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;

	initShaders();
	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	tick();
}

/**
 * 1.0 Init Shaders
 **/

function initShaders(){
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
		throw new Error("Could not link shaders");
	}

	gl.useProgram(shaderProgram);

	//Vertex Position Attribute
	shaderProgram.vertexPostionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	//Vertex Color Attribute
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	//Perspective Matrix Uniform Pointer
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

/**
 * 1.1 get Shader
 **/

function getShader(gl, id){
	var shaderScript = document.getElementById(id);
	if(!id){
		throw new Error("Could not find script: " + id);
	}

	var str = "";
	var k = shaderScript.firstChild;

	while(k){
		if(k.nodeType === 3){
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	switch(shaderScript.type){
		case "x-shader/x-fragment":
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		break;
		case "x-shader/x-vertex":
			shader = gl.createShader(gl.VERTEX_SHADER);
		break;
		default:
			throw new Error("Unknown script type: " + shaderScript.type);
		break;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		throw new Error(id + "\n" + gl.getShaderInfoLog(shader));
	}

	return shader;
}

/**
 * 2.0 Init Buffers
 **/

function initBuffers(){
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	var vertices = new Float32Array([
		0.0, 1.0, 0.0,
		-1.0, -1.0, 0.0,
		1.0, -1.0, 0.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = 3;

	triangleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	var colors = new Float32Array([
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 4;
	triangleVertexColorBuffer.numItems = 3;

	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	vertices = new Float32Array([
		1.0, 1.0, 0.0,
		-1.0, 1.0, 0.0,
		1.0, -1.0, 0.0,
		-1.0, -1.0, 0.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numItems = 4;

	squareVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
	colors = new Float32Array([
		0.5, 0.5, 1.0, 1.0,
		0.5, 0.5, 1.0, 1.0,
		0.5, 0.5, 1.0, 1.0,
		0.5, 0.5, 1.0, 1.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	squareVertexColorBuffer.itemSize = 4;
	squareVertexColorBuffer.numItems = 4;
}

/**
 * 3.0 Tick
 **/

function tick(){
	requestAnimationFrame(tick);
	drawScene();
	animate();
}

/**
 * 3.1 drawScene
 **/

function drawScene(){
	gl.viewport(0,0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);

	mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
	mvPushMatrix();
	mat4.rotate(mvMatrix, degToRad(rTri), [0, 1, 0]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);	

	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);	

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
	mvPopMatrix();

	mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);

	mvPushMatrix();
	mat4.rotate(mvMatrix, degToRad(rSquare), [1, 0, 0]);

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

	mvPopMatrix();
}

/**
 * 3.2 animate
 **/

function animate(){
	var timeNow = new Date().getTime();
	if(lastTime != 0){
		var elasped = timeNow - lastTime;

		rTri += (90 * elasped) / 1000.0;
		rSquare += (75 * elasped) / 1000.0;
	}

	lastTime = timeNow;
}


/**
 * 4.0 mvPushMatrix
 **/

 function mvPushMatrix(){
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
 }

/**
 * 4.1 mvPopMatrix
 **/

 function mvPopMatrix(){
	if(mvMatrixStack.length === 0){
		throw new Error("Invalid pop matrix");
	}

	mvMatrix = mvMatrixStack.pop();
 }

 /**
  * 4.2 setMatrixUniforms
  **/
 
 function setMatrixUniforms(){
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
 }

 function degToRad(degrees){
	return degrees * Math.PI / 180;
 }
