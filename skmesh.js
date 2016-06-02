var MAX_FRAMES_X_BONE		= 30;
var MAX_ANIMATION_X_MESH	= 30;
var MAX_BONES = 26;


function SkeletalBone() {

	this.id = -1;
	this.name = "";
	this.parentId = -1;
	this.startPosition = vec3.create();
	this.startRotation = quat4.create();
	this.matLocal = mat4.create();
	this.matFinal = mat4.create();
	this.matInversePose = mat4.create();
	mat4.identity(this.matLocal);
	mat4.identity(this.matFinal);
	mat4.identity(this.matInversePose);
};

// Calculo la matriz local, ojo que en webgl se postmultiplica, el orden es inverso, 
// y la matriz va transpuesta, y ojo de nuevo que como estan row mayor en memoria a diferencia del directX
// cuando las debugueas ya estan transpuestas otra vez. 
SkeletalBone.prototype.computeMatLocal = function () {
	
	// creo una matriz de traslacion a partir de la posicion
	var T = mat4.create();
    mat4.identity(T);
	mat4.translate(T , this.startPosition);
	// creo una matriz de rotacion a partir del cuaternion startRotation
	var R = mat4.create();
	// la funcion MatrixRotationQuaternion no requiere que el cuaternione este normalizado
	MatrixRotationQuaternion(this.startRotation,R)
	mat4.multiply(T , R , this.matLocal);
}

// binding entre vertices huesos
function vertexWeight()
{
	this.boneIndex = [0,1,2,3];
	this.weight = [1.0,1.0,1.0,1.0];
};


function skmesh(fname,media_folder) {
	
	this.matWorld = mat4.create();
    mat4.identity(matWorld);
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

// Setup inicial del esqueleto
skmesh.prototype.setupSkeleton = function() {
	console.log("setupSkeleton");

	//Actualizar jerarquia
	for (var i = 0; i < this.cant_bones; i++)
	{
		var bone = this.bones[i];
		var parent_id = bone.parentId;
		if(parent_id==-1)
			bone.matFinal = mat4.create(bone.matLocal);
		else
			mat4.multiply(this.bones[parent_id].matFinal,bone.matLocal,bone.matFinal);
		
		//Almacenar la inversa de la posicion original del hueso, para la referencia inicial de los vertices
		mat4.inverse(bone.matFinal , bone.matInversePose);
		
	}
	
}

	
skmesh.prototype.initMeshFromData = function (data) {

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
	
	var tangentes = [];
	for( i=0;i<cant_items;++i)
		tangentes[i] = data[t++];
	var binormales = [];
	for( i=0;i<cant_items;++i)
		binormales[i] = data[t++];
	
	var tx_coords = [];
	for(i=0;i<cant_v;++i)
	{
		var U = data[t++];
		var V = data[t++];
		tx_coords[2*i] = U;
		tx_coords[2*i+1] = V;
	}
	
	cant_items = cant_v * 4;
	var blendWeights = [];
	for( i=0;i<cant_items;++i)
		blendWeights[i] = data[t++];

	var blendIndices = [];
	for( i=0;i<cant_items;++i)
		blendIndices[i] = data[t++];
	
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
	
	this.vertexTangentBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTangentBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangentes), gl.STATIC_DRAW);
	this.vertexTangentBuffer.itemSize = 3;
	this.vertexTangentBuffer.numItems = cant_v;
	
	this.vertexBinormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBinormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(binormales), gl.STATIC_DRAW);
	this.vertexBinormalBuffer.itemSize = 3;
	this.vertexBinormalBuffer.numItems = cant_v;
	
	this.vertexTexCoordsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTexCoordsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tx_coords), gl.STATIC_DRAW);
	this.vertexTexCoordsBuffer.itemSize = 2;
	this.vertexTexCoordsBuffer.numItems = cant_v;
	
	this.vertexBlendWeightsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBlendWeightsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blendWeights), gl.STATIC_DRAW);
	this.vertexBlendWeightsBuffer.itemSize = 4;
	this.vertexBlendWeightsBuffer.numItems = cant_v;
	
	
	this.vertexblendIndicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexblendIndicesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blendIndices), gl.STATIC_DRAW);
	this.vertexblendIndicesBuffer.itemSize = 4;
	this.vertexblendIndicesBuffer.numItems = cant_v;
	
	// estructura de sub-setes
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
	
	// estructura de huesos
	this.cant_bones = data[t++] | 0;
	this.bones = [];
	for(i=0;i<this.cant_bones;++i)
	{
		var bone = this.bones[i] = new SkeletalBone();
		bone.id = data[t++] | 0;
		bone.parentId = data[t++] | 0;
		bone.startPosition =  [data[t++] , data[t++] , data[t++]];
		bone.startRotation = [data[t++] , data[t++] , data[t++], data[t++]];
		var s = "";
		for(var j=0;j<32;++j)
			s +=  String.fromCharCode(data[t++] | 0);  
		bone.name = s;
		
		// Computo la matriz local en base a la orientacion del cuaternion y la traslacion
		bone.computeMatLocal();
		
	}
	
	// ANIMACIONES
	this.cant_animaciones = data[t++] | 0;
	this.animacion = [];
	for(i=0;i<this.cant_animaciones;++i)
	{
		var animacion = this.animacion[i] = {};
		animacion.bone_id = data[t++] | 0;
		animacion.cant_frames = data[t++] | 0;
		animacion.frame_rate = data[t++] | 0;
		animacion.cant_bones = data[t++] | 0;
		animacion.bone_animation = [];
		for(var j=0;j<MAX_BONES;++j)
		{
			var bone_animation = animacion.bone_animation[j] = {};
			bone_animation.cant_frames = data[t++] | 0;
			bone_animation.frame = [];
			for(var k=0;k<MAX_FRAMES_X_BONE;++k)
			{	
				var frame = bone_animation.frame[k] = {};
				frame.nro_frame =  data[t++] | 0;
				frame.Position =  [data[t++] , data[t++] , data[t++]];
				frame.Rotation = [data[t++] , data[t++] , data[t++], data[t++]];
			}
		}			
			
		var s = "";
		for(var j=0;j<32;++j)
			s +=  String.fromCharCode(data[t++] | 0);  
		animacion.name = s;
	}

	//Matrices final de transformacion de cada ueso
	this.matBoneSpace = [];
	for(var i=0;i<MAX_BONES;++i)
		this.matBoneSpace[i] = mat4.create();


	this.initTextures();
	this.loaded = true;
	
	// Setup inicial del esqueleto
	this.setupSkeleton();

	// prendo la primer animacion
	this.initAnimation(0,true,30);
	
}



