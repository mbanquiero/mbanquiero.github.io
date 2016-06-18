
function heigthmap(hmap_tex,terrain_tex) {
	
	this.matWorld = mat4.create();
    mat4.identity(this.matWorld);
	this.loaded = false;
	this.texture_loaded = false;
	// cargo el terrerno
	this.InitHeightMapFromBitmap(hmap_tex);
	// cargo la textura del terrerno
	this.initTexture(terrain_tex);
}


// Carga el array del alturas desde una imagen bitmap
heigthmap.prototype.InitHeightMapFromBitmap = function (fname) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', fname, true);
	xhr.responseType = 'arraybuffer';
	xhr.heigthmap = this;
	xhr.onload = function(e) {
		xhr.heigthmap.HeightMapArray = initHeightMapFromData(new Uint8Array(this.response) , 1024,1024);
		xhr.heigthmap.initBuffers();
		xhr.heigthmap.loaded = true;
		};
	xhr.send();		
}	
	
// helper accede al bitmap y toma los valores rgb
function initHeightMapFromData(uInt8Array , dx,dy) {
	var HeightMapData = new Uint8Array(dx*dy);
	var t = 54;
	var s = 0;
	for(var j=0;j<dx;++j)
	for(var i=0;i<dy;++i)
	{
		var R = uInt8Array[t++];
		var G = uInt8Array[t++];
		var B = uInt8Array[t++];
		HeightMapData[j*dy+ i] = R;
	}
	return HeightMapData;
}	

heigthmap.prototype.HeightMap = function (x,z) {
	x+=512;
	z+=512;
	if(z<0)
		z = 0;
	else 
	if(z>1023)
		z = 1023;
	if(x<0)
		x = 0;
	else 
	if(x>1023)
		x = 1023;
		
	var int_x = Math.floor(x);
	var int_z = Math.floor(z);
	var frac_x = x-int_x;
	var frac_z = z-int_z;
	
	var h00 = this.HeightMapArray[int_x*1024+int_z];
	var h01 = this.HeightMapArray[int_x*1024+int_z+1];
	var h10 = this.HeightMapArray[(int_x+1)*1024+int_z];
	var h11 = this.HeightMapArray[(int_x+1)*1024+int_z+1];
	
	var H =  (h00*(1-frac_z) + h01*frac_z) * (1-frac_x) + 
			 (h10*(1-frac_z) + h11*frac_z) * frac_x;
	return H*50.0/256.0;
}

heigthmap.prototype.HeightMapNormal = function( x, z){
	var ep = 2.0;
	var y = this.HeightMap(x,z);
	var yx = this.HeightMap(x+ep,z);
	var yz = this.HeightMap(x,z+ep);
	
	var fx = [ep , yx-y , 0.0];
	var fz = [0.0 ,yz-y, ep ];
	var N = vec3.create();
	vec3.cross(fz,fx,N);
	vec3.normalize(N);
	return N;
}
	
heigthmap.prototype.initBuffers = function(){
	var t = 0;
	var n = 0;
	var s = 0;
	var Kt = 10.0/1024.0;
	var vertices = [];
	var normales = [];
	var tx_coords = [];
	var cant_v = 0;

	var dx = 1;
	var dz = 1;
	for(var x=-512;x<511;x+=dx)
	for(var z=-512;z<511;z+=dz)
	{
		var x0 = x;
		var z0 = z;
		var y0 = this.HeightMap(x0,z0);
		var N0 = this.HeightMapNormal(x0,z0);

		var x1 = x + dx;
		var z1 = z;
		var y1 = this.HeightMap(x1,z1);
		var N1 = this.HeightMapNormal(x1,z1);
		
		var x2 = x;
		var z2 = z + dz;
		var y2 = this.HeightMap(x2,z2);
		var N2 = this.HeightMapNormal(x2,z2);
		
		var x3 = x + dx;
		var z3 = z + dz;
		var y3 = this.HeightMap(x3,z3);
		var N3 = this.HeightMapNormal(x3,z3);
		
		vertices[t++] = x0;
		vertices[t++] = y0;
		vertices[t++] = z0;
		normales[n++] = N0[0];			
		normales[n++] = N0[1];			
		normales[n++] = N0[2];		
		tx_coords[s++] = x0*Kt;
		tx_coords[s++] = z0*Kt;
		
		vertices[t++] = x1;
		vertices[t++] = y1;
		vertices[t++] = z1;
		normales[n++] = N1[0];			
		normales[n++] = N1[1];			
		normales[n++] = N1[2];			
		tx_coords[s++] = x1*Kt;
		tx_coords[s++] = z1*Kt;
		
		vertices[t++] = x2;
		vertices[t++] = y2;
		vertices[t++] = z2;
		normales[n++] = N2[0];			
		normales[n++] = N2[1];			
		normales[n++] = N2[2];			
		tx_coords[s++] = x2*Kt;
		tx_coords[s++] = z2*Kt;

		vertices[t++] = x1;
		vertices[t++] = y1;
		vertices[t++] = z1;
		normales[n++] = N1[0];			
		normales[n++] = N1[1];			
		normales[n++] = N1[2];			
		tx_coords[s++] = x1*Kt;
		tx_coords[s++] = z1*Kt;

		vertices[t++] = x2;
		vertices[t++] = y2;
		vertices[t++] = z2;
		normales[n++] = N2[0];			
		normales[n++] = N2[1];			
		normales[n++] = N2[2];			
		tx_coords[s++] = x2*Kt;
		tx_coords[s++] = z2*Kt;

		vertices[t++] = x3;
		vertices[t++] = y3;
		vertices[t++] = z3;
		normales[n++] = N3[0];			
		normales[n++] = N3[1];			
		normales[n++] = N3[2];			
		tx_coords[s++] = x3*Kt;
		tx_coords[s++] = z3*Kt;
		
		cant_v+=6;
		
	}
	
	this.vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vertexPositionBuffer.itemSize = 3;
	this.vertexPositionBuffer.numItems = cant_v;
	
	this.vertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normales), gl.STATIC_DRAW);
	this.vertexNormalBuffer.itemSize = 3;
	this.vertexNormalBuffer.numItems = cant_v;
	
	this.vertexTexCoordsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTexCoordsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tx_coords), gl.STATIC_DRAW);
	this.vertexTexCoordsBuffer.itemSize = 2;
	this.vertexTexCoordsBuffer.numItems = cant_v;
	
}


// cargo las textura
heigthmap.prototype.initTexture = function (terrain_tex) {

	this.texture = gl.createTexture();
	var img = new Image();
	img.hmap = this;
	img.texture = this.texture;
	img.onload = function() { handleTextureLoaded2(this);};
	img.src = terrain_tex;
	
}

// carga asincronica del texturas  
function handleTextureLoaded2(image) {
	
	gl.bindTexture(gl.TEXTURE_2D, image.texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	if(gl.getError()==gl.NO_ERROR)
	{
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		image.hmap.texture_loaded = true;
	}
}


heigthmap.prototype.render = function () {

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

	if(this.texture_loaded)
	{
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	}
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexPositionBuffer.numItems);
}


