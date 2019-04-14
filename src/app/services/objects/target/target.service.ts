import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class TargetService {

    SCALE = 0.2;
    axesHelper: THREE.AxesHelper;
    ratio: number;
    
    constructor() {
        this.axesHelper = new THREE.AxesHelper( this.SCALE );
    }

    create(myScene: THREE.Scene, myPoint: THREE.Vector3) {
        this.axesHelper.translateX(myPoint.x);
        this.axesHelper.translateY(myPoint.y);
        this.axesHelper.translateZ(myPoint.z);
        myScene.add( this.axesHelper );
    }

    update(myNewPoint: THREE.Vector3, camera: THREE.Camera): void {
        if (!this.ratio) {
            this.ratio = camera.position.distanceTo(myNewPoint);
        }
        const oldPosition = new THREE.Vector3().copy(this.axesHelper.position);
        this.axesHelper.translateX(myNewPoint.x - oldPosition.x);
        this.axesHelper.translateY(myNewPoint.y - oldPosition.y);
        this.axesHelper.translateZ(myNewPoint.z - oldPosition.z);
        const dist = camera.position.distanceTo(myNewPoint);
        const newScale = this.SCALE * dist / this.ratio;
        this.axesHelper.scale.set(newScale, newScale, newScale);
    }
}
