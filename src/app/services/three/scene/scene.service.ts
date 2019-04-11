import { Injectable } from '@angular/core';

import * as THREE from 'three';

@Injectable()
export class SceneService {

    scene: THREE.Scene;
    
    constructor() {
        this.scene = new THREE.Scene();
    }
}