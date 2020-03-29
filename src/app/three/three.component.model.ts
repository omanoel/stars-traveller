import { ElementRef } from '@angular/core';
import * as THREE from 'three';

import { ReferentielModel } from './referentiel/referentiel.model';
import { TargetModel } from './target/target.model';
import { StarsModel } from './stars/stars.model';
import { TrackballControlsModel } from './trackball-controls/trackball-controls.model';

export interface ThreeComponentModel {
  element: ElementRef;
  renderer: THREE.WebGLRenderer;
  frameId: number;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  referentiel: ReferentielModel;
  target: TargetModel;
  starsModel: StarsModel;
  starsImported: any;
  trackballControls: TrackballControlsModel;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  myStarOver: StarOver;
  currentIntersected: any;
  lastStarIntersected: THREE.Object3D;
  average: string;
  height: number;
  width: number;
}

export interface StarOver {
  starIntersected: THREE.Object3D;
  overObject: THREE.Object3D;
}
