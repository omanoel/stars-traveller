import { Injectable } from '@angular/core';
import { MainModel } from '@app/app.model';
import { MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { BaseCatalogData } from '../../../shared/catalog/catalog.model';
import { ThreeComponentModel } from '../../three-component.model';
import { SceneService } from '../scene/scene.service';
import { TargetService } from '../target/target.service';
import { Collection3d } from './objects.model';
import { StarsAsPointsService } from './stars-as-points.service';
import { StarsCloseCameraService } from './stars-close-camera.service';
import { StarsCloseTargetService } from './stars-close-target.service';

@Injectable({
  providedIn: 'root'
})
export class ObjectsService {
  //
  private _model: Collection3d;
  //
  constructor(
    private _targetService: TargetService,
    private _sceneService: SceneService,
    private _starsAsPointsService: StarsAsPointsService,
    private _starsCloseCameraService: StarsCloseCameraService,
    private _starsCloseTargetService: StarsCloseTargetService
  ) {
    // Empty
  }

  public initialize(): void {
    this._model = {
      groupOfObjectsPoints: new Object3D(),
      groupOfClosestObjects: new Object3D(),
      groupOfClosestObjectsHelpers: new Object3D(),
      groupOfClosestObjectsProperMotion: new Object3D(),
      groupOfClosestObjectsLabel: new Object3D(),
      groupOfObjectsMovement: new Object3D(),
      geometryMovementGlow: null,
      shaderMaterials: new Map(),
      basicMaterials: new Map(),
      colors: null,
      loaded: false
    };
    this._initMaterials();
    this._model.groupOfClosestObjects.name =
      SceneService.GROUP_INTERSECTED_OBJECTS;
  }

  public refreshAfterLoadingCatalog(mainModel: MainModel): void {
    mainModel.average = '';
    mainModel.objectsFiltered = mainModel.objectsImported;
    this.createStarsAsPoints(mainModel.objectsImported);
    this._model.groupOfClosestObjectsHelpers.children = [];
    this._model.groupOfClosestObjects.children = [];
    this._model.groupOfObjectsMovement.children = [];
    this._model.groupOfClosestObjectsProperMotion.children = [];
    this._model.groupOfClosestObjectsLabel.children = [];
    const first = mainModel.objectsImported[0];
    const position = new Vector3(first.x, first.y, first.z);
    this._targetService.goToThisPosition(position);
  }

  public addObjectsInScene(): void {
    if (this._model.groupOfObjectsPoints && !this._model.loaded) {
      /*
      this._sceneService.model.add(this._model.groupOfStarObjects);
      */
      this._sceneService.model.add(this._model.groupOfObjectsPoints);
      this._sceneService.model.add(this._model.groupOfClosestObjectsHelpers);
      this._sceneService.model.add(this._model.groupOfClosestObjects);
      this._sceneService.model.add(this._model.groupOfObjectsMovement);
      this._sceneService.model.add(
        this._model.groupOfClosestObjectsProperMotion
      );
      this._sceneService.model.add(this._model.groupOfClosestObjectsLabel);
      this._model.loaded = true;
    }
  }

  public createOrUpdateStarsCloseCamera(
    threeComponentModel: ThreeComponentModel
  ): void {
    this._starsCloseCameraService.createOrUpdate(
      this._model,
      threeComponentModel.mainModel
    );
  }

  public filterStarsCloseTarget(
    threeComponentModel: ThreeComponentModel
  ): BaseCatalogData[] {
    return this._starsCloseTargetService.filter(threeComponentModel.mainModel);
  }

  public createStarsAsPoints(
    objectsFiltered: BaseCatalogData[],
    deltaTimeInYear = 0
  ): void {
    this._starsAsPointsService.createOrUpdate(
      this._model,
      objectsFiltered,
      deltaTimeInYear
    );
  }

  /**
   * Depending on spectral class, set corresponding basic material
   */
  private _initMaterials(): void {
    this._model.colors = {
      Z: 0xffffff,
      O: 0x93b6ff,
      B: 0xa7c3ff,
      A: 0xd5e0ff,
      F: 0xf9f5ff,
      G: 0xffecdf,
      K: 0xffd6ac,
      M: 0xffaa58,
      L: 0xff7300,
      T: 0xff3500,
      Y: 0x999999
    };
    Object.keys(this._model.colors).forEach((key: string) => {
      this._model.basicMaterials[key] = new MeshBasicMaterial({
        color: this._model.colors[key],
        transparent: true,
        opacity: 0.1
      });
    });
  }
}
