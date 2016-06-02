function skybox(media_folder,face_tx) {
	
	this.matWorld = mat4.create();
    mat4.identity(matWorld);
	this.loaded = false;
	this.media_folder = typeof media_folder=='undefined' ? 'media/' : media_folder;
	this.face = [];
	for(var i=0;i<6;++i)
		this.face[i] = {image_name: face_tx[i]};
	this.initBuffers();
}


	
skybox.prototype.initBuffers = function () {

	var t = 0;
	var n = 0;
	var s = 0;
	var vertices = [];
	var normales = [];
	var tx_coords = [];
	var cant_v = 0;
	var ep = 0.00001;

	// Cara de arriba
	// -----------------------------------------
	var N = [0,1,0];
	vertices[t++] = -1-ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 0;				// tv
	
	vertices[t++] = -1-ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 0;				// tv

	vertices[t++] = 1+ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 1;				// tv
	
	vertices[t++] = 1+ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 1;				// tv
	cant_v+=4;

	// Cara de abajo
	// -----------------------------------------
	N = [0,-1,0];
	vertices[t++] = -1-ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 0;				// tv
	
	vertices[t++] = -1-ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 0;				// tv

	vertices[t++] = 1+ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 1;				// tv
	
	vertices[t++] = 1+ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 1;				// tv
	cant_v+=4;
		
	// Cara de izquierda
	// -----------------------------------------
	N = [-1,0,0];
	vertices[t++] = -1-ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 0;				// tv
	
	vertices[t++] = -1-ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 1;				// tv

	vertices[t++] = -1-ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 0;				// tv
	
	vertices[t++] = -1-ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 1;				// tv
	cant_v+=4;
		
	// Cara de la derecha
	// -----------------------------------------
	N = [1,0,0];
	vertices[t++] = +1+ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 0;				// tv
	
	vertices[t++] = +1+ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 1;				// tv

	vertices[t++] = +1+ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 0;				// tv
	
	vertices[t++] = +1+ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 1;				// tv
	cant_v+=4;
	
	// Cara de atras
	// -----------------------------------------
	N = [0,0,-1];
	vertices[t++] = +1+ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 0;				// tv
	
	vertices[t++] = 1+ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 1;				// tv

	vertices[t++] = -1-ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 0;				// tv
	
	vertices[t++] = -1-ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = -1-ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 1;				// tv
	cant_v+=4;
	
	// Cara de adelante
	// -----------------------------------------
	N = [0,0,1];
	vertices[t++] = +1+ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 0;				// tv
	
	vertices[t++] = 1+ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 0;				// tu
	tx_coords[s++] = 1;				// tv

	vertices[t++] = -1-ep;			// x
	vertices[t++] = 1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 0;				// tv
	
	vertices[t++] = -1-ep;			// x
	vertices[t++] = -1;				// y
	vertices[t++] = 1+ep;			// z
	normales[n++] = N[0];			// N.x
	normales[n++] = N[1];			// N.y
	normales[n++] = N[2];			// N.z
	tx_coords[s++] = 1;				// tu
	tx_coords[s++] = 1;				// tv
	cant_v+=4;

	// creo los distintos vertex buffers
	// posiciones
	this.vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vertexPositionBuffer.itemSize = 3;
	this.vertexPositionBuffer.numItems = cant_v;

	// normales
	this.vertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normales), gl.STATIC_DRAW);
	this.vertexNormalBuffer.itemSize = 3;
	this.vertexNormalBuffer.numItems = cant_v;

	// coordenadas de textura
	this.vertexTexCoordsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTexCoordsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tx_coords), gl.STATIC_DRAW);
	this.vertexTexCoordsBuffer.itemSize = 2;
	this.vertexTexCoordsBuffer.numItems = cant_v;

	this.initTextures();
	this.loaded = true;
}


// cargo las texturas
skybox.prototype.initTextures = function () {

	for(var i=0;i<6;++i)
	{
		this.face[i].texture = gl.createTexture();
		this.face[i].texture_loaded = false;
		this.face[i].is_pot2 = true;
		var img = new Image();
		img.mesh = this;
		img.nro_textura = i;
		img.texture = this.face[i].texture;
		img.onload = function() { handleTextureLoaded2(this);};
		img.src = this.media_folder+this.face[i].image_name;
	}
}

function power_of_2(n) {  
    return n && (n & (n - 1)) === 0;  
}  

// carga asincronica del texturas  
function handleTextureLoaded2(image) {
	
	var i = image.nro_textura;			// nro de face
	gl.bindTexture(gl.TEXTURE_2D, image.texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	if(gl.getError()==gl.NO_ERROR)
	{
		// solo puede generar mimmaping si es potencia de 2
		if(power_of_2(image.width) && power_of_2(image.height))
			gl.generateMipmap(gl.TEXTURE_2D);
		else
			image.mesh.face[i].is_pot2 = false;
		gl.bindTexture(gl.TEXTURE_2D, null);
		image.mesh.face[i].texture_loaded = true;
	}
}

skybox.prototype.render = function () {

	if(	!this.loaded )
		return;
	
	// bind de buffers 
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTexCoordsBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, this.vertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// seteo la matriz de world  (se supone que tiene haber un shaderProgram y un matWorld en el shader)
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "matWorld"), false, this.matWorld);

	var pos = 0;
	for(var i=0;i<6;i++)
	{	
		var face = this.face[i];
		if(face.texture_loaded)
		{
			gl.bindTexture(gl.TEXTURE_2D, face.texture);
			// parametros del sampler, ojo que las texturas que no son potencia de 2 no aceptan mirror
			if(face.is_pot2)
			{
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			}
			else
			{
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			}
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
		
		gl.drawArrays(gl.TRIANGLE_STRIP, pos, 4);
		pos += 4;
	}
}