skmesh.prototype.initAnimation = function ( nro_animacion,  con_loop,  userFrameRate) {
	this.animating = true;
	this.currentAnimation = nro_animacion;
	var p_animacion = this.animacion[nro_animacion];
	this.playLoop = con_loop;
	this.currentTime = 0;
	this.currentFrame = 0;
	this.frameRate = userFrameRate > 0 ? userFrameRate : p_animacion.frame_rate;
	this.animationTimeLenght = (p_animacion.cant_frames - 1) / this.frameRate;

	//Configurar posicion inicial de los huesos
	for (var i = 0; i < this.cant_bones; i++)
	{
		//Determinar matriz local inicial
		var frame0 = p_animacion.bone_animation[i].frame[0];
		// creo una matriz de traslacion a partir de la posicion
		var T = mat4.create();
		mat4.identity(T);
		mat4.translate(T , frame0.Position);
		
		// creo una matriz de rotacion a partir del cuaternion startRotation
		var R = mat4.create();
		MatrixRotationQuaternion(frame0.Rotation,R)
		mat4.multiply(T , R , this.bones[i].matLocal);		
		
		//Multiplicar por matriz del padre, si tiene
		var parent_id = this.bones[i].parentId;
		if(parent_id != -1)
			mat4.multiply(this.bones[parent_id].matFinal , this.bones[i].matLocal,this.bones[i].matFinal);
		else
			this.bones[i].matFinal = mat4.create(this.bones[i].matLocal);
	}

	//Ajustar vertices a posicion inicial del esqueleto
	this.updateMeshVertices();
}


// Actualizar los vertices de la malla segun las posiciones del los huesos del esqueleto
skmesh.prototype.updateMeshVertices = function () {
	//Precalcular la multiplicación para llevar a un vertice a Bone-Space y luego transformarlo segun el hueso
	//Estas matrices se envian luego al Vertex Shader para hacer skinning en GPU
	for (var i = 0; i < this.cant_bones; i++)
		mat4.multiply( this.bones[i].matFinal , this.bones[i].matInversePose , this.matBoneSpace[i]);
}



