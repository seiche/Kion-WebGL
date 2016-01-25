"use strict";

/*
 * Copyright 2016 Benjamin Collins
 * All rights reserved.
 */

const gl_util = (function () {
	
	return {
		"create_program" : create_program
	};

  	function create_program(gl) {
		
		var shaderScripts = document.getElementsByTagName("script");
		
		var prgm = gl.createProgram();
		var shader, src, type, k;
  		for(var i = 0; i < shaderScripts.length; i++){
			//check type
			switch(shaderScripts[i].type){
				case "x-shader/x-vertex":
					type = gl.VERTEX_SHADER;
				break;
				case "x-shader/x-fragment":
					type = gl.FRAGMENT_SHADER
				break;
				default:
					continue;
				break;
			}
			
			//get shader source
			src = "";
			k = shaderScripts[i].firstChild;
			while (k) {
				if (k.nodeType == 3) {
					src += k.textContent;
				}
				k = k.nextSibling;
			}

			//create shader
			shader = gl.createShader(type);
			gl.shaderSource(shader, src);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error("Could not compile shader script");
				throw new Error(gl.getShaderInfoLog(shader));
			}
			
			gl.attachShader(prgm, shader);
		}
		gl.linkProgram(prgm);
		return prgm;
	}


})();

