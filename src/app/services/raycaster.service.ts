import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class RaycasterService {

    raycaster = new THREE.Raycaster();

    constructor() { }

    initialize() {

        this.raycaster.linePrecision = 3;
    }
}
