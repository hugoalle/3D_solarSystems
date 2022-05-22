import {SphereGeometry, Mesh, MeshStandardMaterial, Vector3} from 'three'

export default class Planete {

    constructor(param) { 

        this.materialValues = {
            color: param.color || 0xffffff,
            metalness: param.metalness || 0,
            roughness: param.roughness || 0,
            transparent: param.transparent || false,
            opacity: param.opacity || 1,
            emissive: param.emissive || 0x000000,
            emissiveIntensity: param.emissiveIntensity || 0
        }

        this.moveAble = param.moveAble !== undefined ? param.moveAble : true;

        // physical attributes
        this.radius = param.radius || 5;
        this.mass = param.mass || 50;
        const v0 = param.v0 || [0, 0, 0];
        this.speed = new Vector3( v0[0], v0[1], v0[2]);

        // 3D display attributes
        this.geometry = new SphereGeometry( this.radius, 32, 16);
        this.material = new MeshStandardMaterial( this.materialValues );
        this.mesh = new Mesh(this.geometry, this.material);

        this.rate = 0.025;
        //flag in case the planete should be destroyed because of a collision
        this.mustBeDestroyed = false;
    }

    getMesh() {
        return this.mesh;
    }

    translateX( tx ) {
        this.mesh.translateX( tx );
    }
    translateY( ty ) {
        this.mesh.translateY( ty );
    }
    translateZ( tz ) {
        this.mesh.translateZ( tz );
    }

    translate(tx, ty, tz) {
        this.translateX(tx);
        this.translateY(ty);
        this.translateZ(tz);
    }

    setSpeed(vx, vy, vz) {
        this.speed.set(vx, vy, vz);
    }

    increaseSpeed(vx, vy, vz) {
        this.speed.set(vx + this.speed.x, vy + this.speed.y, vz+this.speed.z);
    }

    getActualPosition() {
        return new Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
    }

    setSpeedRate( rate = 0.025) {
        this.speedRate = 0.025;
    }

    setSpeedToOrbitAround(planete, beginAxis) {
        const r = this.getActualPosition().distanceTo( planete.getActualPosition());
        const G = 1000;
        const M = planete.mass;
        const speedNorm = Math.sqrt((G*M)/r);
        console.log(` norme de la vitesse ${speedNorm} `);
        switch (beginAxis) {
            case "x":
                this.setSpeed(speedNorm, 0, 0);
                break;
            case 'y':
                this.setSpeed(0, speedNorm, 0);
                break;
            case 'z':
                this.setSpeed(0, 0, speedNorm);
            default:
                this.setSpeed(0, 0, speedNorm);
                break;
        }
        
        //very important : 
        //the planete in orbit around another one has also the speed of the planete it is orbiting around
        this.increaseSpeed(planete.speed.x, planete.speed.y, planete.speed.z);
    }

    updatePosition(listOfPlanetes) {

        // Calculate total force applied to the planete
        const totalForce = new Vector3(0, 0, 0);
        const actualPosition = this.getActualPosition()

        for (const planete of listOfPlanetes) {
           
            const planetePositon = planete.getActualPosition();
            const forceVector = new Vector3().subVectors(planetePositon, actualPosition);
            const distanceBtwn = forceVector.length();

            if (Object.is(this, planete)) {
                continue;
            }

            // this.radius + planete.radius is the distance where the two collide
            if (distanceBtwn > (this.radius + planete.radius)) {
                
                //avoid d to get close to 0 and that the force go to infinity
                const d = (distanceBtwn < this.radius) ? this.radius : distanceBtwn;

                forceVector.normalize();
                //const normForce = planete.g*(this.mass);
                const G = 1000;
                const normForce = G*(planete.mass)*(this.mass)/(d**2);
                forceVector.multiplyScalar(normForce);

                totalForce.add( forceVector );
            }

            //Collision, if the planete has smaller mass, the planet is destroyed
            if (distanceBtwn <= (this.radius + planete.radius)) {
                if (this.mass < planete.mass) {
                    this.mustBeDestroyed = true;
                }
            }

        }

        //a for acceleration
        const a = new Vector3().copy(totalForce);
        a.divideScalar(this.mass);
        
        // Calculate new position
        const v = this.speed;

        const rate = this.rate;

        const vx_next = a.x*rate + v.x
        const vy_next = a.y*rate + v.y
        const vz_next = a.z*rate + v.z

        // OM(X + dt) = v(x)*dt + OM(X)
        const tx = v.x*rate
        const ty = v.y*rate
        const tz = v.z*rate
        
        //set new position and new speed
        if (this.moveAble) {
            this.translate(tx, ty, tz);
            this.setSpeed(vx_next, vy_next, vz_next);
        }
    }

    destroy(parent) {
        this.material.dispose();
        this.geometry.dispose();
        parent.remove(this.mesh);
    }

}
