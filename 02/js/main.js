"use strict";

window.onload = main;

function main(){
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("experimental-webgl");

	var program = gl_util.create_program(gl);
	gl.useProgram(program);
	
	var positionLocation = gl.getAttribLocation(program, "a_position");
	var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
	gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		10, 20,
		80, 20,
		10, 30,
		10, 30,
		80, 20,
		80, 30]), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}
