import * as THREE from 'three';

import { Injectable, SimpleChanges } from '@angular/core';

import { ThreeComponentModel } from '../../three-component.model';

@Injectable({
  providedIn: 'root'
})
export class PerspectiveCameraService {
  private static readonly EPSILON = 0.01;
  private static readonly VIEW_ANGLE = 25;
  private static readonly NEAR = 0.01;
  private static readonly FAR = 1e12;
  private static readonly DEFAULT_ASPECT = 1;

  public previousPositionOfCamera: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public alreadyChecked: boolean;
  public camera: THREE.PerspectiveCamera;

  constructor() {
    // Empty
  }

  public initialize(
    width: number,
    height: number,
    positions: number[] = [1, 1, 1]
  ): void {
    this.camera = new THREE.PerspectiveCamera(
      PerspectiveCameraService.VIEW_ANGLE,
      PerspectiveCameraService.DEFAULT_ASPECT,
      PerspectiveCameraService.NEAR,
      PerspectiveCameraService.FAR
    );
    this.camera.translateX(positions[0]);
    this.camera.translateY(positions[1]);
    this.camera.translateZ(positions[2]);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this._updateAspect(width, height);
  }

  public updateCamera(width: number, height: number): void {
    this._updateAspect(width, height);
  }

  public onChanges(changes: SimpleChanges): void {
    const widthChng = changes.width && changes.width.currentValue;
    const heightChng = changes.height && changes.height.currentValue;

    if (widthChng || heightChng) {
      this._updateAspect(widthChng, heightChng);
    }
  }

  public isMoving(threeComponentModel: ThreeComponentModel): boolean {
    if (this.camera) {
      if (
        this.previousPositionOfCamera.distanceTo(this.camera.position) <
        PerspectiveCameraService.EPSILON *
          (threeComponentModel.mainModel.scale > 1 ? 10 : 1)
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
      this.previousPositionOfCamera.copy(this.camera.position);
      return true;
    } else {
      this.alreadyChecked = false;
      return false;
    }
  }

  private _updateAspect(width: number, height: number) {
    if (this.camera) {
      this.camera.aspect = this._getAspect(width, height);
      this.camera.updateProjectionMatrix();
    }
  }

  private _getAspect(width: number, height: number): number {
    if (height === 0) {
      return PerspectiveCameraService.DEFAULT_ASPECT;
    }
    return width / height;
  }
}
