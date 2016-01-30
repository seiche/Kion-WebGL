"use strict";

document.addEventListener("DOMContentLoaded", main);

function main(){
	
	/* -- Inititalize WebGL -- */
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("experimental-webgl");

	if(!gl){
		throw new Error("Could not initialize webgl");
	}

	var program = gl_util.create_program(gl);
	gl.useProgram(program);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	/* -- Init Shaders -- */
	var vertex_attribute = gl.getAttribLocation(program, "aVertexPosition");
	gl.enableVertexAttribArray(vertex_attribute);
	var pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
	var mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");

	/* -- Init move and perspective Matrix -- */
	var mvMatrix = mat4.create();
	var pMatrix = mat4.create();

	mat4.perspective(45, canvas.width/canvas.height, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [1.5, 0.0, -7.0]);

	gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);

	/* -- Initialize and Draw Square Buffer -- */
	var squareBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
	var vertices = new Float32Array([
		1.0, 1.0, 0.0,
		-1.0, 1.0, 0.0,
		1.0, -1.0, 0.0,
		-1.0, -1.0, 0.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(vertex_attribute, 3, gl.FLOAT, false, 0, 0);

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
