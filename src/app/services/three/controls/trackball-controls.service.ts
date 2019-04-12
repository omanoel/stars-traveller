import { Injectable } from '@angular/core';
import { TrackballControls } from 'three-trackballcontrols-ts';
import { PerspectiveCamera } from 'three';

@Injectable()
export class TrackballControlsService {
    
    controls: TrackballControls;
    enabled = true;

    constructor() {
        
    }

    setupControls(camera: PerspectiveCamera, renderer: any) {
        this.controls = new TrackballControls(camera, renderer.domElement);
        this.controls.enabled = this.enabled;
    }

    updateControls() {
        this.controls.update();
    }

}