
function add(u , v)
{
	return {x: u.x + v.x , y:u.y + v.y , z:u.z + v.z};	
}


function substract(u , v)
{
	return {x: u.x - v.x , y:u.y - v.y , z:u.z - v.z};	
}

function mul(u , k)
{
	return {x: u.x*k , y:u.y*k , z:u.z*k};	
}

function dot(u , v)
{
	return u.x*v.x+u.y*v.y+u.z*v.z;	
}

function cross( u , v)
{
	return { x:u.y*v.z-u.z*v.y , y: u.z*v.x-u.x*v.z , z:u.x*v.y-u.y*v.x};
}

function length(u)
{
	return Math.sqrt(u.x*u.x + u.y*u.y + u.z*u.z);	
}

function normalize(u)
{
	var len = length(u);
	u.x /= len;	
	u.y /= len;	
	u.z /= len;	
}

function reflect(i, n) {

    // v = i - 2 * dot(i, n) * n
    return add(i, mul(n, -2 * dot(i, n)));
}

function saturate(x) {
    if (x < 0)
        x = 0;
    else
    if (x > 1)
        x = 1;

    return x;
}

// rotacion con respecto a un eje arbitrario
function rotar( A ,o, eje, theta)
{
	var x = A.x;
	var y = A.y;
	var z = A.z;
	var a = o.x;
	var b = o.y;
	var c = o.z;
	var u = eje.x;
	var v = eje.y;
	var w = eje.z;

	var u2 = u*u;
	var v2 = v*v;
	var w2 = w*w;
	var cosT = Math.cos(theta);
	var sinT = Math.sin(theta);
	var l2 = u2 + v2 + w2;
	var l =  Math.sqrt(l2);

	if(l2 < 0.000000001)		// el vector de rotacion es casi nulo
		return;

	var xr = a*(v2 + w2) + u*(-b*v - c*w + u*x + v*y + w*z) 
		+ (-a*(v2 + w2) + u*(b*v + c*w - v*y - w*z) + (v2 + w2)*x)*cosT
		+ l*(-c*v + b*w - w*y + v*z)*sinT;
	xr/=l2;

	var yr = b*(u2 + w2) + v*(-a*u - c*w + u*x + v*y + w*z) 
		+ (-b*(u2 + w2) + v*(a*u + c*w - u*x - w*z) + (u2 + w2)*y)*cosT
		+ l*(c*u - a*w + w*x - u*z)*sinT;
	yr/=l2;

	var zr = c*(u2 + v2) + w*(-a*u - b*v + u*x + v*y + w*z) 
		+ (-c*(u2 + v2) + w*(a*u + b*v - u*x - v*y) + (u2 + v2)*z)*cosT
		+ l*(-b*u + a*v - v*x + u*y)*sinT;
	zr/=l2;

	A.x = xr;
	A.y = yr;
	A.z = zr;
}


function RotateX(an)
{
	var c = Math.cos(an);
	var s = Math.sin(an);
    var m = mat4.create();
	m[0] = 1;	m[1] = 0; 	m[2] = 0;	m[3] = 0;
	m[4] = 0;	m[5] = c; 	m[6] = -s;	m[7] = 0;
	m[8] = 0;	m[9] = s; 	m[10] = c;	m[11] = 0;
	m[12] = 0;	m[13] = 0; 	m[14] = 0;	m[15] = 1;
	return m;
}

function RotateY( an)
{
	var c = Math.cos(an);
	var s = Math.sin(an);
    var m = mat4.create();
	m[0] = c;	m[1] = 0; 	m[2] = s;	m[3] = 0;
	m[4] = 0;	m[5] = 1; 	m[6] = 0;	m[7] = 0;
	m[8] = -s;	m[9] = 0; 	m[10] = c;	m[11] = 0;
	m[12] = 0;	m[13] = 0; 	m[14] = 0;	m[15] = 1;
	return m;

}

function RotateZ( an)
{
	var c = Math.cos(an);
	var s = Math.sin(an);
    var m = mat4.create();
	m[0] = c;	m[1] = -s; 	m[2] = 0;	m[3] = 0;
	m[4] = s;	m[5] = c; 	m[6] = 0;	m[7] = 0;
	m[8] = 0;	m[9] = 0; 	m[10] = 1;	m[11] = 0;
	m[12] = 0;	m[13] = 0; 	m[14] = 0;	m[15] = 1;
	return m;
}

