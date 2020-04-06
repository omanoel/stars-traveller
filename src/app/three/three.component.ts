import * as THREE from 'three';

import {
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { ThreeComponentModel } from './three.component.model';
import { ThreeComponentService } from './three.component.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss'],
})
export class ThreeComponent implements OnInit, OnChanges, OnDestroy {
  private _threeComponentModel: ThreeComponentModel;

  initDist: number;
  mouseDown = false;
  isHelpDisplayed = false;

  clock: THREE.Clock = new THREE.Clock();

  currentIntersected: any;

  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  constructor(
    public translate: TranslateService,
    private _element: ElementRef,
    private _threeComponentService: ThreeComponentService
  ) {
    // Empty
  }

  public ngOnInit(): void {
    this._threeComponentModel = this._threeComponentService.initModel(
      this._element
    );
    this._threeComponentService.resetWidthHeight(
      this.threeComponentModel,
      window.innerWidth,
      window.innerHeight
    );
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

  public toggleSearch(): void {
    this.threeComponentModel.showSearch = !this.threeComponentModel.showSearch;
  }

  public displayHelp(status: boolean): void {
    this.isHelpDisplayed = status;
  }

  public get threeComponentModel(): ThreeComponentModel {
    return this._threeComponentModel;
  }

  public set threeComponentModel(model: ThreeComponentModel) {
    this._threeComponentModel = model;
  }
}
