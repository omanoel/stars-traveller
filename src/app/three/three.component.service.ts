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
            threeComponentModel.targetService.updateOnClick(this.currentIntersected.position, threeComponentModel);
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
        threeComponentModel.element.nativeElement.querySelector('div.map').appendChild(threeComponentModel.renderer.domElement);
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
        //
        threeComponentModel.targetService.create(threeComponentModel.sceneService.scene, threeComponentModel.trackballControlsService.controls.target);
        //
        threeComponentModel.onStarOverService.initialize(threeComponentModel.sceneService.scene);
        // this.starsService.initialize();
        this.animate(threeComponentModel);

    }

    animate(threeComponentModel: ThreeComponentModel): void {
        requestAnimationFrame(() => this.animate(threeComponentModel));
        this.render(threeComponentModel);
    }

    render(threeComponentModel: ThreeComponentModel): void {
        // 
        threeComponentModel.targetService.refresh(threeComponentModel);
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
        if (!threeComponentModel.perspectiveCameraService.isMoving()) {
            threeComponentModel.starsService.updateSpheresInScene(
                threeComponentModel.perspectiveCameraService.camera,
                threeComponentModel.trackballControlsService.controls.target);
        }
        //
        this.findIntersection(threeComponentModel);
        //
        threeComponentModel.onStarOverService.update();
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
            threeComponentModel.onStarOverService.star = this.currentIntersected;
        } else {
            if (this.currentIntersected !== undefined) {
                threeComponentModel.onStarOverService.star = null;
            }

            this.currentIntersected = undefined;
        }
    }

}