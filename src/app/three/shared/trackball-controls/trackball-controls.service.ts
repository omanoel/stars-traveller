import { Subject } from 'rxjs';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

import { Injectable } from '@angular/core';

import { PerspectiveCameraService } from '../perspective-camera/perspective-camera.service';
import { TrackballControlsModel } from './trackball-controls.model';
import { Vector3 } from 'three';

@Injectable({ providedIn: 'root' })
export class TrackballControlsService {
  //
  private _model: TrackballControlsModel;
  //
  constructor(private _perspectiveCameraService: PerspectiveCameraService) {
    // Empty
    this._model = {
      controls: null,
      enabled: true,
      eventControls: null,
      target$: new Subject<Vector3>()
    };
  }

  public get model(): TrackballControlsModel {
    return this._model;
  }

  public setupControls(canvasElement: HTMLCanvasElement): void {
    this._model.controls = new TrackballControls(
      this._perspectiveCameraService.camera,
      canvasElement
    );
    this._model.controls.enabled = this._model.enabled;
    this._model.controls.addEventListener('end', () => {
      // this._starsService.updateProximityStars(threeComponentModel);
      // this._model.target$.next(this._model.controls.target);
    });
  }

  public updateControls(): void {
    this._model.controls.update();
  }
}
