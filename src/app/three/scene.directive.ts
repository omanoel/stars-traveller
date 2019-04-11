import { Directive, ContentChild, ContentChildren, AfterContentInit } from '@angular/core';
import * as THREE from 'three';

import { PerspectiveCameraDirective } from './cameras/perspective-camera.directive';
import { PointLightDirective } from './lights/point-light.directive';

import { ReferentielService } from '../services/referentiel.service';
import { StarsService } from '../services/stars.service';

import { SphereComponent } from './objects/sphere.component';
import { TextureComponent } from './objects/texture.component';
import { FakeStarsDirective } from './objects/fakestars.directive';

@Directive({ selector: '[appScene]' })
export class SceneDirective implements AfterContentInit {

    @ContentChild(PerspectiveCameraDirective) cameraDir: any;
    @ContentChildren(PointLightDirective) lightDir: any;

    @ContentChildren(TextureComponent) textureComps: any;
    @ContentChildren(SphereComponent) sphereComps: any;
    @ContentChildren(FakeStarsDirective) fakeStarsDir: any;

    scene: THREE.Scene = new THREE.Scene();
    parentTransform = new THREE.Object3D();
    positionIntersected = new THREE.Object3D();
    fog: THREE.FogExp2;

    referentielService: ReferentielService = new ReferentielService();
    starsService: StarsService = new StarsService();

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

        this.starsService.initialize();

        const meshes = [
            ...this.lightDir.toArray(),
            ...this.textureComps.toArray(),
            /*...this.fakeStarsDir.toArray()*/
        ];

        this.referentielService.initialize(this.camera);
        for (const obj of this.referentielService.getObjects()) {
            this.scene.add(obj);
        }

        for (const mesh of meshes) {
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

        /*for (const star of this.starsService.stars) {
            this.parentTransform.add(star);
        }*/
        this.parentTransform.add(this.starsService.starsPoints);
        this.scene.add(this.parentTransform);
    }

    addPosition(myPosition) {

        this.positionIntersected = new THREE.Object3D();

        const material = new THREE.LineBasicMaterial({ color: 0xfffff, transparent: true, opacity: 1 });

        // Z axis
        const geometryZ = new THREE.Geometry();
        geometryZ.vertices.push(
            new THREE.Vector3( myPosition.x, myPosition.y, myPosition.z ),
            new THREE.Vector3( myPosition.x, myPosition.y, 0 )
        );
        const lineZ = new THREE.Line( geometryZ, material );
        this.positionIntersected.add(lineZ);
        //  ellipsis
        const radiusXY = Math.sqrt(myPosition.x * myPosition.x + myPosition.y * myPosition.y);
        const curveXY = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            radiusXY, radiusXY,  // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        // const pathXY = new THREE.Path(curveXY.getPoints(50));
        const geometryXY = new THREE.Geometry().setFromPoints(curveXY.getPoints(50));
        const ellipseXY = new THREE.Line(geometryXY, material);
        this.positionIntersected.add(ellipseXY);

        const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
        const star = new THREE.Mesh(sphereGeometry, material);
        star.translateX(myPosition.x);
        star.translateY(myPosition.y);
        star.translateZ(myPosition.z);
        this.positionIntersected.add(star);
        this.scene.add(this.positionIntersected);
    }
    delPosition() {
        if (this.positionIntersected.children.length > 0) {
            for (const child of this.positionIntersected.children) {
                this.positionIntersected.remove(child);
                this.scene.remove(child);
            }
            this.scene.remove(this.positionIntersected);
        }

    }

    addXAxis(myPosition, material): THREE.Line {
        const geometryX = new THREE.Geometry();
        geometryX.vertices.push(
            new THREE.Vector3( myPosition.x, myPosition.y, myPosition.z ),
            new THREE.Vector3( 0, myPosition.y, myPosition.z )
        );
        return new THREE.Line( geometryX, material );
    }

}
