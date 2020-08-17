import * as THREE from 'three';

import { Injectable, SimpleChanges } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerspectiveCameraService {
  private static readonly EPSILON = 1e-2;
  private static readonly VIEW_ANGLE = 25;
  private static readonly NEAR = 0.01;
  private static readonly FAR = 1e12;
  private static readonly DEFAULT_ASPECT = 1;

  public previousPositionOfCamera: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public alreadyChecked: boolean;

  constructor() {
    // Empty
  }

  public initialize(
    width: number,
    height: number,
    positions: number[] = [1, 1, 1]
  ): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      PerspectiveCameraService.VIEW_ANGLE,
      PerspectiveCameraService.DEFAULT_ASPECT,
      PerspectiveCameraService.NEAR,
      PerspectiveCameraService.FAR
    );
    camera.translateX(positions[0]);
    camera.translateY(positions[1]);
    camera.translateZ(positions[2]);
    camera.up = new THREE.Vector3(0, 0, 1);
    this._updateAspect(camera, width, height);
    return camera;
  }

  public updateCamera(
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number
  ): void {
    this._updateAspect(camera, width, height);
  }

  public onChanges(
    camera: THREE.PerspectiveCamera,
    changes: SimpleChanges
  ): void {
    const widthChng = changes.width && changes.width.currentValue;
    const heightChng = changes.height && changes.height.currentValue;

    if (widthChng || heightChng) {
      this._updateAspect(camera, widthChng, heightChng);
    }
  }

  public isMoving(camera: THREE.PerspectiveCamera): boolean {
    if (camera) {
      if (
        this.previousPositionOfCamera.distanceTo(camera.position) <
        PerspectiveCameraService.EPSILON
      ) {
        if (!this.alreadyChecked) {
          this.alreadyChecked = true;
          return false;
        } else {
          return true;
        }
      } else {
        this.alreadyChecked = false;
      }
      this.previousPositionOfCamera.copy(camera.position);
      return true;
    } else {
      this.alreadyChecked = false;
      return false;
    }
  }

  private _updateAspect(
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number
  ) {
    if (camera) {
      camera.aspect = this._getAspect(width, height);
      camera.updateProjectionMatrix();
    }
  }

  private _getAspect(width: number, height: number): number {
    if (height === 0) {
      return PerspectiveCameraService.DEFAULT_ASPECT;
    }
    return width / height;
  }
}
