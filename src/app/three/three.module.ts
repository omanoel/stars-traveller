import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ThreeComponentService } from './three.component.service';
import { PerspectiveCameraService } from '@app/three/perspective-camera/perspective-camera.service';
import { TrackballControlsService } from '@app/three/trackball-controls/trackball-controls.service';
import { RaycasterService } from './raycaster/raycaster.service';
import { SceneService } from '@app/three/scene/scene.service';
import { TargetService } from '@app/three/target/target.service';
import { StarsService } from './stars/stars.service';
import { ReferentielService } from './referentiel/referentiel.service';
import { CatalogService } from '@app/three/stars/catalog.service';
import { OnStarOverService } from '@app/three/stars/on-star-over.service';

import { ThreeComponent } from './three.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { FormPositionComponent } from './form-position/form-position.component';
import { MapComponent } from './map/map.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
  declarations: [
    ThreeComponent,
    MapComponent,
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
  exports: [ThreeComponent]
})
export class ThreeModule {}
