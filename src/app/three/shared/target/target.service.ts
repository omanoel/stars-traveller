import * as THREE from 'three';

import { Injectable } from '@angular/core';
import { ThreeComponentModel } from '@app/three/three-component.model';

import { TargetModel } from './target.model';
import { TrackballControlsService } from '../trackball-controls/trackball-controls.service';
import { PerspectiveCameraService } from '../perspective-camera/perspective-camera.service';
import { SceneService } from '../scene/scene.service';

@Injectable({
  providedIn: 'root'
})
export class TargetService {
  private static readonly SCALE = 0.2;
  private static readonly EPSILON = 0.01;
  private static readonly STEP = 20;

  private _model: TargetModel;

  constructor(
    private _sceneService: SceneService,
    private _trackballControlsService: TrackballControlsService,
    private _perspectiveCameraService: PerspectiveCameraService
  ) {
    this._model = {
      axesHelper: new THREE.AxesHelper(TargetService.SCALE),
      ratio: 1,
      targetOnClick: null,
      cameraOnClick: null,
      stepper: TargetService.STEP
    };
  }

  public get model(): TargetModel {
    return this._model;
  }

  public create(myPoint: THREE.Vector3): void {
    this._model.axesHelper.translateX(myPoint.x);
    this._model.axesHelper.translateY(myPoint.y);
    this._model.axesHelper.translateZ(myPoint.z);
    this._sceneService.model.add(this._model.axesHelper);
  }

  public updateAxesHelper(): void {
    if (!this._model.ratio) {
      this._model.ratio =
        this._perspectiveCameraService.camera.position.distanceTo(
          this._trackballControlsService.model.controls.target
        );
    }
    const oldPosition = new THREE.Vector3().copy(
      this._model.axesHelper.position
    );
    this._model.axesHelper.translateX(
      this._trackballControlsService.model.controls.target.x - oldPosition.x
    );
    this._model.axesHelper.translateY(
      this._trackballControlsService.model.controls.target.y - oldPosition.y
    );
    this._model.axesHelper.translateZ(
      this._trackballControlsService.model.controls.target.z - oldPosition.z
    );
    const dist = this._perspectiveCameraService.camera.position.distanceTo(
      this._trackballControlsService.model.controls.target
    );
    const newScale = (TargetService.SCALE * dist) / this._model.ratio;
    this._model.axesHelper.scale.set(newScale, newScale, newScale);
  }

  public setObjectsOnClick(myClickPoint: THREE.Vector3): void {
    this._setStepper(myClickPoint);
    this._model.targetOnClick = myClickPoint;
    const dist = myClickPoint.distanceTo(new THREE.Vector3(0, 0, 0));
    if (dist < 1) {
      this._model.cameraOnClick = new THREE.Vector3(1, 1, 1);
    } else {
      const ratio = (dist + 1) / dist;
      this._model.cameraOnClick = myClickPoint.clone().multiplyScalar(ratio);
    }
  }

  public refreshObjectsOnClick(threeComponentModel: ThreeComponentModel): void {
    const gap = threeComponentModel.mainModel.scale > 1 ? 10 : 1;
    if (this._model.targetOnClick) {
      if (
        this._model.targetOnClick.distanceTo(
          this._trackballControlsService.model.controls.target
        ) >
        TargetService.EPSILON * gap
      ) {
        this._getNewPosition();
      } else {
        this._trackballControlsService.model.controls.target.copy(
          this._model.targetOnClick
        );
        this._trackballControlsService.model.target$.next(
          this._trackballControlsService.model.controls.target
        );
        this._perspectiveCameraService.camera.position.copy(
          this._model.cameraOnClick
        );
        this._perspectiveCameraService.camera.up = new THREE.Vector3(0, 0, 1);
        this._model.targetOnClick = undefined;
      }
    }
  }

  private _setStepper(myClickPoint: THREE.Vector3): void {
    let step = this._trackballControlsService.model.controls.target
      .clone()
      .distanceTo(myClickPoint);
    if (step > TargetService.STEP) {
      step = TargetService.STEP;
    }
    this._model.stepper = 5 + Math.floor(step);
  }

  private _getNewPosition(): void {
    // displacement for target
    const displacementForTarget = new THREE.Vector3().subVectors(
      this._model.targetOnClick,
      this._trackballControlsService.model.controls.target
    );
    const newPositionForTarget =
      this._trackballControlsService.model.controls.target
        .clone()
        .add(displacementForTarget.divideScalar(this._model.stepper));
    this._trackballControlsService.model.controls.target.copy(
      newPositionForTarget
    );
    this._trackballControlsService.model.target$.next(
      this._trackballControlsService.model.controls.target
    );
    // displacement for camera
    const displacementForCamera = new THREE.Vector3().subVectors(
      this._model.cameraOnClick,
      this._perspectiveCameraService.camera.position
    );
    const newPositionForCamera = this._perspectiveCameraService.camera.position
      .clone()
      .add(displacementForCamera.divideScalar(this._model.stepper));
    this._perspectiveCameraService.camera.position.copy(newPositionForCamera);
    // rotation for camera
    const upForCamera = new THREE.Vector3().subVectors(
      new THREE.Vector3(0, 0, 1),
      this._perspectiveCameraService.camera.up
    );
    const newUpForCamera = this._perspectiveCameraService.camera.up
      .clone()
      .add(upForCamera.divideScalar(this._model.stepper));
    this._perspectiveCameraService.camera.up.copy(newUpForCamera);
  }
}
