
// la idea es que cargo los verticesd desde un mesh que sirve de template
// asi me ahorro de escribir el algortimo para la geoesphere
// pero las normales y las coordenadas de textura si las computo on the fly

function skydome(face_tx) {
	
	this.matWorld = mat4.create();
    mat4.identity(this.matWorld);
	this.loaded = false;
	this.texture_loaded = false;
	this.image_name = face_tx;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'media/dome.msh', true);
	xhr.responseType = 'arraybuffer';
	xhr.mesh = this;
	xhr.onload = function(e) {
		xhr.mesh.initMeshFromData(new Float32Array(this.response));
		};
	xhr.send();		
}


	
skydome.prototype.initMeshFromData = function (data) {

	var t = 0;
	var cant_v = data[t++] | 0;
	var vertices = [];
	var min_x = 1000000;
	var min_y = 1000000;
	var min_z = 1000000;
	var max_x = -1000000;
	var max_y = -1000000;
	var max_z = -1000000;
	
	for(var i=0;i<cant_v;++i)
	{
		var x = vertices[3*i] = data[t++];
		var y = vertices[3*i+1] = data[t++];
		var z = vertices[3*i+2] = data[t++];
		
		if(x<min_x)
			min_x = x;
		if(y<min_y)
			min_y = y;
		if(z<min_z)
			min_z = z;
		if(x>max_x)
			max_x = x;
		if(y>max_y)
			max_y = y;
		if(z>max_z)
			max_z = z;
	}
	this.cant_vertices = cant_v;
	var dx = max_x-min_x;
	var dy = max_y-min_y;
	var dz = max_z-min_z;

	// normalizo los vertices
	for( i=0;i<cant_v;++i)
	{
		var x = vertices[3*i];
		var y = vertices[3*i+1];
		var z = vertices[3*i+2];
		
		vertices[3*i] = (x-min_x - dx/2) ;
		vertices[3*i+1] = (y-min_y );
		vertices[3*i+2] = (z-min_z - dz/2);
	}
	

	var normales = [];
	for( i=0;i<cant_v;++i)
	{
		t+=3;		// tengo que salterar el filepointer
		var N = [vertices[3*i] , vertices[3*i+1] , vertices[3*i+2]];
		vec3.normalize(N);
		normales[3*i] = -N[0];
		normales[3*i+1] = -N[1];
		normales[3*i+2] = -N[2];
	}
		
	var tx_coords = [];
	var ep = 0.01;
	for(i=0;i<cant_v;++i)
	{
		t+=2;
		tx_coords[2*i] = ep + (vertices[3*i]/dx + 0.5) / (1+2*ep);
		tx_coords[2*i+1] = ep + (vertices[3*i+2]/dz + 0.5) / (1+2*ep);
		
		/*
		var x = -normales[3*i];
		var z = -normales[3*i+1];
		var y = -normales[3*i+2];
		// http://mathworld.wolfram.com/SphericalCoordinates.html
		// notar que r = 1 (pues N esta normalizado y N = pos)
		var theta = Math.atan2(y,x);
		var phi = Math.acos(z)
		tx_coords[2*i] = theta/(2*Math.PI) - 0.5;
		tx_coords[2*i+1] = phi/Math.PI;
		*/
	}

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
skydome.prototype.initTextures = function () {

	this.texture = gl.createTexture();
	this.is_pot2 = true;
	var img = new Image();
	img.mesh = this;
	img.texture = this.texture;
	img.onload = function() { this.mesh.handleTextureLoaded(this);};
	img.src = this.image_name;
}

function power_of_2(n) {  
    return n && (n & (n - 1)) === 0;  
}  

// carga asincronica del texturas  
skydome.prototype.handleTextureLoaded = function(image) {
	
	gl.bindTexture(gl.TEXTURE_2D, image.texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	if(gl.getError()==gl.NO_ERROR)
	{
		// solo puede generar mimmaping si es potencia de 2
		if(power_of_2(image.width) && power_of_2(image.height))
			gl.generateMipmap(gl.TEXTURE_2D);
		else
			image.mesh.is_pot2 = false;
		gl.bindTexture(gl.TEXTURE_2D, null);
		image.mesh.texture_loaded = true;
	}
}

skydome.prototype.render = function () {

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

	
	// finalmente dibujo los subsets
	if(this.texture_loaded)
	{
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		// parametros del sampler, ojo que las texturas que no son potencia de 2 no aceptan mirror
		if(this.is_pot2)
		{
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		}
		else
		{
			// estamos jodidos.. no entro la textura de 2
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	}
			
	gl.drawArrays(gl.TRIANGLES, 0, this.cant_vertices);
}

