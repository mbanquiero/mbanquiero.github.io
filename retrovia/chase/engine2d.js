var elapsed_time = 1/60;
var canvas;
var ctx;
var mouse_x = 0;
var mouse_y = 0;




function Mesh(image , x,y,dx,dy,an) {
    this.img = image;
	this.pos = new Vector2(x,y);
	this.dx = dx;
	this.dy = dy;
	this.an = an;
	this.transform = new Matrix3(	1,0,0,
									0,1,0,
									0,0,1);
};


Mesh.prototype.setTransform = function (mat) {
	this.transform = mat;
}

Mesh.prototype.render = function () {
	
	var mat = this.transform;
	// Seteo la trans. en el canvas
	ctx.setTransform(mat.m11,mat.m21,mat.m12,mat.m22,mat.m13,mat.m23);
	// Dibujo el mesh
	ctx.drawImage(this.img,0,0);
};



function scene() {
    this.meshes = [];
	this.backgroundColor = 'rgba(0,0,0,255)';
};


scene.prototype.addMesh = function(image,x,y,dx,dy,an) {
	var rta = new Mesh(image,x,y,dx,dy,an);
	this.meshes.push(rta);
	return rta;
	
}

scene.prototype.render = function () {
	
	// borro la pantalla de todo el canvas
	ctx.fillStyle = this.backgroundColor;
	ctx.fillRect(0,0,2000,2000);
	
	ctx.save();
	for(var i=0;i<this.meshes.length;++i)
		this.meshes[i].render();
	ctx.restore();
}
	
var canvas;
var ctx;
var _scene;
var mouse_x , mouse_y;
	
	
function RenderLoop() 
{
	if (canvas.getContext)
	{
		// update
		for(var i=0;i<_scene.meshes.length;++i)
			Update(_scene.meshes[i]);
		
		// render global
		Render();
		
	}
}

function onMouseMove() 
{
	mouse_x = window.event.offsetX;
	mouse_y = window.event.offsetY;
}


function main()
{   
	canvas = document.getElementById('mycanvas');
	document.addEventListener( "mousemove", onMouseMove, true);
	document.addEventListener( "keydown", doKeyDown, true);
	document.addEventListener( "keyup", doKeyUp, true);
	ctx = canvas.getContext('2d');
	// inicio la escena
	_scene  = new scene()
	// inicializo el teclado
	InitKeyboard();
	// inicia el juego
	Init();
	// inicio el render loop
	setInterval(RenderLoop, elapsed_time * 1000);
} 

	
	