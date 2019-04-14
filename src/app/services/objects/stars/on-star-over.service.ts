import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class OnStarOverService {

    star: THREE.Object3D;
    ELLIPSIS_NAME = 'ellipsisName';
    overObject: THREE.Object3D = new THREE.Object3D();
    previousPosition: THREE.Vector3 = new THREE.Vector3(0,0,0);
    color = 0xff0000;

    initialize(scene: THREE.Scene): void {
        
        this.overObject = new THREE.Object3D();
        scene.add(this.overObject);
        
    }

    update(): void {
        if (!this.star) {
            this.overObject.children = [];
            this.previousPosition = new THREE.Vector3(0,0,0);
            return;
        }
        const myPosition = this.star.position;
        if (myPosition.x === this.previousPosition.x && 
            myPosition.y === this.previousPosition.y && 
            myPosition.z === this.previousPosition.z) {
            return;
        }
        this.previousPosition.copy(myPosition);
        const material = new THREE.LineBasicMaterial({ color: 0xfffff, transparent: true, opacity: 1 });

        // Z axis
        const geometryZ = new THREE.Geometry();
        geometryZ.vertices.push(
            new THREE.Vector3( myPosition.x, myPosition.y, myPosition.z ),
            new THREE.Vector3( myPosition.x, myPosition.y, 0 )
        );
        const lineZ = new THREE.Line( geometryZ, material );
        this.overObject.add(lineZ);
        //  ellipsis
        const radiusXY = Math.sqrt(myPosition.x * myPosition.x + myPosition.y * myPosition.y);
        const curveXY = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            radiusXY, radiusXY,  // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        // const pathXY = new THREE.Path(curveXY.getPoints(50));
        const geometryXY = new THREE.Geometry().setFromPoints(curveXY.getPoints(50));
        const ellipseXY = new THREE.Line(geometryXY, material);
        this.overObject.add(ellipseXY);

    }

}
