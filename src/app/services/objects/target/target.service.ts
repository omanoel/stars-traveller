import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ThreeComponentModel } from '@app/three/three.component.model';

@Injectable()
export class TargetService {

    SCALE = 0.2;
    axesHelper: THREE.AxesHelper;
    ratio: number;
    targetOnClick: THREE.Vector3;
    cameraOnClick: THREE.Vector3;
    EPSILON = 1e-3;
    STEP = 10;
    
    constructor() {
        this.axesHelper = new THREE.AxesHelper( this.SCALE );
    }

    create(myScene: THREE.Scene, myPoint: THREE.Vector3) {
        this.axesHelper.translateX(myPoint.x);
        this.axesHelper.translateY(myPoint.y);
        this.axesHelper.translateZ(myPoint.z);
        myScene.add( this.axesHelper );
    }

    update(myNewPoint: THREE.Vector3, camera: THREE.Camera): void {
        if (!this.ratio) {
            this.ratio = camera.position.distanceTo(myNewPoint);
        }
        const oldPosition = new THREE.Vector3().copy(this.axesHelper.position);
        this.axesHelper.translateX(myNewPoint.x - oldPosition.x);
        this.axesHelper.translateY(myNewPoint.y - oldPosition.y);
        this.axesHelper.translateZ(myNewPoint.z - oldPosition.z);
        const dist = camera.position.distanceTo(myNewPoint);
        const newScale = this.SCALE * dist / this.ratio;
        this.axesHelper.scale.set(newScale, newScale, newScale);
    }

    updateOnClick(myClickPoint: THREE.Vector3, threeComponentModel: ThreeComponentModel): void {
        this.targetOnClick = myClickPoint;
        const dist = myClickPoint.distanceTo(new THREE.Vector3(0, 0, 0));
        if (dist < 1) {
            this.cameraOnClick = new THREE.Vector3(1, 1, 1);
        } else {
            const ratio = (dist + 1) / dist;
            this.cameraOnClick = myClickPoint.clone().multiplyScalar(ratio);
        }
    }

    refresh(threeComponentModel: ThreeComponentModel): void {
        if (this.targetOnClick) {
            if (this.targetOnClick.distanceTo(threeComponentModel.trackballControlsService.controls.target) > this.EPSILON) {
                this.getNewPosition(threeComponentModel);
            } else {
                threeComponentModel.trackballControlsService.controls.target.copy(this.targetOnClick);
                threeComponentModel.trackballControlsService.target$.next(threeComponentModel.trackballControlsService.controls.target);
                threeComponentModel.perspectiveCameraService.camera.position.copy(this.cameraOnClick);
                this.targetOnClick = null;
            }
        }
    }

    getNewPosition(threeComponentModel: ThreeComponentModel): void {
        // displacement for target
        let displacementForTarget = new THREE.Vector3().subVectors(this.targetOnClick, threeComponentModel.trackballControlsService.controls.target);
        let newPositionForTarget = threeComponentModel.trackballControlsService.controls.target.clone().add(displacementForTarget.divideScalar(this.STEP));
        threeComponentModel.trackballControlsService.controls.target.copy(newPositionForTarget);
        threeComponentModel.trackballControlsService.target$.next(threeComponentModel.trackballControlsService.controls.target);
        // displacement for camera
        let displacementForCamera = new THREE.Vector3().subVectors(this.cameraOnClick, threeComponentModel.perspectiveCameraService.camera.position);
        let newPositionForCamera = threeComponentModel.perspectiveCameraService.camera.position.clone().add(displacementForCamera.divideScalar(this.STEP));
        threeComponentModel.perspectiveCameraService.camera.position.copy(newPositionForCamera);
    }
}
