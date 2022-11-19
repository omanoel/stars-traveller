import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { PerspectiveCameraService } from '../perspective-camera/perspective-camera.service';
import { PovControlsModel } from './pov-controls.model';
import { Clock, Vector3 } from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { TargetService } from '../target/target.service';

@Injectable({ providedIn: 'root' })
export class PovControlsService {
  //
  private _model: PovControlsModel;
  //
  constructor(
    private _perspectiveCameraService: PerspectiveCameraService,
    private _targetService: TargetService
  ) {
    // Empty
    this._model = {
      controls: null,
      enabled: false,
      clock: undefined,
      eventControls: null,
      target$: new Subject<Vector3>(),
      initialCameraPosition: undefined,
      initialTargetPosition: undefined
    };
  }

  public get model(): PovControlsModel {
    return this._model;
  }

  public setupControls(canvasElement: HTMLCanvasElement, clock: Clock): void {
    this._model.controls = new FirstPersonControls(
      this._perspectiveCameraService.camera,
      canvasElement
    );
    this._model.controls.movementSpeed = 0;
    this._model.controls.lookSpeed = 0.01;
    this._model.controls.enabled = this._model.enabled;
    this._model.clock = clock;
  }

  public enableControls(): void {
    this._model.initialTargetPosition = new Vector3().copy(
      this._targetService.model.axesHelper.position
    );
    this._model.initialCameraPosition = new Vector3().copy(
      this._perspectiveCameraService.camera.position
    );
    this._perspectiveCameraService.camera.position.copy(
      this._model.initialTargetPosition
    );
    this._model.controls.lookAt(this._model.initialCameraPosition, 0, 0);
  }

  public disableControls(): void {
    this._targetService.model.axesHelper.position.copy(
      this._model.initialTargetPosition
    );
    this._perspectiveCameraService.camera.position.copy(
      this._model.initialCameraPosition
    );
  }

  public updateControls(): void {
    //
    this._model.controls.enabled = this._model.enabled;
    this._model.controls.update(this._model.clock.getDelta());
  }
}
