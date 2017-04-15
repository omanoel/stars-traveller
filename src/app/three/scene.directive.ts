import { Directive, ContentChild, ContentChildren, AfterContentInit } from '@angular/core';
import * as THREE from 'three';

import { PerspectiveCameraComponent } from './cameras/perspective-camera.component';
import { PointLightComponent } from './lights/point-light.component';

import { ReferentielService } from '../services/referentiel.service';
import { TextureComponent } from './objects/texture.component';
import { FakeStarsDirective } from './objects/fakestars.directive';

@Directive({ selector: '[appThreeScene]' })
export class SceneDirective implements AfterContentInit {

  @ContentChild(PerspectiveCameraComponent) cameraComp: any;
  @ContentChildren(PointLightComponent) lightComps: any;

  @ContentChildren(TextureComponent) textureComps: any;
  @ContentChildren(FakeStarsDirective) fakeStarsDir: any;

  scene: THREE.Scene = new THREE.Scene();
  fog: THREE.FogExp2;

  referentielService: ReferentielService = new ReferentielService();

  get referentiel() {
    return this.referentielService.getObject();
  }
  get camera() {
    return this.cameraComp.camera;
  }

  ngAfterContentInit() {
    //this.camera.lookAt(this.scene.position);
    this.camera.position.y = 100;
    this.camera.position.z = 100;
    //this.fog =  new THREE.FogExp2( 0xffffff, 0.015 );
   this.scene.add(this.camera);

    const meshes = [
      ...this.lightComps.toArray(),
      ...this.textureComps.toArray(),
      ...this.fakeStarsDir.toArray()
    ];

    this.referentielService.initialize(this.camera);
    this.scene.add(this.referentiel);

    for (let mesh of meshes) {
      if(mesh.object) {
        this.scene.add(mesh.object);
      } else if (mesh.attachScene) {
        mesh.attachScene(this.scene);
      } else if (mesh.objects) {
        for (let obj of mesh.objects) {
          this.scene.add(obj);
        }
      }
    }
  }

}
