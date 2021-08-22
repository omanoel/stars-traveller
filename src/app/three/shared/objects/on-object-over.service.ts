import { Injectable } from '@angular/core';
import {
  BufferAttribute,
  BufferGeometry,
  EllipseCurve,
  Line,
  LineBasicMaterial,
  Object3D,
  Scene,
  Vector3
} from 'three';

import { ObjectOver } from '../../three-component.model';

@Injectable({
  providedIn: 'root'
})
export class OnObjectOverService {
  private static readonly ELLIPSIS_NAME = 'ellipsisName';

  previousPosition: Vector3 = new Vector3(0, 0, 0);
  color = 0xff0000;

  public initialize(scene: Scene): ObjectOver {
    const objectToDisplay = new Object3D();
    scene.add(objectToDisplay);
    return {
      objectIntersected: null,
      objectDisplay: objectToDisplay
    };
  }

  public update(objectOver: ObjectOver, target: Vector3): void {
    if (!objectOver.objectIntersected) {
      objectOver.objectDisplay.children = [];
      this.previousPosition = new Vector3(0, 0, 0);
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
    const material = new LineBasicMaterial({
      color: 0xfffff,
      transparent: true,
      opacity: 1
    });

    // Z axis
    const geometryZ = new BufferGeometry();
    const positions = new Float32Array(3 * 3); // 3 vertices per point
    positions.set([myPosition.x, myPosition.y, 0]);
    positions.set([myPosition.x, myPosition.y, myPosition.z], 3);
    positions.set([target.x, target.y, target.z], 6);
    geometryZ.setAttribute('position', new BufferAttribute(positions, 3));
    const lineZ = new Line(geometryZ, material);
    objectOver.objectDisplay.add(lineZ);
    //  ellipsis
    const radiusXY = Math.sqrt(
      myPosition.x * myPosition.x + myPosition.y * myPosition.y
    );
    const curveXY = new EllipseCurve(
      0,
      0, // ax, aY
      radiusXY,
      radiusXY, // xRadius, yRadius
      0,
      2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );
    // const pathXY = new Path(curveXY.getPoints(50));
    const geometryXY = new BufferGeometry().setFromPoints(
      curveXY.getPoints(50)
    );
    const ellipseXY = new Line(geometryXY, material);
    objectOver.objectDisplay.add(ellipseXY);
  }
}
