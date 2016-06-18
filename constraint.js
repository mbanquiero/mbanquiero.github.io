function Constraint(A,B,dist)
{
    // cuerpos que intervienen
    this.A = A;
    this.B = B;
    // pivotes: x defecto el pto se toma en el centro de gravedad
    this.ptA = [0,0,0];
    this.ptB = [0,0,0];;
    // parametros del constraint
    this.dist = dist;
    this.angle = 0;
    // propiedades
    this.joint = false;
    this.exact_distance = false;
    this.angle_constraint = false;
    this.visible = 1;
};

function CreateDistanceConstraint(A, ptA, B, ptB) {
    var c = new Constraint(A, B, 0);
    c.ptA = ptA;
    c.ptB = ptB;
	
    var r = [	ptA[0] + A.position[0] - ptB[0] - B.position[0], 
				ptA[1] + A.position[1] - ptB[1] - B.position[1],
				ptA[2] + A.position[2] - ptB[2] - B.position[2]];
			
    c.dist = Math.sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2]);
    c.joint = false;
    c.angle_constraint = false;
    c.exact_distance = true;
    c.visible = 1;
    return c;
}


Constraint.prototype.Solve = function()
{
    // proyecto los puntos a world space y obtengo la distancia entre los pivotes
    var A = this.A;
    var B = this.B;

    var rA = this.ptA;
    var rB = this.ptB;

    // vector entre los puntos de contacto en world space
    // vr = B->position + rB - A->position - rA;
    var vr = [	-rA[0] - A.position[0] + rB[0] + B.position[0], 
				-rA[1] - A.position[1] + rB[1] + B.position[1],
				-rA[2] - A.position[2] + rB[2] + B.position[2]];
		

    // verifico si cumple con el constraint
    var dreal = Math.sqrt(vr[0]*vr[0] + vr[1]*vr[1] + vr[2]*vr[2]);
    if(this.exact_distance)
    {
        if(Math.abs(dreal-this.dist)<0.5)
            return;         // verifica el constraint, vuelvo
    }
    else
    {
        if(dreal<this.dist)
            return;         // verifica el constraint, vuelvo
    }
	
    // no se cumple la restriccion de distancia
	// direccion de A hacia B normalizada
	var inv_dreal = 1/dreal;
    var n = [vr[0]*inv_dreal ,vr[1]*inv_dreal ,vr[2]*inv_dreal ];
    var D = dreal - this.dist;			// distancia que tengo que corregir 
    var dt = fixed_dt;			// en cierta cantidad de tiempo

    // Para ello genero una fuerza ficticia en direccion hacia el objeto B, que compense la velocidad relativa de A
    // y lo haga dirigirse hacia B 
    // tomo solo la parte de la velocidad de A sobre la linea de fuerza n
    // uso la velocidad relativa entre ambos cuerpos
    var velRel = [A.velocity[0] - B.velocity[0] ,A.velocity[1] - B.velocity[1] , A.velocity[2] - B.velocity[2] ];
    var j = D/dt - (n[0]*velRel[0] + n[1]*velRel[1] + n[2]*velRel[2]);
    j*=0.5;

    // distribuyo el impulso de forma proporcional a las masas de ambos cuerpos
    var t;
    if(A.inverseMass==0)
        t = 0;
    else
    if(B.inverseMass==0)
        t = 1;
    else
        t = A.mass / (A.mass + B.mass);

    var jA = j * t;
    var jB = j * (1-t);


    // Primero corrijo el Objeto A
    var nA = [n[0]*jA ,n[1]*jA,n[2]*jA];
    if(A.inverseMass!=0)
	{
        A.velocity[0]+=nA[0];
        A.velocity[1]+=nA[1];
        A.velocity[2]+=nA[2];
	}

    var nB = [-n[0]*jB ,-n[1]*jB,-n[2]*jB];
	
    if(B.inverseMass!=0)
	{
        B.velocity[0]+=nB[0];
        B.velocity[1]+=nB[1];
        B.velocity[2]+=nB[2];
	}
    
}
