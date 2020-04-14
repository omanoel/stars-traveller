import * as THREE from 'three';

import { ElementRef } from '@angular/core';

import { Catalog, BaseCatalogData } from './catalog/catalog.model';
import { Collection3d } from './objects/objects.model';
import { ReferentielModel } from './referentiel/referentiel.model';
import { TargetModel } from './target/target.model';
import { TrackballControlsModel } from './trackball-controls/trackball-controls.model';

export interface ThreeComponentModel {
  element: ElementRef;
  renderer: THREE.WebGLRenderer;
  frameId: number;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  referentiel: ReferentielModel;
  target: TargetModel;
  collection3d: Collection3d;
  objectsImported: BaseCatalogData[];
  trackballControls: TrackballControlsModel;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  myObjectOver: ObjectOver;
  currentIntersected: THREE.Object3D;
  lastObjectIntersected: THREE.Object3D;
  average: string;
  height: number;
  width: number;
  catalogs: Catalog[];
  selectedCatalog: Catalog;
  showSearch: boolean;
  filters: Map<string, number[]>;
  errorMessage: string;
  scale: number;
  indexOfCurrent: number;
}

export interface ObjectOver {
  objectIntersected: THREE.Object3D;
  objectDisplay: THREE.Object3D;
}
