import { Directive, Input } from '@angular/core';

import * as THREE from 'three';
import { FlyControls } from './flycontrols';

@Directive({ selector: '[appThreeFlyControls]' })
export class FlyControlsDirective {

    controls: FlyControls;

    setupControls(camera, renderer) {
        this.controls = new FlyControls();
        this.controls.init(camera, renderer.domElement);
        // this.controls.dragToLook = true;
        this.controls.movementSpeed = 100;
        this.controls.rollSpeed = Math.PI / 24;
    }

    updateControls(scene, camera, deltaClock: number) {
        this.controls.update(deltaClock);
    }

}
