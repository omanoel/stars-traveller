import * as THREE from 'three';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  public static readonly GROUP_STARS = 'GroupOfStars';
  public static readonly GROUP_INTERSECTED_OBJECTS =
    'GroupOfIntersectedObjects';
  constructor() {
    // Empty
  }

  public initialize(): THREE.Scene {
    return new THREE.Scene();
  }

  public getGroupOfStars(scene: THREE.Scene): THREE.Object3D {
    return scene.children.find((obj) => obj.name === SceneService.GROUP_STARS);
  }

  public getGroupOfIntersectedObjects(scene: THREE.Scene): THREE.Object3D {
    return scene.children.find(
      (obj) =>
        obj.name === SceneService.GROUP_STARS ||
        obj.name === SceneService.GROUP_INTERSECTED_OBJECTS
    );
  }
}
