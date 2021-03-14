import * as THREE from 'three';

import { Injectable } from '@angular/core';

import { ObjectOver } from '../three.component.model';

@Injectable({
  providedIn: 'root'
})
export class OnObjectOverService {
  private static readonly ELLIPSIS_NAME = 'ellipsisName';

  previousPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  color = 0xff0000;

  public initialize(scene: THREE.Scene): ObjectOver {
    const objectToDisplay = new THREE.Object3D();
    scene.add(objectToDisplay);
    return {
      objectIntersected: null,
      objectDisplay: objectToDisplay
    };
  }

  public update(objectOver: ObjectOver): void {
    if (!objectOver.objectIntersected) {
      objectOver.objectDisplay.children = [];
      this.previousPosition = new THREE.Vector3(0, 0, 0);
      return;
    }
    const myPosition = objectOver.objectIntersected.parent.position;
    if (
      myPosition.x === this.previousPosition.x &&
      myPosition.y === this.previousPosition.y &&
      myPosition.z === this.previousPosition.z
    ) {
      return;
    }
    this.previousPosition.copy(myPosition);
    const material = new THREE.LineBasicMaterial({
      color: 0xfffff,
      transparent: true,
      opacity: 1
    });

    // Z axis
    const geometryZ = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3); // 3 vertices per point
    positions[0] = myPosition.x;
    positions[1] = myPosition.y;
    positions[2] = myPosition.z;
    positions[3] = myPosition.x;
    positions[4] = myPosition.y;
    positions[5] = 0;
    geometryZ.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const lineZ = new THREE.Line(geometryZ, material);
    objectOver.objectDisplay.add(lineZ);
    //  ellipsis
    const radiusXY = Math.sqrt(
      myPosition.x * myPosition.x + myPosition.y * myPosition.y
    );
    const curveXY = new THREE.EllipseCurve(
      0,
      0, // ax, aY
      radiusXY,
      radiusXY, // xRadius, yRadius
      0,
      2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );
    // const pathXY = new THREE.Path(curveXY.getPoints(50));
    const geometryXY = new THREE.BufferGeometry().setFromPoints(
      curveXY.getPoints(50)
    );
    const ellipseXY = new THREE.Line(geometryXY, material);
    objectOver.objectDisplay.add(ellipseXY);
  }
}
