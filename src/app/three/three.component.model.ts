import { ElementRef } from '@angular/core';
import * as THREE  from 'three';

import { PerspectiveCameraService } from '@app/services/three/camera/perspective-camera.service';
import { TrackballControlsService } from '@app/services/three/controls/trackball-controls.service';
import { RaycasterService } from '@app/services/three/raycaster/raycaster.service';
import { ReferentielService } from '@app/services/objects/referentiel/referentiel.service';
import { SceneService } from '@app/services/three/scene/scene.service';
import { StarsService } from '@app/services/objects/stars/stars.service';
import { TargetService } from '@app/services/objects/target/target.service';
import { StarOver } from '@app/utils/interfaces';
import { OnStarOverService } from '@app/services/objects/stars/on-star-over.service';

export interface ThreeComponentModel {
    perspectiveCameraService: PerspectiveCameraService;
    trackballControlsService: TrackballControlsService;
    renderer: THREE.WebGLRenderer;
    raycasterService: RaycasterService;
    sceneService: SceneService;
    referentielService: ReferentielService;
    targetService: TargetService;
    starsService: StarsService;
    onStarOverService: OnStarOverService;
    element: ElementRef;
    mouse: THREE.Vector2;
    myStarOver: StarOver;
    currentIntersected?: any;
    height?: number;
    width?: number;
}