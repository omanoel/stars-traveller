import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class TargetService {

    objects: Array<THREE.Line> = [];
    color = 0xff0000;

    create(myScene: THREE.Scene, myPoint: THREE.Vector3) {
        for (const obj of this.objects) {
            myScene.remove(obj);
        }
        this.objects = [];
        const gap = 100;
        const material = new THREE.LineBasicMaterial({ color: this.color, transparent: true, opacity: 1 });
        // X axis
        const geometryX = new THREE.Geometry();
        geometryX.vertices.push(
            new THREE.Vector3( myPoint.x + gap, myPoint.y, myPoint.z ),
            new THREE.Vector3( myPoint.x - gap, myPoint.y, myPoint.z )
        );
        const lineX = new THREE.Line( geometryX, material );
        myScene.add(lineX);
        // Y axis
        const geometryY = new THREE.Geometry();
        geometryY.vertices.push(
            new THREE.Vector3( myPoint.x, myPoint.y + gap, myPoint.z ),
            new THREE.Vector3( myPoint.x, myPoint.y - gap, myPoint.z )
        );
        const lineY = new THREE.Line( geometryY, material );
        myScene.add(lineY);
        // Z axis
        const geometryZ = new THREE.Geometry();
        geometryZ.vertices.push(
            new THREE.Vector3( myPoint.x, myPoint.y, myPoint.z + gap ),
            new THREE.Vector3( myPoint.x, myPoint.y, myPoint.z - gap )
        );
        const lineZ = new THREE.Line( geometryZ, material );
        myScene.add(lineZ);
        this.objects.push(lineX);
        this.objects.push(lineY);
        this.objects.push(lineZ);
    }

    update(myNewPoint: THREE.Vector3): void {
        for (const line of this.objects) {
            const _oldPosition = Object.assign({}, line.position);
            line.translateX(myNewPoint.x - _oldPosition.x);
            line.translateY(myNewPoint.y - _oldPosition.y);
            line.translateZ(myNewPoint.z - _oldPosition.z);
        }
    }
}