// Actualiza el cuadro actual de la animacion.
skmesh.prototype.updateAnimation = function (elapsed_time) {


	//Sumo el tiempo transcurrido
	this.currentTime += elapsed_time/1000.0;

	//Se termino la animacion
	if (this.currentTime > this.animationTimeLenght)
	{
		//Ver si hacer loop
		if (this.playLoop)
		{
			//Dejar el remanente de tiempo transcurrido para el proximo loop
			this.currentTime = this.currentTime % this.animationTimeLenght;
			//setSkleletonLastPose();
			//updateMeshVertices();
		}
		else
		{

			//TODO: Puede ser que haya que quitar este stopAnimation() y solo llamar al Listener (sin cargar isAnimating = false)
			//stopAnimation();
		}
	}

	//La animacion continua
	else
	{
		//Actualizar esqueleto y malla
		this.updateSkeleton();
		this.updateMeshVertices();
	}
}


// Actualiza la posicion de cada hueso del esqueleto segun sus KeyFrames de la animacion
skmesh.prototype.updateSkeleton = function () {

	var p_animacion = this.animacion[this.currentAnimation];
	for (var i = 0; i < this.cant_bones; i++)
	{
		//Tomar el frame actual para este hueso
		var boneFrames = p_animacion.bone_animation[i];
		if(boneFrames.cant_frames == 1)
			continue;		//Solo hay un frame, no hacer nada, ya se hizo en el init de la animacion

		//Obtener cuadro actual segun el tiempo transcurrido
		var currentFrameF = this.currentTime * this.frameRate;
		//Ve a que KeyFrame le corresponde
		var keyFrameIdx = this.getCurrentFrameBone(boneFrames, currentFrameF);
		this.currentFrame = keyFrameIdx;

		//Armar un intervalo entre el proximo KeyFrame y el anterior
		var p_frame1 = boneFrames.frame[keyFrameIdx - 1];
		var p_frame2 = boneFrames.frame[keyFrameIdx];

		//Calcular la cantidad que hay interpolar en base al la diferencia entre cuadros
		var framesDiff = p_frame2.nro_frame - p_frame1.nro_frame;
		var interpolationValue = (currentFrameF - p_frame1.nro_frame) / framesDiff;

		//Interpolar traslacion
		var t_x = (p_frame2.Position[0] - p_frame1.Position[0]) * interpolationValue + p_frame1.Position[0];
		var t_y = (p_frame2.Position[1] - p_frame1.Position[1]) * interpolationValue + p_frame1.Position[1];
		var t_z = (p_frame2.Position[2] - p_frame1.Position[2]) * interpolationValue + p_frame1.Position[2];

		//Interpolar rotacion con SLERP, la funcion SLERP es mia, interpola usando el asin (una cagada)
		// TODO: entiendo que debe haber alguna mas performante. Estudiar el tema. 
		var quatFrameRotation = QuaternionSlerp(p_frame1.Rotation, p_frame2.Rotation , interpolationValue);

		//Unir ambas transformaciones de este frame
		var frameMatrix = mat4.create();
		var T = mat4.create();
		mat4.identity(T);
		mat4.translate(T , [t_x,t_y,t_z]);
		var R = mat4.create();
		MatrixRotationQuaternion(quatFrameRotation,R)
		mat4.multiply(T , R , frameMatrix);		

		//Multiplicar por la matriz del padre, si tiene
		var parent_id = this.bones[i].parentId;
		if(parent_id!=-1)
			mat4.multiply(this.bones[parent_id].matFinal,frameMatrix, this.bones[i].matFinal);
		else
			this.bones[i].matFinal= frameMatrix;
	}
	
}

// Obtener el KeyFrame correspondiente a cada hueso segun el tiempo transcurrido
skmesh.prototype.getCurrentFrameBone = function(boneFrames, currentFrame)
{
	for (var i = 0; i < boneFrames.cant_frames; i++)
	{
		if (currentFrame < boneFrames.frame[i].nro_frame)
		{
			return i;
		}
	}
	return boneFrames.cant_frames - 1;
}

skmesh.prototype.initTextures = function () {

	this.texture_loaded = [];
	this.texture = [];
	for(var i=0;i<this.cant_subsets;++i)
	{
		this.texture[i] = gl.createTexture();
		this.texture_loaded[i] = false;
		var img = new Image();
		img.mesh = this;
		img.nro_textura = i;
		img.texture = this.texture[i];
		img.onload = function() { handleTextureLoaded3(this);};
		img.src = this.media_folder+this.subset[i].image_name;
		
		
	}
}

