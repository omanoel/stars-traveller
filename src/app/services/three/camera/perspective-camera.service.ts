import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class PerspectiveCameraService {
    
    viewAngle = 25;
    near = 1;
    far = 1e12;
    camera: THREE.PerspectiveCamera;
    
    width: number;
    height: number;
    positions: number[];

    constructor() {       
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

}