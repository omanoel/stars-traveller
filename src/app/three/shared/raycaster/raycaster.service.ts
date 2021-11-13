import { Injectable } from '@angular/core';
import { Raycaster } from 'three';

@Injectable({
  providedIn: 'root'
})
export class RaycasterService {
  //
  private _model: Raycaster;
  //
  constructor() {
    // TODO: find how to update this parameter
    // this.raycaster.linePrecision = 3;
    this._model = new Raycaster();
  }

  public get model(): Raycaster {
    return this._model;
  }
}
