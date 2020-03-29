import { Injectable } from '@angular/core';
import * as THREE from 'three';

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
