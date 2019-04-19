import { Injectable } from '@angular/core';
import { TrackballControls } from 'three-trackballcontrols-ts';
import { PerspectiveCamera } from 'three';
import { StarsService } from '@app/services/objects/stars/stars.service';
import { Subject } from 'rxjs';

@Injectable()
export class TrackballControlsService {
    
    controls: TrackballControls;
    enabled = true;
    eventControls: string;
    target$: Subject<THREE.Vector3>;

    constructor() {
        this.target$ = new Subject<THREE.Vector3>();
    }

    setupControls(camera: PerspectiveCamera, renderer: any, starsService: StarsService) {
        this.controls = new TrackballControls(camera, renderer.domElement);
        this.controls.enabled = this.enabled;
        this.controls.addEventListener('end', (event) => {
            starsService.updateSpheresInScene(camera, this.controls.target);
            this.target$.next(this.controls.target);
        });
    }

    updateControls() {
        this.controls.update();
    }

}