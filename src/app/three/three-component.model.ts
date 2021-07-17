import * as THREE from 'three';

import { ElementRef } from '@angular/core';

import { Collection3d } from './shared/objects/objects.model';
import { MainModel } from '@app/app.model';

export interface ThreeComponentModel {
  element: ElementRef;
  renderer: THREE.WebGLRenderer;
  frameId: number;
  collection3d: Collection3d;
  mouse: THREE.Vector2;
  myObjectOver: ObjectOver;
  height: number;
  width: number;
  changeOnShowProperMotion: boolean;
  mainModel: MainModel;
}

export interface ObjectOver {
  objectIntersected: THREE.Object3D;
  objectDisplay: THREE.Object3D;
}
