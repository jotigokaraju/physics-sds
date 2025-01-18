// Notes to Mr. Guest
// Commits will be made after the due date
// This is because I am trying to deploy my library online and make it public, so some minor changes will be neccessary. 

//Area is given in m^2, mass in kg, velocity in m/s, angle from horizontal, size in m, height in m
// Physics class models the behavior of an object (rock) interacting with forces like gravity, lift, drag, and water resistance
class Physics {

  // Constructor initializes the properties for the object.
  constructor(area, mass, velocity, angle, size, height) {

    this.g = 9.8; // Gravitational acceleration (m/s²)
    this.d = 0; // Distance rock initially goes into the water is set to zero.
    this.Cd = 1.0; // Drag coefficient (affects resistance of the object moving through air/water)
    this.Cl = 0.7; // Lift coefficient (affects the upward force on the object)
    this.rhoWater = 1000; // Density of water (kg/m³), used to calculate drag and lift forces.
    this.tiltAngle = 20; // Tilt angle the rock maintains during its movement (degrees)

    this.A = area; // Cross-sectional area of the object (m²)
    this.m = mass; // Mass of the rock (kg)
    this.angleAttack = angle; // Angle of attack for the rock's movement (degrees)

    this.velocity = velocity; // Initial velocity of the rock (m/s)
    this.Vx = this.vector(this.velocity, 'x'); // X-component of velocity
    this.Vz = this.vector(this.velocity, 'z'); // Z-component of velocity

    this.height = height; // The initial height of the rock (y-position)
    this.size = size; // Size of the rock (used to calculate lift and drag)
    this.position = createVector(0, this.height); // Initial position of the rock (starting at x=0, height)
    this.velocity = createVector(this.Vx, this.Vz); // Velocity vector (X and Z components)
    this.acceleration = createVector(0, -this.g); // Acceleration vector (gravity acting on the object)
  }

  // Method to update the position of the rock based on its velocity.
  updatePosition() {

    // If the rock hits the water (y position is below 0), check if it can skip (bounce).
    if (this.position.y < 0) {

      // Check if the rock can skip on the water (based on forces and velocities)
      if (this.canSkip()) {
        console.log('success') // Successful skip (bounce)
      } else {
        console.log('failure') // Failed to skip (bounce)
      }

    }

    // Update the position by adding the velocity to the current position
    this.position.add(this.velocity.x, this.velocity.y);
  }

  // Method to update the rock's velocity by adding the acceleration (gravity).
  updateVelocity() {
    this.velocity.add(this.acceleration); // Add acceleration to the velocity
  }

  // Method to calculate the velocity component in either X or Z direction.
  vector(velocity, type) {
    // If type is 'x', return the X-component of velocity using cosine of angle.
    if (type === 'x') {
      return Math.cos(this.degToRad(this.angleAttack)) * velocity;
    } else { // If type is 'z', return the Z-component of velocity using sine of angle.
      return Math.sin(this.degToRad(this.angleAttack)) * velocity;
    }
  }

  // Convert degrees to radians for trigonometric calculations.
  degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Calculate the Lift Force acting on the rock.
  liftForce() {
    // Lift Force = Cl * A * (0.5 * rho * velocity²), where rho is the density of water.
    return this.Cl * this.A * (0.5 * this.rhoWater * this.totalVelocity() ** 2);
  }

  // Calculate the Drag Force acting on the rock.
  dragForce() {
    // Drag Force = Cd * A * (0.5 * rho * velocity²), where rho is the density of water.
    return this.Cd * this.A * (0.5 * this.rhoWater * this.totalVelocity() ** 2);
  }

  // Calculate the force of gravity acting on the rock.
  gravityForce() {
    // Gravity Force = mass * gravitational acceleration.
    return this.m * this.g;
  }

  // Max depth (distance rock travels into the water).
  maxDepth() {
    let C = this.Cl * Math.cos(this.degToRad(this.tiltAngle)) - this.Cd * Math.sin(this.degToRad(this.tiltAngle));
    let w0 = Math.sqrt((C * this.rhoWater * this.velocity.x * this.velocity.x * this.velocity.x * this.size) / (2 * this.m * Math.sin(this.degToRad(this.tiltAngle))));
    let answer = (this.g / w0) * (1 + Math.sqrt(1 + ((this.velocity.y * w0 / this.g) ** 2)));
    this.d = answer;
  }

  // Calculate the Z-component (vertical) velocity after collision (bounce).
  postCollisionVz() {
    // Calculate net vertical force (gravity and drag are acting downward, lift upward).
    let netForce = (Math.cos(this.degToRad(20)) * this.liftForce() - Math.cos(this.degToRad(70)) * this.dragForce() - this.gravityForce());
    // Return the vertical velocity after collision using kinematic equation.
    return Math.sqrt((netForce * this.d) / (2 * this.m)); 
  }

  // Calculate the X-component (horizontal) velocity after collision (bounce).
  postCollisionVx() {
    // Calculate net horizontal force (lift and drag forces contribute).
    let netForce = Math.sin(this.degToRad(20)) * this.liftForce() + Math.sin(this.degToRad(70)) * this.dragForce();
    // Return the horizontal velocity after collision using kinematic equation.
    // We subtract because force is opposite direction. 
    return Math.sqrt(this.velocity.x * this.velocity.x + ((-1 * 2 * netForce) / (this.m)) * this.d * Math.tan(Math.degtoRad(Math.atan(this.velocity.x/this.velocity.y)));
  }

  // Method to check if the rock can "skip" on the water based on forces.
  canSkip() {
    // Calculate the net force in the vertical direction (gravity, lift, and drag).
    let netForce = Math.cos(this.degToRad(20)) * this.liftForce() - Math.cos(this.degToRad(70)) * this.dragForce() - this.gravityForce();
    this.maxDepth(); // Update depth value (currently fixed to 0.05).
    
    // Calculate the new velocities after collision (vertical and horizontal).
    let Vz = this.postCollisionVz();
    let Vx = this.postCollisionVx();

    // Log the calculated velocities for debugging.
    console.log(Vx);
    
    // Check if all conditions for a successful skip are met:
    // Lift force must be positive and horizontal velocity (Vx) must be positive.
    if (netForce > 0 && Vx > 0) {
      // Update the rock's velocity components based on post-collision velocities.
      this.velocity.x = Vx;
      this.velocity.y = Vz; 
      return true; // Successful skip (bounce).
    }
    
    // If any condition is not met, return failure.
    return false;
  }

  // Calculate the total velocity (magnitude) of the rock using Pythagorean theorem.
  totalVelocity() {
    return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
  }
}
