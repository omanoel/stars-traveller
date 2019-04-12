import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class RaycasterService {

    raycaster: THREE.Raycaster;

    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.linePrecision = 3;
    }

}
