import { Injectable } from '@angular/core';
import { AxesHelper, Vector3 } from 'three';

import { PerspectiveCameraService } from '../perspective-camera/perspective-camera.service';
import { SceneService } from '../scene/scene.service';
import { TrackballControlsService } from '../trackball-controls/trackball-controls.service';
import { TargetModel } from './target.model';

@Injectable({
  providedIn: 'root'
})
export class TargetService {
  private static readonly SCALE = 0.2; // 20%
  private static readonly STEP = 4;

  private _model: TargetModel;

  constructor(
    private _sceneService: SceneService,
    private _trackballControlsService: TrackballControlsService,
    private _perspectiveCameraService: PerspectiveCameraService
  ) {
    this._model = {
      axesHelper: new AxesHelper(TargetService.SCALE),
      distanceCameraTarget: 1,
      targetOnClick: null,
      cameraOnClick: null,
      stepper: TargetService.STEP
    };
  }

  public get model(): TargetModel {
    return this._model;
  }

  public create(myPoint: Vector3): void {
    this._model.axesHelper.translateX(myPoint.x);
    this._model.axesHelper.translateY(myPoint.y);
    this._model.axesHelper.translateZ(myPoint.z);
    this._sceneService.model.add(this._model.axesHelper);
  }

  public update(): void {
    this.updateAxesHelper();
    this.updateTarget();
  }

  public updateAxesHelper(): void {
    if (!this._model.distanceCameraTarget) {
      this._model.distanceCameraTarget =
        this._perspectiveCameraService.camera.position.distanceTo(
          this._trackballControlsService.model.controls.target
        );
    }
    const oldPosition = new Vector3().copy(this._model.axesHelper.position);
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
    const newScale =
      (TargetService.SCALE * dist) / this._model.distanceCameraTarget;
    this._model.axesHelper.scale.set(newScale, newScale, newScale);
  }

  public goToThisPosition(myClickPoint: Vector3): void {
    this._model.stepper = 0;
    this._model.targetOnClick = myClickPoint;
  }

  public updateTarget(): void {
    if (this._model.targetOnClick) {
      if (this._model.stepper < TargetService.STEP * 3) {
        this._setNewPositionForControlsTarget();
      } else {
        this._trackballControlsService.model.controls.target.copy(
          this._model.targetOnClick
        );
        this._trackballControlsService.model.target$.next(
          this._trackballControlsService.model.controls.target
        );
        this._model.targetOnClick = undefined;
      }
    }
  }

  private _setNewPositionForControlsTarget(): void {
    // vector between target to goto and controls target
    const displacementVector = new Vector3().subVectors(
      this._model.targetOnClick,
      this._trackballControlsService.model.controls.target
    );
    // divide this vector by 2 and add to previous controls target
    const newPositionForControlsTarget =
      this._trackballControlsService.model.controls.target
        .clone()
        .add(displacementVector.divideScalar(TargetService.STEP));
    // set new position for controls target
    this._trackballControlsService.model.controls.target.copy(
      newPositionForControlsTarget
    );
    // next value for controls target
    // this._trackballControlsService.model.target$.next(
    //  this._trackballControlsService.model.controls.target
    // );
    this._model.stepper++;
  }
}
