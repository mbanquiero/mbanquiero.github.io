
var gl;
var time = 0;
var time_loc;
var LookFrom_loc;
var ViewDir_loc;
var MatView_loc;

var DX = 800.0;
var DY = 600.0;
var fov = Math.PI / 4.0;
var LookFrom = {x:-80, y:0, z:0};
var LookAt = {x:0, y:0, z:0};
var VUp = {x:0, y:1, z:0};
var viewDir = {x:1, y:0, z:0};
var viewU = {x:0, y:1, z:0};
var viewV = {x:0, y:0, z:1};
var cero = {x:0, y:0, z:0};


var vel_tras = 10;

var left_arrow = false;
var right_arrow = false;
var up_arrow = false;
var down_arrow = false;
var add_key = false;
var minus_key = false;
var shift_key = false;
var div_key = false;
var mul_key = false;

// div elements para dibujar texto
var statusbarNode;

function ProcessKey(e,b) 
{
	if(e.keyCode==38)
		up_arrow = b;
	else
	if(e.keyCode==40)
		down_arrow = b;
	else
	if(e.keyCode==39)
		right_arrow = b;
	else
	if(e.keyCode==37)
		left_arrow = b;
	else
	if(e.keyCode==107)
		add_key = b;
	else
	if(e.keyCode==109)
		minus_key = b;
	else
	if(e.keyCode==16)
		shift_key = b;
	else
	if(e.keyCode==111)
		div_key = b;
	else
	if(e.keyCode==106)
		mul_key = b;
}
	
function doKeyDown(e) 
{
	ProcessKey(e,true);
}

function doKeyUp(e) 
{
	ProcessKey(e,false);
}

function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}
function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}
	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}
	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}
var shaderProgram;
function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}
	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.vertexTexCoordsAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexCoords");
    gl.enableVertexAttribArray(shaderProgram.vertexTexCoordsAttribute);
	
	time_loc = gl.getUniformLocation(shaderProgram, "iGlobalTime");			
	ViewDir_loc = gl.getUniformLocation(shaderProgram, "iViewDir");
	LookFrom_loc = gl.getUniformLocation(shaderProgram, "iLookFrom");	
	
}

var fullScreenQuad;
var vertexTexCoordsBuffer;
function initBuffers() {
	var vertices = []
	var tx_coords = []
	var cant_v = 0;

	
	var t = 0;
	for ( var fIndx = -1.0; fIndx <= 1.0; fIndx+=0.01)
	{
		var TexIndex = fIndx;
		var s = (1-fIndx)/4.0 * 0.5;

		vertices[3*cant_v] = -1+s;
		vertices[3*cant_v+1] = -1+s;
		vertices[3*cant_v+2] = 0.0;
		tx_coords[3*cant_v] = -1;
		tx_coords[3*cant_v+1] = -1;
		tx_coords[3*cant_v+2] = TexIndex;
		++cant_v;
		
		vertices[3*cant_v] = 1-s;
		vertices[3*cant_v+1] = -1+s;
		vertices[3*cant_v+2] = 0.0;
		tx_coords[3*cant_v] = 1;
		tx_coords[3*cant_v+1] = -1;
		tx_coords[3*cant_v+2] = TexIndex;
		++cant_v;
		
		vertices[3*cant_v] = 1-s;
		vertices[3*cant_v+1] = 1-s;
		vertices[3*cant_v+2] = 0.0;
		tx_coords[3*cant_v] = 1;
		tx_coords[3*cant_v+1] = 1;
		tx_coords[3*cant_v+2] = TexIndex;
		++cant_v;
		

		vertices[3*cant_v] = -1+s;
		vertices[3*cant_v+1] = -1+s;
		vertices[3*cant_v+2] = 0.0;
		tx_coords[3*cant_v] = -1;
		tx_coords[3*cant_v+1] = -1;
		tx_coords[3*cant_v+2] = TexIndex;
		++cant_v;
		
		vertices[3*cant_v] = 1-s;
		vertices[3*cant_v+1] = 1-s;
		vertices[3*cant_v+2] = 0.0;
		tx_coords[3*cant_v] = 1;
		tx_coords[3*cant_v+1] = 1;
		tx_coords[3*cant_v+2] = TexIndex;
		++cant_v;

		
		vertices[3*cant_v] = -1+s;
		vertices[3*cant_v+1] = 1-s;
		vertices[3*cant_v+2] = 0.0;
		tx_coords[3*cant_v] = -1;
		tx_coords[3*cant_v+1] = 1;
		tx_coords[3*cant_v+2] = TexIndex;
		++cant_v;	
	}
	
	// posiciones de los vertices
	fullScreenQuad = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, fullScreenQuad);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	fullScreenQuad.itemSize = 3;
	fullScreenQuad.numItems = cant_v;
	
	// coordenadas de textura
	vertexTexCoordsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tx_coords), gl.STATIC_DRAW);
	vertexTexCoordsBuffer.itemSize = 3;
	vertexTexCoordsBuffer.numItems = cant_v;
	
	
}


function textureFromPixelArray(gl, dataTypedArray, width, height) {
var tx = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tx);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, dataTypedArray);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);	
return tx;

}	

var texture;

