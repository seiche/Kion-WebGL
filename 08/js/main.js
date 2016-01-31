"use strict";

document.addEventListener("DOMContentLoaded", main);

var gl;
var lastTime = 0;
var shaderProgram;

var rPyramid = 0;
var rCube = 0;

var pyramidVertexPositionBuffer;
var pyramidVertexColorBuffer;
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

/**
 * main
 **/ 

function main(){
	var canvas = document.getElementById("canvas");
	gl = canvas.getContext("experimental-webgl");
	if(!gl){
		throw "Could not get webgl context";
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
 * Init Shaders
 **/

function initShaders(){
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
		throw "Could not link shader program";
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

/**
 * getShader
 **/

function getShader(gl, id){
	var shaderScript = document.getElementById(id);
	if(!shaderScript){
		throw "Could not find shader script: " + id;
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
			throw "Invalid script type: " + shaderScript.type;
		break;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		console.error("Could not compile " + id);
		throw gl.getShaderInfoLog(shader);
	}

	return shader;
}

/**
 * initBuffers
 **/

function initBuffers(){
	pyramidVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
	var vertices = new Float32Array([
		//Front face
		0.0, 1.0, 0.0,
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,

		//Right face
		0.0, 1.0, 0.0,
		1.0, -1.0, 1.0,
		1.0, -1.0, -1.0,

		//Back face
		0.0, 1.0, 0.0,
		1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,

		// Left face
		0.0, 1.0, 0.0,
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	pyramidVertexPositionBuffer.itemSize = 3;
	pyramidVertexPositionBuffer.numItems = 12;

	pyramidVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
	var colors = new Float32Array([
		//Front face
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,

		//Right face
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0,

		//Back face
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,

		//Left face
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	pyramidVertexColorBuffer.itemSize = 4;
	pyramidVertexColorBuffer.numItems = 12;

	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	vertices = new Float32Array([
		//Front face
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,

		//Back face
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,

		//Top face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,

		//Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,

		//Right face
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,

		//Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 24;

	cubeVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	colors = new Float32Array([
		//Front Face
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,

		//Back face
		1.0, 1.0, 0.0, 1.0,
		1.0, 1.0, 0.0, 1.0,
		1.0, 1.0, 0.0, 1.0,
		1.0, 1.0, 0.0, 1.0,

		//Top Face
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,

		//Bottom face
		1.0, 0.5, 0.5, 1.0,
		1.0, 0.5, 0.5, 1.0,
		1.0, 0.5, 0.5, 1.0,
		1.0, 0.5, 0.5, 1.0,

		//Right face
		1.0, 0.0, 1.0, 1.0,
		1.0, 0.5, 0.5, 1.0,
		1.0, 0.5, 0.5, 1.0,
		1.0, 0.5, 0.5, 1.0,

		//Left face
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	cubeVertexColorBuffer.itemSize = 4;
	cubeVertexColorBuffer.numItems = 24;

	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	var cubeVertexIndices = new Uint16Array([
		0, 1, 2, 0, 2, 3,
		4, 5, 6, 4, 6, 7,
		8, 9, 10, 8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	]);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndices, gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;
}

/**
 * tick
 **/

function tick(){
	requestAnimationFrame(tick);
	drawScene();
	animate();
}

function drawScene(){
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);

	mat4.translate(mvMatrix, [-1.5, 0.0, -8.0]);
	mvPushMatrix();
	mat4.rotate(mvMatrix, degToRad(rPyramid), [0, 1, 0]);

	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
	mvPopMatrix();

	mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);

	mvPushMatrix();
	mat4.rotate(mvMatrix, degToRad(rCube), [1, 1, 1]);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
	mvPopMatrix();
}

/**
 * animate
 **/

function animate(){
	var timeNow = new Date().getTime();
	if(lastTime !== 0){
		var elapsed = timeNow - lastTime;

		rPyramid += (90*elapsed) / 1000.0;
		rCube -= (75 * elapsed) / 1000.0;
	}
	lastTime = timeNow;
}

/**
 * mvPushMatrix
 **/

function mvPushMatrix(){
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

/**
 * mvPopMatrix
 **/

function mvPopMatrix(){
	if(mvMatrixStack.length === 0){
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}

/**
 * setMatrixUniforms
 **/

function setMatrixUniforms(){
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

/**
 * degToRad
 **/

function degToRad(degrees){
	return degrees * Math.PI / 180;
}
