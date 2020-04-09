import * as THREE from 'three';

import { ElementRef, Injectable, NgZone } from '@angular/core';

import { CatalogService } from './catalog/catalog.service';
import { OnObjectOverService } from './objects/on-object-over.service';
import { PerspectiveCameraService } from './perspective-camera/perspective-camera.service';
import { RaycasterService } from './raycaster/raycaster.service';
import { ReferentielService } from './referentiel/referentiel.service';
import { SceneService } from './scene/scene.service';
import { StarsService } from './stars/stars.service';
import { TargetService } from './target/target.service';
import { ThreeComponentModel } from './three.component.model';
import { TrackballControlsService } from './trackball-controls/trackball-controls.service';

@Injectable({
  providedIn: 'root',
})
export class ThreeComponentService {
  constructor(
    private _ngZone: NgZone,
    private _catalogService: CatalogService,
    private _perspectiveCameraService: PerspectiveCameraService,
    private _trackballControlsService: TrackballControlsService,
    private _raycasterService: RaycasterService,
    private _sceneService: SceneService,
    private _referentielService: ReferentielService,
    private _targetService: TargetService,
    private _starsService: StarsService,
    private _onObjectOverService: OnObjectOverService
  ) {}

  public initModel(element: ElementRef): ThreeComponentModel {
    return {
      renderer: new THREE.WebGLRenderer({
        antialias: true,
      }),
      frameId: null,
      element: element,
      camera: null,
      referentiel: null,
      target: null,
      scene: null,
      trackballControls: null,
      raycaster: null,
      objectsImported: null,
      starsImported: null,
      starsModel: null,
      mouse: new THREE.Vector2(),
      myObjectOver: null,
      currentIntersected: null,
      lastObjectIntersected: null,
      height: null,
      width: null,
      average: '',
      catalogs: [],
      selectedCatalog: null,
      showSearch: false,
      filters: new Map<string, number[]>(),
      errorMessage: null,
    };
  }

  public initComponent(threeComponentModel: ThreeComponentModel): void {
    // get catalogs
    threeComponentModel.catalogs = this._catalogService.list();
    //
    threeComponentModel.camera = this._perspectiveCameraService.initialize(
      threeComponentModel.width,
      threeComponentModel.height
    );
    //
    threeComponentModel.referentiel = this._referentielService.initialize(
      threeComponentModel.camera
    );
    //
    threeComponentModel.target = this._targetService.initialize();
    //
    threeComponentModel.scene = this._sceneService.initialize();
    //
    threeComponentModel.trackballControls = this._trackballControlsService.initialize();
    //
    threeComponentModel.raycaster = this._raycasterService.initialize();
    //
    threeComponentModel.renderer.setSize(
      threeComponentModel.width,
      threeComponentModel.height
    );
    threeComponentModel.element.nativeElement
      .querySelector('div.map')
      .appendChild(threeComponentModel.renderer.domElement);
    threeComponentModel.renderer.setPixelRatio(
      Math.floor(window.devicePixelRatio)
    );

    this._trackballControlsService.setupControls(threeComponentModel);

    const initDist = threeComponentModel.camera.position.distanceTo(
      new THREE.Vector3(0, 0, 0)
    );
    threeComponentModel.camera.position.y = 1;
    threeComponentModel.camera.position.z = 1;
    //this.fog =  new THREE.FogExp2( 0xffffff, 0.015 );
    threeComponentModel.scene.add(threeComponentModel.camera);
    //
    this._targetService.create(
      threeComponentModel.target,
      threeComponentModel.scene,
      threeComponentModel.trackballControls.controls.target
    );
    //
    threeComponentModel.myObjectOver = this._onObjectOverService.initialize(
      threeComponentModel.scene
    );
    //
    threeComponentModel.selectedCatalog = threeComponentModel.catalogs[0];
    this._catalogService
      .getCatalogService(threeComponentModel.selectedCatalog)
      .initialize(threeComponentModel)
      .then(() => {
        threeComponentModel.average = '';
        this._afterInitCatalog(threeComponentModel);
      });
  }

  public resetWidthHeight(
    threeComponentModel: ThreeComponentModel,
    width: number,
    height: number
  ): void {
    threeComponentModel.width = width;
    threeComponentModel.height = height;
    threeComponentModel.renderer.setSize(
      threeComponentModel.width,
      threeComponentModel.height
    );
    this._perspectiveCameraService.updateCamera(
      threeComponentModel.camera,
      threeComponentModel.width,
      threeComponentModel.height
    );
  }

