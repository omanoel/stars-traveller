import * as THREE from 'three';

import { Injectable } from '@angular/core';
import { ThreeComponentModel } from '@app/three/three.component.model';

import { TargetModel } from './target.model';

@Injectable({
  providedIn: 'root',
})
export class TargetService {
  private static readonly SCALE = 0.2;
  private static readonly EPSILON = 0.01;
  private static readonly STEP = 20;

  constructor() {
    // Empty
  }

  public initialize(): TargetModel {
    return {
      axesHelper: new THREE.AxesHelper(TargetService.SCALE),
      ratio: 1,
      targetOnClick: null,
      cameraOnClick: null,
      stepper: TargetService.STEP,
    };
  }

  public create(
    target: TargetModel,
    myScene: THREE.Scene,
    myPoint: THREE.Vector3
  ): void {
    target.axesHelper.translateX(myPoint.x);
    target.axesHelper.translateY(myPoint.y);
    target.axesHelper.translateZ(myPoint.z);
    myScene.add(target.axesHelper);
  }

  public updateAxesHelper(
    target: TargetModel,
    myNewPoint: THREE.Vector3,
    camera: THREE.Camera
  ): void {
    if (!target.ratio) {
      target.ratio = camera.position.distanceTo(myNewPoint);
    }
    const oldPosition = new THREE.Vector3().copy(target.axesHelper.position);
    target.axesHelper.translateX(myNewPoint.x - oldPosition.x);
    target.axesHelper.translateY(myNewPoint.y - oldPosition.y);
    target.axesHelper.translateZ(myNewPoint.z - oldPosition.z);
    const dist = camera.position.distanceTo(myNewPoint);
    const newScale = (TargetService.SCALE * dist) / target.ratio;
    target.axesHelper.scale.set(newScale, newScale, newScale);
  }

  public setObjectsOnClick(
    threeComponentModel: ThreeComponentModel,
    myClickPoint: THREE.Vector3
  ): void {
    this._setStepper(threeComponentModel, myClickPoint);
    threeComponentModel.target.targetOnClick = myClickPoint;
    const dist = myClickPoint.distanceTo(new THREE.Vector3(0, 0, 0));
    if (dist < 1) {
      threeComponentModel.target.cameraOnClick = new THREE.Vector3(1, 1, 1);
    } else {
      const ratio = (dist + 1) / dist;
      threeComponentModel.target.cameraOnClick = myClickPoint
        .clone()
        .multiplyScalar(ratio);
    }
  }

  public refreshObjectsOnClick(threeComponentModel: ThreeComponentModel): void {
    const gap = threeComponentModel.scale > 1 ? 10 : 1;
    if (threeComponentModel.target.targetOnClick) {
      if (
        threeComponentModel.target.targetOnClick.distanceTo(
          threeComponentModel.trackballControls.controls.target
        ) >
        TargetService.EPSILON * gap
      ) {
        this._getNewPosition(threeComponentModel);
      } else {
        threeComponentModel.trackballControls.controls.target.copy(
          threeComponentModel.target.targetOnClick
        );
        threeComponentModel.trackballControls.target$.next(
          threeComponentModel.trackballControls.controls.target
        );
        threeComponentModel.camera.position.copy(
          threeComponentModel.target.cameraOnClick
        );
        threeComponentModel.camera.up = new THREE.Vector3(0, 0, 1);
        threeComponentModel.target.targetOnClick = null;
      }
    }
  }

  private _setStepper(
    threeComponentModel: ThreeComponentModel,
    myClickPoint: THREE.Vector3
  ): void {
    let step = threeComponentModel.trackballControls.controls.target
      .clone()
      .distanceTo(myClickPoint);
    if (step > TargetService.STEP) {
      step = TargetService.STEP;
    }
    threeComponentModel.target.stepper = 5 + Math.floor(step);
  }

  private _getNewPosition(threeComponentModel: ThreeComponentModel): void {
    // displacement for target
    const displacementForTarget = new THREE.Vector3().subVectors(
      threeComponentModel.target.targetOnClick,
      threeComponentModel.trackballControls.controls.target
    );
    const newPositionForTarget = threeComponentModel.trackballControls.controls.target
      .clone()
      .add(
        displacementForTarget.divideScalar(threeComponentModel.target.stepper)
      );
    threeComponentModel.trackballControls.controls.target.copy(
      newPositionForTarget
    );
    threeComponentModel.trackballControls.target$.next(
      threeComponentModel.trackballControls.controls.target
    );
    // displacement for camera
    const displacementForCamera = new THREE.Vector3().subVectors(
      threeComponentModel.target.cameraOnClick,
      threeComponentModel.camera.position
    );
    const newPositionForCamera = threeComponentModel.camera.position
      .clone()
      .add(
        displacementForCamera.divideScalar(threeComponentModel.target.stepper)
      );
    threeComponentModel.camera.position.copy(newPositionForCamera);
    // rotation for camera
    const upForCamera = new THREE.Vector3().subVectors(
      new THREE.Vector3(0, 0, 1),
      threeComponentModel.camera.up
    );
    const newUpForCamera = threeComponentModel.camera.up
      .clone()
      .add(upForCamera.divideScalar(threeComponentModel.target.stepper));
    threeComponentModel.camera.up.copy(newUpForCamera);
  }
}
