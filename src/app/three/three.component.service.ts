import { Injectable } from '@angular/core';

import { ThreeComponentModel } from './three.component.model';
import * as THREE from 'three';

@Injectable()
export class ThreeComponentService {

    currentIntersected: any;

    initialize(threeComponentModel: ThreeComponentModel): void {
        //
        threeComponentModel.perspectiveCameraService.initialize(threeComponentModel.width, threeComponentModel.height);
        //
        threeComponentModel.referentielService.initialize(threeComponentModel.perspectiveCameraService.camera);
    }

    resetWidthHeight(threeComponentModel: ThreeComponentModel, width: number, height: number): void {
        threeComponentModel.width = width;
        threeComponentModel.height = height;
        threeComponentModel.renderer.setSize(threeComponentModel.width, threeComponentModel.height);
        threeComponentModel.perspectiveCameraService.updateCamera(
            threeComponentModel.width,
            threeComponentModel.height);
    }

    gotoTarget(threeComponentModel: ThreeComponentModel): void {
        if (this.currentIntersected !== undefined) {
            threeComponentModel.trackballControlsService.controls.target = this.currentIntersected.position;
        }
    }

    onChanges(threeComponentModel: ThreeComponentModel, changes: any): void {
        //
        const widthChange = changes.width && changes.width.currentValue;
        const heightChange = changes.height && changes.height.currentValue;
        if (widthChange || heightChange) {
            threeComponentModel.renderer.setSize(threeComponentModel.width, threeComponentModel.height);
            threeComponentModel.perspectiveCameraService.updateCamera(threeComponentModel.width, threeComponentModel.height);
        }
    }

    afterContentInit(threeComponentModel: ThreeComponentModel): void {
        threeComponentModel.renderer.setSize(threeComponentModel.width, threeComponentModel.height);
        threeComponentModel.element.nativeElement.appendChild(threeComponentModel.renderer.domElement);
        threeComponentModel.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

        threeComponentModel.trackballControlsService.setupControls(
            threeComponentModel.perspectiveCameraService.camera,
            threeComponentModel.renderer,
            threeComponentModel.starsService);
        
        const initDist = threeComponentModel.perspectiveCameraService.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        threeComponentModel.perspectiveCameraService.camera.position.y = 1;
        threeComponentModel.perspectiveCameraService.camera.position.z = 1;
        //this.fog =  new THREE.FogExp2( 0xffffff, 0.015 );
        threeComponentModel.sceneService.scene.add(threeComponentModel.perspectiveCameraService.camera);
        threeComponentModel.targetService.create(threeComponentModel.sceneService.scene, threeComponentModel.trackballControlsService.controls.target);
        // this.starsService.initialize();
        this.animate(threeComponentModel);

    }

    animate(threeComponentModel: ThreeComponentModel): void {
        requestAnimationFrame(() => this.animate(threeComponentModel));
        this.render(threeComponentModel);
    }

    render(threeComponentModel: ThreeComponentModel): void {
        //
        threeComponentModel.starsService.addInScene(threeComponentModel.sceneService.scene);
        //
        threeComponentModel.trackballControlsService.updateControls();
        //
        threeComponentModel.referentielService.update(
            threeComponentModel.sceneService.scene, threeComponentModel.perspectiveCameraService.camera);
        //
        threeComponentModel.targetService.update(
            threeComponentModel.trackballControlsService.controls.target,
            threeComponentModel.perspectiveCameraService.camera);
        //
        this.findIntersection(threeComponentModel);
        //
        threeComponentModel.renderer.render(
            threeComponentModel.sceneService.scene, threeComponentModel.perspectiveCameraService.camera);
    }