function handleTextureLoaded3(image) {
	gl.bindTexture(gl.TEXTURE_2D, image.texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	if(gl.getError()==gl.NO_ERROR)
	{
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		image.mesh.texture_loaded[image.nro_textura] = true;
	}
}

skmesh.prototype.render = function () {

	if(	!this.loaded )
		return;
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTangentBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTangentAttribute, this.vertexTangentBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBinormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexBinormalAttribute, this.vertexBinormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBlendWeightsBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexWeigthsAttribute, this.vertexBlendWeightsBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexblendIndicesBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexIndicesAttribute, this.vertexblendIndicesBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTexCoordsBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, this.vertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "matWorld"), false, this.matWorld);
	
	// hay que pasar las matrices de a una 
	for(var i=0;i<26;++i)
		gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "bonesMatWorldArray["+i.toFixed(0)+"]"), false, 
			this.matBoneSpace[i]);
	

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	
	var pos = 0;
	for(var i=0;i<this.cant_subsets;i++)
	{
		var cant_items = this.subset[i].cant_items * 3;
		if(cant_items>0 )
		{
			if(this.texture_loaded[i])
				gl.bindTexture(gl.TEXTURE_2D, this.texture[i]);
			
			gl.drawArrays(gl.TRIANGLES, pos, cant_items);
			pos += cant_items;
		}
	}
	
}


// helper quaternion
// https://en.wikipedia.org/wiki/Rotation_matrix
// por diferencias de convencion ,el angulo tiene que ir negativo!! 

function MatrixRotationQuaternion(q,m)
{
	var x = q[0];
	var y = q[1];
	var z = q[2];
	var w = -q[3];
	var n = w * w + x * x + y * y + z * z;
	var s = n == 0 ? 0 : 2 / n;
	var wx = s * w * x;
	var wy = s * w * y;
	var wz = s * w * z;
	var xx = s * x * x;
	var xy = s * x * y;
	var xz = s * x * z;
	var yy = s * y * y;
	var yz = s * y * z;
	var zz = s * z * z;
	
	m[0]=1-(yy+zz); 	m[1]=xy-wz;  		m[2]=xz+wy; 		m[3]=0;
	m[4]=xy+wz;			m[5]=1-(xx+zz);		m[6]=yz-wx;			m[7]=0;
	m[8]=xz-wy;			m[9]=yz+wx;			m[10]=1-(xx+yy);	m[11]=0;
	m[12]=0;			m[13]=0; 			m[14]=0; 			m[15]=1;
	
	/*
	[ 1 - (yy + zz)         xy - wz          xz + wy  ]
	[      xy + wz     1 - (xx + zz)         yz - wx  ]
	[      xz - wy          yz + wx     1 - (xx + yy) ]
	*/
}


// implemento interpolacion esferica, basado en esto: 
// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
function QuaternionSlerp(qa,qb,t)
{
	var qm = [0,0,0,0];
	var cosHalfTheta = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];

	if (cosHalfTheta < 0) {
		qm[0] = -qb[0]; qm[1] = -qb[1]; qm[2] = -qb[2] ; qm[3] = -qb[3];
		cosHalfTheta = -cosHalfTheta;
	} else {
		qm[0] = qb[0]; qm[1] = qb[1]; qm[2] = qb[2]; qm[3] = qb[3]; 
	}

	if ( Math.abs( cosHalfTheta ) >= 1.0 ) {

		qm[0] = qa[0]; qm[1] = qa[1]; qm[2] = qa[2]; qm[3] = qa[3]; 
		return qm;
	}

	var halfTheta = Math.acos( cosHalfTheta ),
	sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

	if ( Math.abs( sinHalfTheta ) < 0.001 ) {

		qm[0] = 0.5 * ( qa[0] + qb[0] );
		qm[1] = 0.5 * ( qa[1] + qb[1] );
		qm[2] = 0.5 * ( qa[2] + qb[2] );
		qm[3] = 0.5 * ( qa[3] + qb[3] );
		return qm;
	}

	var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
	ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

	qm[0] = ( qa[0] * ratioA + qm[0] * ratioB );
	qm[1] = ( qa[1] * ratioA + qm[1] * ratioB );
	qm[2] = ( qa[2] * ratioA + qm[2] * ratioB );
	qm[3] = ( qa[3] * ratioA + qm[3] * ratioB );

	return qm;

}

