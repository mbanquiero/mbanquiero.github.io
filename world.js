function World()
{
    // tiempo global
    this.time = 0;

    // cuerpos rigidos 
    this.m_bodyCount = 0;
    this.bodies = [];

    // restricciones 
    this.m_constraintCount = 0;
    this.constraints = [];
}

World.prototype.Update = function(elapsed_time)
{

    // Integrar fuerzas primer parte
    for(var i = 0; i < this.m_bodyCount; ++i)
        this.bodies[i].IntegrateForces( elapsed_time/2.);
		
    // Integrar velocidades
    for(var i = 0; i < this.m_bodyCount; ++i)
        this.bodies[i].IntegrateVelocity(  elapsed_time );

    // Integrar fuerzas segunda parte
    for(var i = 0; i < this.m_bodyCount; ++i)
        this.bodies[i].IntegrateForces( elapsed_time/2.);

    // Limpiar todas las fuerzas, pues ya fueron integradas
	for(var i = 0; i < this.m_bodyCount; ++i)
    {
        this.bodies[i].force = [0,0,0];
    }

    // Solve constrains
    for(var j = 0; j < 5; ++j)
        for(var i = 0; i < this.m_constraintCount; ++i)
            this.constraints[i].Solve();

    // avanzo el tiempo global
    this.time += elapsed_time;

}

World.prototype.Clear = function()
{
    this.m_bodyCount = 0;
    this.m_constraintCount = 0;
}

World.prototype.AddBody = function( x, y , z)
{
    var b = this.bodies[this.m_bodyCount] = new Body();
	b.position = [x,y,z];
    b.id = this.m_bodyCount++;
    return b;
}


// 
// Body *A,Body *B,float dist
World.prototype.AddConstraint = function (A, B, dist) {

    return this.constraints[this.m_constraintCount++] = new Constraint(A, B, dist);
}

World.prototype.AddDistanceConstraint = function(A,ptA , B,ptB)
{
    return this.constraints[this.m_constraintCount++] = CreateDistanceConstraint(A, ptA, B,ptB);
}

World.prototype.AddJointConstraint = function (A, B) {

    var c = this.constraints[this.m_constraintCount++] = new CreateDistanceConstraint(A, [0,0,0], B, [0,0,0]);
    c.joint = true;
    c.exact_distance = true;
    c.angle_constraint = false;
    c.visible = 2;
    return c;
}


