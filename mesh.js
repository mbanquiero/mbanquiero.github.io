function mesh(fname,media_folder) {
	
	this.matWorld = mat4.create();
    mat4.identity(this.matWorld);
	this.loaded = false;
	this.media_folder = typeof media_folder=='undefined' ? 'media/' : media_folder;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', fname, true);
	xhr.responseType = 'arraybuffer';
	xhr.mesh = this;
	xhr.onload = function(e) {
		xhr.mesh.initMeshFromData(new Float32Array(this.response));
		};
	xhr.send();		
}


	
mesh.prototype.initMeshFromData = function (data) {

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
	// actualizo el bounding box
	this.p_min = [min_x,min_y,min_z];
	this.p_max = [max_x,max_y,max_z];
	this.size = [max_x-min_x,max_y-min_y,max_z-min_z];

	var normales = [];
	var cant_items = cant_v * 3;
	for( i=0;i<cant_items;++i)
		normales[i] = data[t++];

	// dejo previso transf. de coordenadas en el momento de cargar el mesh
	var tx_coords = [];
	for(i=0;i<cant_v;++i)
	{
		var U = data[t++];
		var V = data[t++];
		tx_coords[2*i] = U;
		tx_coords[2*i+1] = V;
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
	
	// estructura de subsets
	this.cant_subsets = data[t++] | 0;
	this.subset = [];
	for(i=0;i<this.cant_subsets;++i)
	{
		var cant_items = data[t++] | 0;
		var s = "";
		for(var j=0;j<256;++j)
			s +=  String.fromCharCode(data[t++] | 0);  
		this.subset[i] = {cant_items: cant_items/3, image_name:s};
	}

	this.initTextures();
	this.loaded = true;
}


// cargo las texturas
mesh.prototype.initTextures = function () {

	for(var i=0;i<this.cant_subsets;++i)
	{
		this.subset[i].texture = gl.createTexture();
		this.subset[i].texture_loaded = false;
		this.subset[i].is_pot2 = true;
		var img = new Image();
		img.mesh = this;
		img.nro_textura = i;
		img.texture = this.subset[i].texture;
		img.onload = function() { this.mesh.handleTextureLoaded(this);};
		img.src = this.media_folder+this.subset[i].image_name;
	}
}

function power_of_2(n) {  
    return n && (n & (n - 1)) === 0;  
}  

// carga asincronica del texturas  
mesh.prototype.handleTextureLoaded = function(image) {
	
	var i = image.nro_textura;			// nro de subset
	gl.bindTexture(gl.TEXTURE_2D, image.texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	if(gl.getError()==gl.NO_ERROR)
	{
		// solo puede generar mimmaping si es potencia de 2
		if(power_of_2(image.width) && power_of_2(image.height))
			gl.generateMipmap(gl.TEXTURE_2D);
		else
			image.mesh.subset[i].is_pot2 = false;
		gl.bindTexture(gl.TEXTURE_2D, null);
		image.mesh.subset[i].texture_loaded = true;
	}
}

mesh.prototype.render = function () {

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
	var pos = 0;
	for(var i=0;i<this.cant_subsets;i++)
	{
		var subset = this.subset[i];
		var cant_items = subset.cant_items * 3;
		if(cant_items>0 )
		{
			if(subset.texture_loaded)
			{
				gl.bindTexture(gl.TEXTURE_2D, subset.texture);
				// parametros del sampler, ojo que las texturas que no son potencia de 2 no aceptan mirror
				if(subset.is_pot2)
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
			
			gl.drawArrays(gl.TRIANGLES, pos, cant_items);
			pos += cant_items;
		}
	}
}


// wrapper para escenas
function scene(folder,name) {
	
	this.folder = folder;
	this.name = name;
	var fname = "media/"+folder+name+".json"
	this.loaded = false;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', fname, true);
	xhr.responseType = 'text';
	xhr.scene = this;
	xhr.onload = function(e) {
		this.scene.initFromJson(this.response);
		};
	xhr.send();		
}

scene.prototype.initFromJson = function (json) {
	
	var scene_data = JSON.parse(json);  
	// cargo los mesh
	this.meshes = [];
	this.pos = [];
	this.size = [];
	this.cant_mesh = scene_data.cant_mesh;
	for(var i=0;i<this.cant_mesh;++i)
	{
		var mesh_name = 'media/'+this.folder+this.name+'_'+i.toFixed(0)+'.msh';
		this.meshes[i] = new mesh(mesh_name,'media/'+this.folder);
		this.pos[i] = scene_data.mesh[i].pos;
		this.size[i] = scene_data.mesh[i].size;
	}
	this.loaded = true;

}

scene.prototype.render = function () {

	if(!this.loaded)
		return;
	for(var i=0;i<this.cant_mesh;++i)
	if(this.meshes[i].loaded)
	{
		var m = this.meshes[i];
		mat4.identity(m.matWorld);

		var tx = this.pos[i][0] + this.size[i][0]*0.5;
		var ty = this.pos[i][1] + this.size[i][1]*0.5;
		var tz = this.pos[i][2] + this.size[i][2]*0.5;
		mat4.translate(m.matWorld , [tx,ty,tz]);
		
		var ex = m.size[0] ? this.size[i][0] / m.size[0] : 1;
		var ey = m.size[1] ? this.size[i][1] / m.size[1] : 1;
		var ez = m.size[2] ? this.size[i][2] / m.size[2] : 2;
		mat4.scale(m.matWorld , [ex,ey,ez]);
		
		var ox = m.p_min[0] + m.size[0]/2;
		var oy = m.p_min[1] + m.size[1]/2;
		var oz = m.p_min[2] + m.size[2]/2;
		mat4.translate(m.matWorld , [-ox,-oy,-oz]);

		setMatrixUniforms();
		m.render();
	}
}
	
// helper
function CalcularMatrizOrientacion(zAxis)
{
	var up = [0,1,0];
	vec3.normalize(zAxis);
	var xAxis = vec3.create();
	var yAxis = vec3.create();
	vec3.cross(up, zAxis,xAxis);
	vec3.normalize(xAxis);
	vec3.cross(zAxis, xAxis,yAxis);

	var rta = [
			xAxis[0] , xAxis[1] , xAxis[2] , 0 , 
			yAxis[0] , yAxis[1] , yAxis[2] , 0 , 
			zAxis[0] , zAxis[1] , zAxis[2] , 0 , 
			0 	 ,		0 ,	    0, 			1
			];
			

	return rta;
}



