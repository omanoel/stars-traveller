import * as THREE from 'three';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RaycasterService {
  constructor() {
    // Empty
  }

  public initialize(): THREE.Raycaster {
    // TODO: find how to update this parameter
    // this.raycaster.linePrecision = 3;
    return new THREE.Raycaster();
  }
}
