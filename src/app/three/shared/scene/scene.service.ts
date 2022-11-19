import { Injectable } from '@angular/core';
import { DirectionalLight, Object3D, Scene } from 'three';

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
    const dirLight1 = new DirectionalLight(0xffffff, 0.125);
    dirLight1.position.set(0, 0, 1).normalize();
    this._model.add(dirLight1);
    const dirLight2 = new DirectionalLight(0xffffff, 0.125);
    dirLight2.position.set(0, 1, 0).normalize();
    this._model.add(dirLight2);
    const dirLight3 = new DirectionalLight(0xffffff, 0.125);
    dirLight3.position.set(0, 0, -1).normalize();
    this._model.add(dirLight3);
    const dirLight4 = new DirectionalLight(0xffffff, 0.125);
    dirLight4.position.set(0, -1, 0).normalize();
    this._model.add(dirLight4);
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
