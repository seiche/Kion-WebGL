"use strict";

window.onload = main;

function main(){
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl");

	if(!gl){
		throw new Error("Webgl Context not found");
	}

	var program = gl_util.create_program(gl);
	gl.useProgram(program);

	var positionLocation = gl.getAttribLocation(program, "a_position");
	var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
	var colorLocation = gl.getUniformLocation(program, "u_color");

	gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	
	var x, y, w, h, r, g, b;
	for(var i = 0; i < 50; i++){
		x = random_int(300);	
		y = random_int(300);	
		w = random_int(300);	
		h = random_int(300);	
		setRectangle(gl, x, y, w, h);

		r = Math.random();
		g = Math.random();
		b = Math.random();
		gl.uniform4f(colorLocation,r, g, b, 1);
		gl.drawArrays(gl. TRIANGLES, 0, 6);
	}
}

function random_int(range){
	range = range || 10;
	return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height){
	var x1 = x;
	var x2 = x + width;
	var y1 = y;
	var y2 = y + height;
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		x1, y1,
		x2, y1,
		x1, y2,
		x1, y2,
		x2, y1, 
		x2, y2
	]), gl.STATIC_DRAW);
}
