import * as THREE from 'three';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RaycasterService {
  //
  private _model: THREE.Raycaster;
  //
  constructor() {
    // TODO: find how to update this parameter
    // this.raycaster.linePrecision = 3;
    this._model = new THREE.Raycaster();
  }

  public get model(): THREE.Raycaster {
    return this._model;
  }
}
