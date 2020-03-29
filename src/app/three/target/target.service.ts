import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ThreeComponentModel } from '@app/three/three.component.model';
import { TargetModel } from './target.model';

@Injectable({
  providedIn: 'root'
})
export class TargetService {
  private static readonly SCALE = 0.2;
  private static readonly EPSILON = 1e-3;
  private static readonly STEP = 10;

  constructor() {
    // Empty
  }

  public initialize(): TargetModel {
    return {
      axesHelper: new THREE.AxesHelper(TargetService.SCALE),
      ratio: 1,
      targetOnClick: null,
      cameraOnClick: null
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

  update(
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

  public updateOnClick(
    threeComponentModel: ThreeComponentModel,
    myClickPoint: THREE.Vector3
  ): void {
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

  public refresh(threeComponentModel: ThreeComponentModel): void {
    if (threeComponentModel.target.targetOnClick) {
      if (
        threeComponentModel.target.targetOnClick.distanceTo(
          threeComponentModel.trackballControls.controls.target
        ) > TargetService.EPSILON
      ) {
        this.getNewPosition(threeComponentModel);
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

  getNewPosition(threeComponentModel: ThreeComponentModel): void {
    // displacement for target
    const displacementForTarget = new THREE.Vector3().subVectors(
      threeComponentModel.target.targetOnClick,
      threeComponentModel.trackballControls.controls.target
    );
    const newPositionForTarget = threeComponentModel.trackballControls.controls.target
      .clone()
      .add(displacementForTarget.divideScalar(TargetService.STEP));
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
      .add(displacementForCamera.divideScalar(TargetService.STEP));
    threeComponentModel.camera.position.copy(newPositionForCamera);
    // rotation for camera
    const upForCamera = new THREE.Vector3().subVectors(
      new THREE.Vector3(0, 0, 1),
      threeComponentModel.camera.up
    );
    const newUpForCamera = threeComponentModel.camera.up
      .clone()
      .add(upForCamera.divideScalar(TargetService.STEP));
    threeComponentModel.camera.up.copy(newUpForCamera);
  }
}
