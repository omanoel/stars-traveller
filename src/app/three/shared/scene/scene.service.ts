import { Injectable } from '@angular/core';
import { Object3D, Scene } from 'three';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  public static readonly GROUP_STARS = 'GroupOfStars';
  public static readonly GROUP_INTERSECTED_OBJECTS =
    'GroupOfIntersectedObjects';

  private _model: Scene;

  constructor() {
    this._model = new Scene();
  }

  public get model(): Scene {
    return this._model;
  }

  public getGroupOfStars(): Object3D {
    return this._model.children.find(
      (obj) => obj.name === SceneService.GROUP_STARS
    );
  }

  public getGroupOfIntersectedObjects(): Object3D {
    return this._model.children.find(
      (obj) =>
        obj.name === SceneService.GROUP_STARS ||
        obj.name === SceneService.GROUP_INTERSECTED_OBJECTS
    );
  }
}
