import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ThreeComponent } from './three.component';

import { ReferentielService } from '../services/referentiel.service';

import { RendererDirective } from './renderer.directive';
import { SceneDirective } from './scene.directive';
import { TrackballControlsDirective } from './controls/trackball.directive';
import { FakeStarsDirective } from './objects/fakestars.directive';
import { PerspectiveCameraDirective } from './cameras/perspective-camera.directive';
import { PointLightDirective } from './lights/point-light.directive';

import { CircleComponent } from './objects/circle.component';
import { SphereComponent } from './objects/sphere.component';
import { TextureComponent } from './objects/texture.component';
import { SkyboxComponent } from './objects/skybox.component';

@NgModule({
    declarations: [
        ThreeComponent,
        RendererDirective,
        SceneDirective,
        PerspectiveCameraDirective,
        PointLightDirective,
        CircleComponent,
        SphereComponent,
        TextureComponent,
        SkyboxComponent,
        TrackballControlsDirective,
        FakeStarsDirective
    ],
    providers: [
        ReferentielService
    ],
    imports: [BrowserModule],
    exports: [ThreeComponent]
})
export class ThreeModule { }