  public gotoTarget(threeComponentModel: ThreeComponentModel): void {
    if (threeComponentModel.currentIntersected !== null) {
      this._targetService.setObjectsOnClick(
        threeComponentModel,
        threeComponentModel.currentIntersected.position
      );
    }
  }

  public onChanges(
    threeComponentModel: ThreeComponentModel,
    changes: any
  ): void {
    //
    const widthChange = changes.width && changes.width.currentValue;
    const heightChange = changes.height && changes.height.currentValue;
    if (widthChange || heightChange) {
      threeComponentModel.renderer.setSize(
        threeComponentModel.width,
        threeComponentModel.height
      );
      this._perspectiveCameraService.updateCamera(
        threeComponentModel.camera,
        threeComponentModel.width,
        threeComponentModel.height
      );
    }
  }

  public afterContentInit(threeComponentModel: ThreeComponentModel): void {
    // this.starsService.initialize();
    this.animate(threeComponentModel);
  }

  public animate(threeComponentModel: ThreeComponentModel): void {
    /*
    requestAnimationFrame(() => this.animate(threeComponentModel));
    this.render(threeComponentModel);
    */
    this._ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render(threeComponentModel);
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render(threeComponentModel);
        });
      }
    });
  }

  public render(threeComponentModel: ThreeComponentModel): void {
    threeComponentModel.frameId = requestAnimationFrame(() => {
      this.render(threeComponentModel);
    });
    //
    this._targetService.refreshObjectsOnClick(threeComponentModel);
    //
    //
    this._trackballControlsService.updateControls(
      threeComponentModel.trackballControls
    );
    //
    this._referentielService.update(
      threeComponentModel.referentiel,
      threeComponentModel.scene,
      threeComponentModel.camera
    );
    //
    this._targetService.updateAxesHelper(
      threeComponentModel.target,
      threeComponentModel.trackballControls.controls.target,
      threeComponentModel.camera
    );
    //
    if (!this._perspectiveCameraService.isMoving(threeComponentModel.camera)) {
      this._starsService.updateProximityStars(threeComponentModel);
    }
    //
    this._findIntersection(threeComponentModel);
    //
    this._onObjectOverService.update(threeComponentModel.myObjectOver);
    //
    threeComponentModel.renderer.render(
      threeComponentModel.scene,
      threeComponentModel.camera
    );
  }

  private _findIntersection(threeComponentModel: ThreeComponentModel): void {
    threeComponentModel.raycaster.setFromCamera(
      threeComponentModel.mouse,
      threeComponentModel.camera
    );
    //
    if (
      !this._sceneService.getGroupOfIntersectedObjects(
        threeComponentModel.scene
      )
    ) {
      return;
    }
    const intersects = threeComponentModel.raycaster.intersectObjects(
      this._sceneService.getGroupOfIntersectedObjects(threeComponentModel.scene)
        .children,
      false
    );
    if (intersects.length > 0) {
      if (threeComponentModel.currentIntersected) {
        threeComponentModel.currentIntersected.material.linewidth = 1;
        return;
      }
      threeComponentModel.currentIntersected = intersects[0].object;
      threeComponentModel.myObjectOver.objectIntersected =
        threeComponentModel.currentIntersected;
      this._catalogService
        .getCatalogService(threeComponentModel.selectedCatalog)
        .findOne(
          threeComponentModel,
          threeComponentModel.currentIntersected.userData.properties
        )
        .subscribe((properties: any) => {
          threeComponentModel.lastObjectIntersected = intersects[0].object;
          threeComponentModel.lastObjectIntersected.userData.properties = properties;
        });
      threeComponentModel.lastObjectIntersected = intersects[0].object;
    } else {
      if (threeComponentModel.currentIntersected) {
        threeComponentModel.myObjectOver.objectIntersected = null;
      }
      threeComponentModel.currentIntersected = null;
    }
  }

  private _afterInitCatalog(threeComponentModel: ThreeComponentModel): void {
    threeComponentModel.starsModel = this._starsService.initialize(
      threeComponentModel.starsImported
    );
    this._starsService.addStarObjectsInScene(
      threeComponentModel.scene,
      threeComponentModel.starsModel
    );
    this._starsService.updateProximityStars(threeComponentModel);
    this.afterContentInit(threeComponentModel);
  }
}
