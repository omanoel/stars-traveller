import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ThreeComponent } from './three.component';
import { RendererDirective } from './renderer.directive';
import { SceneDirective } from './scene.directive';

import { PerspectiveCameraComponent } from './cameras/perspective-camera.component';
import { PointLightComponent } from './lights/point-light.component';

import { FlyControlsDirective } from './controls/fly.directive';
import { FakeStarsDirective } from './objects/fakestars.directive';

import { CircleComponent } from './objects/circle.component';
import { ReferentielService } from '../services/referentiel.service';
import { SphereComponent } from './objects/sphere.component';
import { TextureComponent } from './objects/texture.component';
import { SkyboxComponent } from './objects/skybox.component';

@NgModule({
  declarations: [
    ThreeComponent,
    RendererDirective,
    SceneDirective,
    PerspectiveCameraComponent,
    PointLightComponent,
    CircleComponent,
    SphereComponent,
    TextureComponent,
    SkyboxComponent,
    FlyControlsDirective,
    FakeStarsDirective
  ],
  providers: [
    ReferentielService
  ],
  imports: [BrowserModule],
  exports: [ThreeComponent]
})
export class ThreeModule { }
