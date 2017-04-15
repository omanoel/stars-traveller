import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class ReferentielService {

  object: THREE.PolarGridHelper;
  radius: number;

  constructor() { }

  initialize(camera) {
    this.radius = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    let polarGridHelper = new THREE.PolarGridHelper( 5 * 1e7, 16, 100, 64, 0x0000ff, 0x0000ff );
    polarGridHelper.position.y = 0;
    polarGridHelper.position.x = 0;
    polarGridHelper.name = 'referentiel';

    this.object = polarGridHelper;
  }

  getObject() {
    return this.object;
  }

}
