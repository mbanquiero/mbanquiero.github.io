function Body()
{
    this.position = [0,0,0];
    this.velocity = [0,0,0];
    this.force = [0,0,0];

    // mass properties
    this.mass = 1;						// masa
    this.inverseMass = 1;				// inversa de la masa = 1/masa
    this.gravity_factor = 1;            // como reacciona a la gravedad (x defecto 1)
		
}

//-------------------------------------------------------------------------------
// Dinamica del cuerpo rigido
//-------------------------------------------------------------------------------
Body.prototype.ApplyForce = function (f)
{
    this.force[0] += f[0];
    this.force[1] += f[1];
    this.force[2] += f[2];
}

Body.prototype.ApplyImpulse = function (impulse, contactPoint)
{
    if (this.inverseMass == 0) {
        if (this.mass == 0)
            return;     // es un cuerpo estatico
    }

    // ecuacion (1)
    // F = ma
    this.velocity[0] += impulse[0] * this.inverseMass;
    this.velocity[1] += impulse[1] * this.inverseMass;
    this.velocity[2] += impulse[2] * this.inverseMass;
}

Body.prototype.SetStatic = function()
{
    this.mass = 0;
    this.inverseMass = 0;
}

Body.prototype.SetStaticEquilibrium = function () {
    this.inverseMass = 0;
}

Body.prototype.SetMass = function (m)
{
    this.mass = m;
    this.inverseMass = m!=0 ? 1/m: 0;
}

Body.prototype.IntegrateForces = function( dt)
{
    if(this.inverseMass == 0)
        return;

    //	velocity += (force * inverseMass + gravity*gravity_factor) * dt;

    // aceleracion que producen las fuerzas externas
	var acel = [this.force[0] * this.inverseMass , this.force[1] * this.inverseMass , this.force[2] * this.inverseMass];
    // aceleracion de la gravedad
	var acel_grav = [gravity[0] * this.gravity_factor , gravity[1] * this.gravity_factor , gravity[2] * this.gravity_factor];
    // aceleracion neta
    var acel_neta = [acel[0] + acel_grav[0] ,acel[1] + acel_grav[1]  , acel[2] + acel_grav[2]];
    // integro la aceleracion lineal
    this.velocity[0] += acel_neta[0] * dt;
    this.velocity[1] += acel_neta[1] * dt;
    this.velocity[2] += acel_neta[2] * dt;
}

Body.prototype.IntegrateVelocity = function(dt)
{
    if(this.inverseMass == 0)
        return;

    this.position[0] += this.velocity[0] * dt;
    this.position[1] += this.velocity[1] * dt;
    this.position[2] += this.velocity[2] * dt;
	

}

