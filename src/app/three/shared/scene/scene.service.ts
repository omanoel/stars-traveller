import * as THREE from 'three';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  public static readonly GROUP_STARS = 'GroupOfStars';
  public static readonly GROUP_INTERSECTED_OBJECTS =
    'GroupOfIntersectedObjects';

  private _model: THREE.Scene;

  constructor() {
    this._model = new THREE.Scene();
  }

  public get model(): THREE.Scene {
    return this._model;
  }

  public getGroupOfStars(): THREE.Object3D {
    return this._model.children.find(
      (obj) => obj.name === SceneService.GROUP_STARS
    );
  }

  public getGroupOfIntersectedObjects(): THREE.Object3D {
    return this._model.children.find(
      (obj) =>
        obj.name === SceneService.GROUP_STARS ||
        obj.name === SceneService.GROUP_INTERSECTED_OBJECTS
    );
  }
}
