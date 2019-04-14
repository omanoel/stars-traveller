import { Injectable } from '@angular/core';
import { TrackballControls } from 'three-trackballcontrols-ts';
import { PerspectiveCamera } from 'three';
import { StarsService } from '@app/services/objects/stars/stars.service';

@Injectable()
export class TrackballControlsService {
    
    controls: TrackballControls;
    enabled = true;
    eventControls: string;

    constructor() {
        
    }

    setupControls(camera: PerspectiveCamera, renderer: any, starsService: StarsService) {
        this.controls = new TrackballControls(camera, renderer.domElement);
        this.controls.enabled = this.enabled;
        this.controls.addEventListener('end', (event) => {
            starsService.updateSpheresInScene(camera, this.controls.target);
        });
    }

    updateControls() {
        this.controls.update();
    }

}