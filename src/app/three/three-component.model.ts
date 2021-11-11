import { ElementRef } from '@angular/core';
import { MainModel } from '@app/app.model';
import { Object3D, Vector2, WebGLRenderer } from 'three';

import { Collection3d } from './shared/objects/objects.model';

export interface ThreeComponentModel {
  element: ElementRef;
  renderer: WebGLRenderer;
  frameId: number;
  collection3d: Collection3d;
  mouse: Vector2;
  myObjectOver: ObjectOver;
  height: number;
  width: number;
  mainModel: MainModel;
  dateTimeStartLoop: number;
  alreadyReset: boolean;
}

export interface ObjectOver {
  objectIntersected: Object3D;
  objectDisplay: Object3D;
}
