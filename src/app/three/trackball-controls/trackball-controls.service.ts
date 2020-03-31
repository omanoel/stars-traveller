import { Subject } from 'rxjs';
import * as THREE from 'three';
import { TrackballControls } from 'three-trackballcontrols-ts';

import { Injectable } from '@angular/core';
import { StarsService } from '@app/three/stars/stars.service';

import { ThreeComponentModel } from '../three.component.model';
import { TrackballControlsModel } from './trackball-controls.model';

@Injectable({ providedIn: 'root' })
export class TrackballControlsService {
  constructor(private _starsService: StarsService) {
    // Empty
  }

  public initialize(): TrackballControlsModel {
    return {
      controls: null,
      enabled: true,
      eventControls: null,
      target$: new Subject<THREE.Vector3>()
    };
  }

  public setupControls(threeComponentModel: ThreeComponentModel): void {
    threeComponentModel.trackballControls.controls = new TrackballControls(
      threeComponentModel.camera,
      threeComponentModel.renderer.domElement
    );
    threeComponentModel.trackballControls.controls.enabled =
      threeComponentModel.trackballControls.enabled;
    threeComponentModel.trackballControls.controls.addEventListener(
      'end',
      event => {
        // this._starsService.updateProximityStars(threeComponentModel);
        threeComponentModel.trackballControls.target$.next(
          threeComponentModel.trackballControls.controls.target
        );
      }
    );
  }

  public updateControls(trackballControls: TrackballControlsModel): void {
    trackballControls.controls.update();
  }
}
