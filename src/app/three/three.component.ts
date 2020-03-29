import {
  Component,
  HostListener,
  OnInit,
  ElementRef,
  OnChanges,
  OnDestroy
} from '@angular/core';

import * as THREE from 'three';

import { ThreeComponentService } from './three.component.service';
import { ThreeComponentModel } from './three.component.model';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit, OnChanges, OnDestroy {
  private _threeComponentModel: ThreeComponentModel;

  initDist: number;
  mouseDown = false;

  clock: THREE.Clock = new THREE.Clock();

  currentIntersected: any;

  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: true
  });

  @HostListener('window:resize')
  resetWidthHeight() {
    this._threeComponentService.resetWidthHeight(
      this.threeComponentModel,
      window.innerWidth,
      window.innerHeight
    );
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    event.preventDefault();
    if (!this.mouseDown) {
      this.threeComponentModel.mouse.x =
        (event.clientX / window.innerWidth) * 2 - 1;
      this.threeComponentModel.mouse.y =
        -(event.clientY / window.innerHeight) * 2 + 1;
    }
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event: MouseEvent) {
    event.preventDefault();
    this.mouseDown = true;
  }

  @HostListener('mouseup', ['$event'])
  onMouseup(event: MouseEvent) {
    event.preventDefault();
    this.threeComponentModel.target.targetOnClick = null;
    this.mouseDown = false;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    event.preventDefault();
    this._threeComponentService.gotoTarget(this.threeComponentModel);
  }

  constructor(
    private _element: ElementRef,
    private _threeComponentService: ThreeComponentService
  ) {
    // Empty
  }

  public ngOnInit(): void {
    this._threeComponentModel = this._threeComponentService.initModel(
      this._element
    );
    this.resetWidthHeight();
    this._threeComponentService.initComponent(this.threeComponentModel);
  }

  public ngOnChanges(changes: any): void {
    this._threeComponentService.onChanges(this.threeComponentModel, changes);
  }

  public ngOnDestroy(): void {
    if (this.threeComponentModel.frameId != null) {
      cancelAnimationFrame(this.threeComponentModel.frameId);
    }
  }

  public get threeComponentModel(): ThreeComponentModel {
    return this._threeComponentModel;
  }

  public set threeComponentModel(model: ThreeComponentModel) {
    this._threeComponentModel = model;
  }
}
