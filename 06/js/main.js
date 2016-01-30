"use strict";

document.addEventListener("DOMContentLoaded", main);

var gl;
var ptr;
var buffers;

/**
 * main
 **/

function main(){
	ptr = {};
	buffers = {};

	var canvas = document.getElementById("canvas");
	
	try{
		gl = canvas.getContext("experimental-webgl");
	}catch(err){
		throw new Error("Could not initialize WebGL Context");
	}

	initShaders();
	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	drawScene(canvas);
}

/**
 * initShaders
 **/

function initShaders(){
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	//Create fragment and vertex shaders
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		throw new Error("Could not link shader program");
	}

	gl.useProgram(program);
	
	//Save variable pointers from program
	ptr.vertex_attribute = gl.getAttribLocation(program, "aVertexPosition");
	gl.enableVertexAttribArray(ptr.vertex_attribute);

	ptr.color_attribute = gl.getAttribLocation(program, "aVertexColor");
	gl.enableVertexAttribArray(ptr.color_attribute);
	
	ptr.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
	ptr.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
}

/**
 * getShader
 **/

function getShader(gl, script_id){
	var shaderScript = document.getElementById(script_id);
	if(!shaderScript){
		throw new Error("Could not find script id: " + script_id);
	}
	
	//Get text content from script
	var str = "";
	var k = shaderScript.firstChild;
	while(k){
		if(k.nodeType === 3){
			str += k.textContent;
		}

		k = k.nextSibling;
	}
	
	//Create shader based on type
	var shader;
	switch(shaderScript.type){
		case "x-shader/x-fragment":
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		break;
		case "x-shader/x-vertex":
			shader = gl.createShader(gl.VERTEX_SHADER);
		break;
		default:
			throw new Error("Unknown vertex script type:" + shaderScript.type);
		break;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	//Check for compile errors
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		console.error(gl.getShaderInfoLog(shader));
		throw new Error("Could not compile shader source: " + script_id);
	}

	return shader;
}

/**
 * initBuffers
 **/

function initBuffers(){
	//Triangle position
	buffers.trianglePosition = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.trianglePosition);
	var vertices = new Float32Array([
		0.0, 1.0, 0.0,
		-1.0, -1.0, 0.0,
		1.0, -1.0, 0.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	buffers.trianglePosition.itemSize = 3;
	buffers.trianglePosition.numItems = 3;

	//Triangle color
	buffers.triangleColor = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.triangleColor);
	var colors = new Float32Array([
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
	]);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	buffers.triangleColor.itemSize = 4;
	buffers.triangleColor.numItems = 3;

	//Square Position
	buffers.squarePosition = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.squarePosition);
	vertices = new Float32Array([
		1.0, 1.0, 0.0,
		-1.0, 1.0, 0.0,
		1.0, -1.0, 0.0,
		-1.0, -1.0, 0.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	buffers.squarePosition.itemSize = 3;
	buffers.squarePosition.numItems = 4;

	//Square Color
	buffers.squareColor = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.squareColor);
	colors = new Float32Array([
		0.5, 0.5, 1.0, 1.0,
		0.5, 0.5, 1.0, 1.0,
		0.5, 0.5, 1.0, 1.0,
		0.5, 0.5, 1.0, 1.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	buffers.squareColor.itemSize = 4;
	buffers.squareColor.numItems = 4;
}

/**
 * drawScene
 **/

function drawScene(canvas){
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var mvMatrix = mat4.create();
	var pMatrix = mat4.create();
	
	var itemSize;
	mat4.perspective(45, canvas.width/canvas.height, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);

	//Bind triangle position buffer
	mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.trianglePosition);
	itemSize = buffers.trianglePosition.itemSize;
	gl.vertexAttribPointer(ptr.vertex_attribute, itemSize, gl.FLOAT, false, 0, 0);
	
	//Bind triangle color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.triangleColor);
	itemSize = buffers.triangleColor.itemSize;
	gl.vertexAttribPointer(ptr.color_attribute, itemSize, gl.FLOAT, false, 0, 0);
	
	//Draw Triangle
	setmatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, buffers.trianglePosition.numItems);

	mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.squarePosition);
	itemSize = buffers.squarePosition.itemSize;
	gl.vertexAttribPointer(ptr.vertex_attribute, itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.squareColor);
	itemSize = buffers.squareColor.itemSize;
	gl.vertexAttribPointer(ptr.color_attribute, itemSize, gl.FLOAT, false, 0, 0);

	setmatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.squarePosition.numItems);

	//Internal helper function
	function setmatrixUniforms(){
		gl.uniformMatrix4fv(ptr.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(ptr.mvMatrixUniform, false, mvMatrix);
	}
}

