import { Directive, Input } from '@angular/core';

import { TrackballControls } from './trackballcontrols';

@Directive({ selector: '[appTrackballControls]' })
export class TrackballControlsDirective {

    @Input() enabled = true;

    controls: TrackballControls;

    setupControls(camera, renderer) {
        this.controls = new TrackballControls();
        this.controls.init(camera, renderer.domElement);
        this.controls.enabled = this.enabled;
    }

    updateControls() {
        this.controls.update();
    }

}