    findIntersection(threeComponentModel: ThreeComponentModel): void {

        threeComponentModel.raycasterService.raycaster.setFromCamera(
            threeComponentModel.mouse,
            threeComponentModel.perspectiveCameraService.camera);
        //
        if (!threeComponentModel.sceneService.getGroupOfStars()) {
            return;
        }
        const intersects = threeComponentModel.raycasterService.raycaster.intersectObjects(
            threeComponentModel.sceneService.getGroupOfStars().children, false);
        if (intersects.length > 0) {
            if (this.currentIntersected !== undefined) {
                this.currentIntersected.material.linewidth = 1;
                return;
            }
            this.currentIntersected = intersects[0].object;
            threeComponentModel.myStarOver.star = this.currentIntersected;
            // this.currentIntersected.material.color.b = 1;
            // this.sceneDir.addPosition(this.currentIntersected.position);
            // sphereInter.visible = true;
            // sphereInter.position.copy( intersects[ 0 ].point );
        } else {
            if (this.currentIntersected !== undefined) {
                // this.currentIntersected.material.color.b = 0;
                // this.sceneDir.delPosition();
                threeComponentModel.myStarOver.star = null;
            }

            this.currentIntersected = undefined;
            // sphereInter.visible = false;
        }
    }
    // ngAfterContentInit() {
    //     //this.camera.lookAt(this.scene.position);
    //     this.camera.position.y = 1;
    //     this.camera.position.z = 1;
    //     //this.fog =  new THREE.FogExp2( 0xffffff, 0.015 );
    //     this.scene.add(this.camera);

    //     this.starsService.initialize();

    //     const meshes = [
    //         ...this.lightDir.toArray(),
    //         ...this.textureComps.toArray(),
    //         /*...this.fakeStarsDir.toArray()*/
    //     ];

    //     this.referentielService.initialize(this.camera);
    //     for (const obj of this.referentielService.getObjects()) {
    //         this.scene.add(obj);
    //     }

    //     for (const mesh of meshes) {
    //         if (mesh.object) {
    //             this.scene.add(mesh.object);
    //         } else if (mesh.attachScene) {
    //             mesh.attachScene(this.scene);
    //         } else if (mesh.objects) {
    //             for (const obj of mesh.objects) {
    //                 this.scene.add(obj);
    //             }
    //         }
    //     }

    //     /*for (const star of this.starsService.stars) {
    //         this.parentTransform.add(star);
    //     }*/
    //     this.parentTransform.add(this.starsService.starsPoints);
    //     this.scene.add(this.parentTransform);
    // }

    // addPosition(myPosition) {

    //     this.positionIntersected = new THREE.Object3D();

    //     const material = new THREE.LineBasicMaterial({ color: 0xfffff, transparent: true, opacity: 1 });

    //     // Z axis
    //     const geometryZ = new THREE.Geometry();
    //     geometryZ.vertices.push(
    //         new THREE.Vector3( myPosition.x, myPosition.y, myPosition.z ),
    //         new THREE.Vector3( myPosition.x, myPosition.y, 0 )
    //     );
    //     const lineZ = new THREE.Line( geometryZ, material );
    //     this.positionIntersected.add(lineZ);
    //     //  ellipsis
    //     const radiusXY = Math.sqrt(myPosition.x * myPosition.x + myPosition.y * myPosition.y);
    //     const curveXY = new THREE.EllipseCurve(
    //         0, 0,            // ax, aY
    //         radiusXY, radiusXY,  // xRadius, yRadius
    //         0, 2 * Math.PI,  // aStartAngle, aEndAngle
    //         false,            // aClockwise
    //         0                 // aRotation
    //     );
    //     // const pathXY = new THREE.Path(curveXY.getPoints(50));
    //     const geometryXY = new THREE.Geometry().setFromPoints(curveXY.getPoints(50));
    //     const ellipseXY = new THREE.Line(geometryXY, material);
    //     this.positionIntersected.add(ellipseXY);

    //     const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
    //     const star = new THREE.Mesh(sphereGeometry, material);
    //     star.translateX(myPosition.x);
    //     star.translateY(myPosition.y);
    //     star.translateZ(myPosition.z);
    //     this.positionIntersected.add(star);
    //     this.scene.add(this.positionIntersected);
    // }
    
    // delPosition() {
    //     if (this.positionIntersected.children.length > 0) {
    //         for (const child of this.positionIntersected.children) {
    //             this.positionIntersected.remove(child);
    //             this.scene.remove(child);
    //         }
    //         this.scene.remove(this.positionIntersected);
    //     }

    // }

    // addXAxis(myPosition, material): THREE.Line {
    //     const geometryX = new THREE.Geometry();
    //     geometryX.vertices.push(
    //         new THREE.Vector3( myPosition.x, myPosition.y, myPosition.z ),
    //         new THREE.Vector3( 0, myPosition.y, myPosition.z )
    //     );
    //     return new THREE.Line( geometryX, material );
    // }
}