function initProcTexture() {

	var dataTypedArray = new Uint8Array(4096*4096*3);
	for(var k=0;k<256;++k)
	for(var j=0;j<256;++j)
	for(var i=0;i<256;++i)
	{
		var fil = (k % 16) | 0;
		var col = (k / 16) | 0;
		var x = col * 256 + i;
		var y = fil * 256 + j;
		var pos = (y*4096 + x)*3;
	
		var s = 0;
		if(Math.abs(k-128)<10 && Math.abs(j-128)<10 && Math.abs(i-128)<10)
			s = 255;
		dataTypedArray[pos] = s;
		dataTypedArray[pos+1] = s;
		dataTypedArray[pos+2] = s;
	}
	
	
	texture = textureFromPixelArray(gl,dataTypedArray,4096,4096);
}	


function setTexturePixel(i,j,k,data)
{
	var fil = (k % 16) | 0;
	var col = (k / 16) | 0;
	var x = col * 256 + i;
	var y = fil * 256 + j;
	var pos = (y*4096 + x)*3;
	data[pos] = 255;
	data[pos+1] = 0;
	data[pos+2] = 255;
}

function setTextureBox(x,y,z,dr,data)
{
	for(var i= -dr ; i<dr ;i++)
	for(var j= -dr ; j<dr ;j++)
	for(var k= -dr ; k<dr ;k++)
		setTexturePixel(x+i , y+j , z+k , data);
}

function initTexture() {

	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'webgl_texturevr/raw/mri-head.raw', true);
	//xhr.open('GET', 'raw/tooth.raw', true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = function(e) {
	var uInt8Array = new Uint8Array(this.response); // this.response == uInt8Array.buffer
	var dataTypedArray = new Uint8Array(4096*4096*3);
	var t = 0;
	for(var k=0;k<256;++k)
	for(var j=0;j<256;++j)
	for(var i=0;i<256;++i)
	{
		var voxel = uInt8Array[t++];
		var fil = (k % 16) | 0;
		var col = (k / 16) | 0;
		var x = col * 256 + i;
		var y = fil * 256 + j;
		var pos = (y*4096 + x)*3;
		dataTypedArray[pos] = voxel;
		dataTypedArray[pos+1] = voxel;
		dataTypedArray[pos+2] = voxel;
	}
	texture = textureFromPixelArray(gl,dataTypedArray,4096,4096);
	};

	xhr.send();		
	
}	

function drawScene() {
	var elapsed_time = 0.1;
	time+=elapsed_time;
	var vel_rot = elapsed_time*1.5;
	
	if(right_arrow)
	{
		rotar(LookFrom , cero,viewU,-vel_rot);
		rotar(viewV, cero, viewU,-vel_rot);
	}
	if(left_arrow)
	{
		rotar(LookFrom , cero,viewU,vel_rot);
		rotar(viewV, cero, viewU,vel_rot);
	}


	if(up_arrow)
	{
		rotar(LookFrom , cero,viewV,vel_rot);
		rotar(viewU, cero, viewV,vel_rot);
	}

	if(down_arrow)
	{
		rotar(LookFrom , cero,viewV,-vel_rot);
		rotar(viewU, cero, viewV,-vel_rot);
	}
	
	
//	statusbarNode.nodeValue = "   Posicion = [" + LookFrom.x.toFixed(0) +"," + LookFrom.y.toFixed(0)+","+LookFrom.z.toFixed(0)+"]"
	statusbarNode.nodeValue = " "

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.bindBuffer(gl.ARRAY_BUFFER, fullScreenQuad);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, fullScreenQuad.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordsBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, vertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.uniform1f (time_loc, time);  

	// Camara
	var N = substract(LookAt , LookFrom);
	normalize(N);
	var V = cross(N,VUp);
	normalize(V);
	var U = cross(V,N);
	gl.uniform3f (ViewDir_loc, N.x,N.y,N.z);  
	gl.uniform3f (LookFrom_loc, LookFrom.x , LookFrom.y , LookFrom.z);  
	
    var matView = mat4.create();
	mat4.identity(matView);
//	mat4.translate(matView , [1, 1, 1]);
	//mat4.scale(matView , [0.5,0.5,0.5]);

	var matRotacion = [
			N.x , N.y , N.z , 0 , 
			viewU.x , viewU.y , viewU.z , 0 , 
			viewV.x , viewV.y , viewV.z , 0 , 
			0 	 ,	0 ,	    0, 	1
			];
	
    mat4.multiply( matView,matRotacion,matView);
	//mat4.translate(matView , [-1, -1, -1]);
	
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "matView"), false, matView);

	// textura
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);		
	
	gl.drawArrays(gl.TRIANGLES, 0, fullScreenQuad.numItems);
}

function webGLStart() {
	var canvas = document.getElementById("my_canvas");
	initGL(canvas);
	initShaders();
	initBuffers();
	initTexture();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.disable(gl.DEPTH_TEST);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);		
	gl.enable(gl.BLEND);
	
	document.addEventListener( "keydown", doKeyDown, true);
	document.addEventListener( "keyup", doKeyUp, true);

	// Status bar
	var el = document.getElementById("status_bar");
	statusbarNode = document.createTextNode("");
	el.appendChild(statusbarNode);

	// render loop
	setInterval(drawScene, 100);
}


