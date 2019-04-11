import { Directive, Input } from '@angular/core';

import { TrackballControls } from 'three-trackballcontrols-ts';

@Directive({ selector: '[appTrackballControls]' })
export class TrackballControlsDirective {

    @Input() enabled = true;

    controls: TrackballControls;

    setupControls(camera, renderer) {
        this.controls = new TrackballControls(camera, renderer.domElement);
        this.controls.enabled = this.enabled;
    }

    updateControls() {
        this.controls.update();
    }

}
