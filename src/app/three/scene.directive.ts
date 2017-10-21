import { Directive, ContentChild, ContentChildren, AfterContentInit } from '@angular/core';
import * as THREE from 'three';

import { PerspectiveCameraDirective } from './cameras/perspective-camera.directive';
import { PointLightDirective } from './lights/point-light.directive';

import { ReferentielService } from '../services/referentiel.service';
import { SphereComponent } from './objects/sphere.component';
import { TextureComponent } from './objects/texture.component';
import { FakeStarsDirective } from './objects/fakestars.directive';

@Directive({ selector: '[appThreeScene]' })
export class SceneDirective implements AfterContentInit {

    @ContentChild(PerspectiveCameraDirective) cameraDir: any;
    @ContentChildren(PointLightDirective) lightDir: any;

    @ContentChildren(TextureComponent) textureComps: any;
    @ContentChildren(SphereComponent) sphereComps: any;
    @ContentChildren(FakeStarsDirective) fakeStarsDir: any;

    scene: THREE.Scene = new THREE.Scene();
    fog: THREE.FogExp2;

    referentielService: ReferentielService = new ReferentielService();

    get referentiel() {
        return this.referentielService.getObjects();
    }
    get camera() {
        return this.cameraDir.camera;
    }

    ngAfterContentInit() {
        //this.camera.lookAt(this.scene.position);
        this.camera.position.y = 1;
        this.camera.position.z = 1;
        //this.fog =  new THREE.FogExp2( 0xffffff, 0.015 );
        this.scene.add(this.camera);

        const meshes = [
            ...this.lightDir.toArray(),
            ...this.textureComps.toArray(),
            ...this.fakeStarsDir.toArray()
        ];

        this.referentielService.initialize(this.camera);
        for (const obj of this.referentielService.getObjects()) {
            this.scene.add(obj);
        }

        for (const mesh of meshes) {
            console.log(mesh);
            if (mesh.object) {
                this.scene.add(mesh.object);
            } else if (mesh.attachScene) {
                mesh.attachScene(this.scene);
            } else if (mesh.objects) {
                for (const obj of mesh.objects) {
                    this.scene.add(obj);
                }
            }
        }
    }

}
