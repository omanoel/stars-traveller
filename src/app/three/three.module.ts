import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ThreeComponentService } from './three.component.service';
import { PerspectiveCameraService } from '@app/services/three/camera/perspective-camera.service';
import { TrackballControlsService } from '@app/services/three/controls/trackball-controls.service';
import { RaycasterService } from '../services/three/raycaster/raycaster.service';
import { SceneService } from '@app/services/three/scene/scene.service';
import { TargetService } from '@app/services/objects/target/target.service';
import { StarsService } from '../services/objects/stars/stars.service';
import { ReferentielService } from '../services/objects/referentiel/referentiel.service';
import { CatalogService } from '@app/services/objects/stars/catalog.service';
import { OnStarOverService } from '@app/services/objects/stars/on-star-over.service';

import { ThreeComponent } from './three.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { FormPositionComponent } from './form-position/form-position.component';

@NgModule({
    declarations: [
        ThreeComponent,
        TooltipComponent,
        FormPositionComponent
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
        CatalogService,
        OnStarOverService
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    exports: [
        ThreeComponent
    ]
})
export class ThreeModule { }
