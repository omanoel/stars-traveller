import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThreeComponentService } from './three.component.service';
import { PerspectiveCameraService } from '@app/services/three/camera/perspective-camera.service';
import { TrackballControlsService } from '@app/services/three/controls/trackball-controls.service';
import { RaycasterService } from '../services/three/raycaster/raycaster.service';
import { SceneService } from '@app/services/three/scene/scene.service';
import { TargetService } from '@app/services/objects/target/target.service';
import { StarsService } from '../services/objects/stars/stars.service';
import { ReferentielService } from '../services/objects/referentiel/referentiel.service';

import { ThreeComponent } from './three.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { CatalogService } from '@app/services/objects/stars/catalog.service';

@NgModule({
    declarations: [
        ThreeComponent,
        TooltipComponent
    ],
    providers: [
        ThreeComponentService,
        PerspectiveCameraService,
        TrackballControlsService,
        RaycasterService,
        SceneService,
        ReferentielService,
        TargetService,
        StarsService,
        CatalogService
    ],
    imports: [
        CommonModule
    ],
    exports: [
        ThreeComponent
    ]
})
export class ThreeModule { }
