import * as THREE from 'three';

import { ElementRef } from '@angular/core';

import { ReferentielModel } from './referentiel/referentiel.model';
import { StarsModel } from './stars/stars.model';
import { TargetModel } from './target/target.model';
import { TrackballControlsModel } from './trackball-controls/trackball-controls.model';
import { Catalog } from './catalog/catalog.model';

export interface ThreeComponentModel {
  element: ElementRef;
  renderer: THREE.WebGLRenderer;
  frameId: number;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  referentiel: ReferentielModel;
  target: TargetModel;
  starsModel: StarsModel;
  objectsImported: any;
  starsImported: any;
  trackballControls: TrackballControlsModel;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  myObjectOver: ObjectOver;
  currentIntersected: any;
  lastObjectIntersected: THREE.Object3D;
  average: string;
  height: number;
  width: number;
  catalogs: Catalog[];
  selectedCatalog: Catalog;
  showSearch: boolean;
  filters: Map<string, number[]>;
  errorMessage: string;
}

export interface ObjectOver {
  objectIntersected: THREE.Object3D;
  objectDisplay: THREE.Object3D;
}
