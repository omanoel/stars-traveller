import { Component, HostListener, Input } from '@angular/core';
import { Vector3 } from 'three';
import { PerspectiveCameraService } from '../shared/perspective-camera/perspective-camera.service';

import { TargetService } from '../shared/target/target.service';
import { ThreeComponentModel } from '../three-component.model';
import { ThreeComponentService } from '../three-component.service';

export enum KEY_CODE {
  RIGHT_ARROW = 'ArrowRight',
  LEFT_ARROW = 'ArrowLeft'
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  private _mouseDown = false;
  @Input() model: ThreeComponentModel;

  constructor(
    private _threeComponentService: ThreeComponentService,
    private _targetService: TargetService,
    private _persectiveCameraService: PerspectiveCameraService
  ) {}

  @HostListener('window:resize')
  resetWidthHeight(): void {
    this._threeComponentService.resetWidthHeight(
      this.model,
      window.innerWidth,
      window.innerHeight
    );
  }

  @HostListener('window:keyup', ['$event'])
  onKeyup(event: KeyboardEvent): void {
    const rotationalAxis = new Vector3(
      this._persectiveCameraService.camera.position.x -
        this._targetService.model.axesHelper.position.x,
      this._persectiveCameraService.camera.position.y -
        this._targetService.model.axesHelper.position.y,
      this._persectiveCameraService.camera.position.z -
        this._targetService.model.axesHelper.position.z
    ).normalize();
    if (event.code === '' + KEY_CODE.RIGHT_ARROW) {
      this._persectiveCameraService.camera.up.applyAxisAngle(
        rotationalAxis,
        -Math.PI / 24
      );
    }

    if (event.code === '' + KEY_CODE.LEFT_ARROW) {
      this._persectiveCameraService.camera.up.applyAxisAngle(
        rotationalAxis,
        Math.PI / 24
      );
    }
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent): void {
    event.preventDefault();
    if (!this._mouseDown) {
      this.model.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.model.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event: MouseEvent): void {
    event.preventDefault();
    this._mouseDown = true;
  }

  @HostListener('mouseup', ['$event'])
  onMouseup(event: MouseEvent): void {
    event.preventDefault();
    this._targetService.model.targetOnClick = undefined;
    this._mouseDown = false;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    this._threeComponentService.gotoTarget(this.model);
  }
}
