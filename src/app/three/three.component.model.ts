import { ElementRef } from '@angular/core';

import { PerspectiveCameraService } from '@app/services/three/camera/perspective-camera.service';
import { TrackballControlsService } from '@app/services/three/controls/trackball-controls.service';
import { RaycasterService } from '@app/services/three/raycaster/raycaster.service';
import { ReferentielService } from '@app/services/objects/referentiel/referentiel.service';
import { SceneService } from '@app/services/three/scene/scene.service';
import * as THREE  from 'three';

export interface ThreeComponentModel {
    perspectiveCameraService: PerspectiveCameraService;
    trackballControlsService: TrackballControlsService;
    renderer: THREE.WebGLRenderer;
    raycasterService: RaycasterService;
    sceneService: SceneService;
    referentielService: ReferentielService;
    element: ElementRef;
    currentIntersected?: any;
    height?: number;
    width?: number;
}