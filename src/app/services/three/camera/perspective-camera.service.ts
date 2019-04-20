import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class PerspectiveCameraService {
    
    EPSILON = 1e-2;
    viewAngle = 25;
    near = 0.01;
    far = 1e12;
    camera: THREE.PerspectiveCamera;
    
    width: number;
    height: number;
    positions: number[];
    previousPositionOfCamera: THREE.Vector3;
    alreadyChecked: boolean;

    constructor() {
        this.previousPositionOfCamera = new THREE.Vector3(0,0,0);   
    }

    initialize(width: number, height: number, positions: number[] = [10, 10, 10]): void {
        this.height = height;
        this.width = width;
        this.positions = positions;
        this.camera = new THREE.PerspectiveCamera(
            this.viewAngle,
            this.aspect,
            this.near,
            this.far
        );
        this.updateAspect(this.aspect);
    }

    get aspect(): number {
        return this.width / this.height;
    }

    updateCamera(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.updateAspect(this.aspect);
    }

    onChanges(changes: any) {
        const widthChng = changes.width && changes.width.currentValue;
        const heightChng = changes.height && changes.height.currentValue;

        if (widthChng || heightChng) {
            this.updateAspect(this.aspect);
        }
    }

    updateAspect(ratio: number) {
        if (this.camera) {
            this.camera.aspect = ratio;
            this.camera.updateProjectionMatrix();
        }
    }

    isMoving(): boolean {
        if (this.camera) {
            if (this.previousPositionOfCamera.distanceTo(this.camera.position) < this.EPSILON) {
                if (!this.alreadyChecked) {
                    this.alreadyChecked = true;
                    return false;    
                } else {
                    return true;
                }
            } else {
                this.alreadyChecked = false;
            }
            this.previousPositionOfCamera.copy(this.camera.position);
            return true;
        } else {
            this.alreadyChecked = false;
            return false;
        }
    }

}