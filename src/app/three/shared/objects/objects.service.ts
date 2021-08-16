import * as THREE from 'three';

import { Injectable } from '@angular/core';
import { MainModel } from '@app/app.model';

import { BaseCatalogData } from '../../../shared/catalog/catalog.model';
import { ThreeComponentModel } from '../../three-component.model';
import { PerspectiveCameraService } from '../perspective-camera/perspective-camera.service';
import { SceneService } from '../scene/scene.service';
import { TargetService } from '../target/target.service';
import { TrackballControlsService } from '../trackball-controls/trackball-controls.service';
import {
  Collection3d,
  commonMaterialHelper,
  commonMaterialProperMotion
} from './objects.model';
import { ShadersConstant } from './shaders.constant';

@Injectable({
  providedIn: 'root'
})
export class ObjectsService {
  //
  private static readonly EPOCH = 2000;

  private _model: Collection3d;
  //
  constructor(
    private _shadersConstant: ShadersConstant,
    private _targetService: TargetService,
    private _sceneService: SceneService,
    private _trackballControlsService: TrackballControlsService,
    private _perspectiveCameraService: PerspectiveCameraService
  ) {
    // Empty
  }

  public initialize(objectsImported: BaseCatalogData[]): void {
    this._model = {
      nbObjects: 0,
      groupOfObjectsPoints: new THREE.Object3D(),
      groupOfClosestObjects: new THREE.Object3D(),
      groupOfClosestObjectsHelpers: new THREE.Object3D(),
      groupOfClosestObjectsProperMotion: new THREE.Object3D(),
      groupOfObjectsGlow: new THREE.Object3D(),
      groupOfObjectsMovement: new THREE.Object3D(),
      geometryMovementGlow: null,
      shaderMaterials: new Map<string, THREE.ShaderMaterial>(),
      basicMaterials: new Map<string, THREE.MeshBasicMaterial>(),
      colors: null,
      loaded: false
    };
    this._initMaterials();
    this._model.groupOfClosestObjects.name =
      SceneService.GROUP_INTERSECTED_OBJECTS;
    this._createObjectsAsPoints(objectsImported);
  }

  public refreshAfterLoadingCatalog(mainModel: MainModel): void {
    mainModel.average = '';
    this._model.groupOfObjectsPoints.children = [];
    this._createObjectsAsPoints(mainModel.objectsImported);
    const first = mainModel.objectsImported[0];
    const position = new THREE.Vector3(first.x, first.y, first.z);
    this._targetService.setObjectsOnClick(position);
    mainModel.needRefreshSubject.next();
  }

  public addObjectsInScene(): void {
    if (this._model.groupOfObjectsPoints && !this._model.loaded) {
      this._sceneService.model.add(this._model.groupOfObjectsPoints);
      this._sceneService.model.add(this._model.groupOfObjectsGlow);
      this._sceneService.model.add(this._model.groupOfClosestObjectsHelpers);
      this._sceneService.model.add(this._model.groupOfClosestObjects);
      this._sceneService.model.add(this._model.groupOfObjectsMovement);
      this._sceneService.model.add(
        this._model.groupOfClosestObjectsProperMotion
      );
      this._model.loaded = true;
    }
  }

  public updateClosestObjects(threeComponentModel: ThreeComponentModel): void {
    if (!this._model.groupOfClosestObjects) {
      return;
    }
    if (threeComponentModel.mainModel.showProperMotion) {
      commonMaterialProperMotion.opacity = 0.5;
    } else {
      commonMaterialProperMotion.opacity = 0;
    }
    // this._updateShaderMaterials();
    const nearest = this._getClosestObjectsInFrustum(
      threeComponentModel.mainModel
    );
    this._updateClosestObjectsAndHelpers(
      threeComponentModel.mainModel,
      nearest
    );
  }

  public updateMovementObjects(threeComponentModel: ThreeComponentModel): void {
    if (!this._model.groupOfObjectsMovement) {
      return;
    }
    const nearest = this._getNearest(threeComponentModel.mainModel);
    this._updateMovementObjects(threeComponentModel, nearest);
  }

  // ========================================================================
  // Create objects as points (light and glow)
  // ========================================================================
  private _createObjectsAsPoints(objectsImported: BaseCatalogData[]): void {
    const vertices = [];
    const colors = [];
    const sizes = [];

    this._model.nbObjects = objectsImported.length;
    for (let i = 0; i < this._model.nbObjects; i++) {
      const record = objectsImported[i];
      vertices.push(record.x, record.y, record.z);
      const color = new THREE.Color(
        this._model.colors[this._getSpectrum(record)]
      );
      colors.push(color.r, color.g, color.b);
      sizes.push(1);
    }

    // Light points
    const geometryLight = new THREE.BufferGeometry();
    geometryLight.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    const materialLight = new THREE.PointsMaterial({
      size: 1,
      color: 0xffecdf,
      sizeAttenuation: false,
      alphaTest: 1,
      transparent: false
    });
    this._model.groupOfObjectsPoints.add(
      new THREE.Points(geometryLight, materialLight)
    );

    // Glow points (for stars catalog only)
    if (!this._isCatalogMessier(objectsImported)) {
      const geometryGlow = new THREE.BufferGeometry();
      geometryGlow.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3)
      );
      geometryGlow.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3)
      );
      geometryGlow.setAttribute(
        'size',
        new THREE.Float32BufferAttribute(sizes, 1)
      );
      const materialGlow = this._getShaderMaterialForPoint();
      this._model.groupOfObjectsPoints.add(
        new THREE.Points(geometryGlow, materialGlow)
      );
    }
  }

  private _getNearest(mainModel: MainModel): BaseCatalogData[] {
    const camera = this._perspectiveCameraService.camera;
    const target = this._trackballControlsService.model.controls.target;
    const nears = [];
    for (let i = 0; i < mainModel.objectsImported.length; i++) {
      const record = mainModel.objectsImported[i];
      const pos = new THREE.Vector3(record.x, record.y, record.z);
      const target2 = new THREE.Vector3(target.x, target.y, target.z);
      const pos2 = new THREE.Vector3(record.x, record.y, record.z);
      const angle = target2
        .sub(camera.position)
        .angleTo(pos2.sub(camera.position));
      if (
        pos.distanceTo(camera.position) < mainModel.near &&
        angle <= (camera.fov * Math.PI) / 180
      ) {
        nears.push(record);
      }
    }
    return nears;
  }

  private _getClosestObjectsInFrustum(mainModel: MainModel): BaseCatalogData[] {
    const camera = this._perspectiveCameraService.camera;
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );
    const nears: BaseCatalogData[] = [];
    for (let i = 0; i < mainModel.objectsImported.length; i++) {
      const record = mainModel.objectsImported[i];
      const pos = new THREE.Vector3(record.x, record.y, record.z);
      if (
        frustum.containsPoint(pos) &&
        camera.position.distanceTo(pos) < mainModel.near
      ) {
        nears.push(record);
      }
    }
    return nears;
  }

  private _updateClosestObjectsAndHelpers(
    mainModel: MainModel,
    nearest: BaseCatalogData[]
  ): void {
    const isMessierCatalog = this._isCatalogMessier(mainModel.objectsImported);
    const nearestIds = nearest.map((near) => near.id);
    // remove not in frustum closest objects
    this._model.groupOfClosestObjects.children =
      this._model.groupOfClosestObjects.children.filter((c) =>
        nearestIds.includes(c.userData.properties.id)
      );
    // add not existing closest objects
    const geometrySphere = new THREE.SphereBufferGeometry(0.02, 32, 16);
    nearest.forEach((near) => {
      const alreadyInClosest = this._model.groupOfClosestObjects.children.find(
        (c) => c.userData.properties.id === near.id
      );
      if (alreadyInClosest === undefined) {
        if (!isMessierCatalog) {
          this._createClosestObjectSphereAndHelper(
            near,
            geometrySphere,
            mainModel.showProperMotion,
            mainModel.dateMax
          );
        } else {
          const geometryPlane = new THREE.PlaneBufferGeometry(0.5, 0.5, 1);
          nearest.forEach((near) => {
            const plane = new THREE.Object3D();
            plane.translateX(near.x);
            plane.translateY(near.y);
            plane.translateZ(near.z);
            let materialTexture;
            const matKey = Object.keys(this._model.shaderMaterials).find(
              (k) => k === near.id
            );
            if (!matKey) {
              const texture = new THREE.TextureLoader().load(
                './assets/messier/' + near.id + '.jpg'
              );
              materialTexture = new THREE.MeshBasicMaterial({
                alphaMap: texture,
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
              });
              this._model.shaderMaterials[near.id] = materialTexture;
            } else {
              materialTexture = this._model.shaderMaterials[matKey];
            }
            const object = new THREE.Mesh(geometryPlane, materialTexture);
            object.userData.properties = near;
            const from = new THREE.Vector3(0, 0, 1);
            const to = new THREE.Vector3(-near.x, -near.y, -near.z).normalize();
            const quat = new THREE.Quaternion().setFromUnitVectors(from, to);
            object.applyQuaternion(quat);
            plane.add(object);
            this._model.groupOfClosestObjects.add(plane);
          });
        }
      }
    });
  }

  private _updateMovementObjects(
    threeComponentModel: ThreeComponentModel,
    nearest: BaseCatalogData[]
  ): void {
    // only if show proper motion
    if (!threeComponentModel.mainModel.showProperMotion) {
      return;
    }
    const isMessierCatalog = this._isCatalogMessier(
      threeComponentModel.mainModel.objectsImported
    );
    if (isMessierCatalog) {
      return;
    }

    const vertices = this._model.geometryMovementGlow.getAttribute('position');

    let i = 0;
    nearest.forEach((near) => {
      let vx = 0,
        vy = 0,
        vz = 0;
      if (near.vx != null) {
        vx =
          (threeComponentModel.mainModel.dateCurrent - ObjectsService.EPOCH) *
          near.vx;
        vy =
          (threeComponentModel.mainModel.dateCurrent - ObjectsService.EPOCH) *
          near.vy;
        vz =
          (threeComponentModel.mainModel.dateCurrent - ObjectsService.EPOCH) *
          near.vz;
      }
      vertices[i] = near.x + vx;
      vertices[i + 1] = near.y + vy;
      vertices[i + 2] = near.z + vz;
      i++;
    });
    (<THREE.BufferAttribute>(
      this._model.geometryMovementGlow.getAttribute('position')
    )).needsUpdate = true;
  }

  private _createClosestObjectSphereAndHelper(
    near: BaseCatalogData,
    geometrySphere: THREE.SphereBufferGeometry,
    showProperMotion: boolean,
    dateMax: number
  ): void {
    const sphere = new THREE.Object3D();
    sphere.userData.properties = near;
    sphere.translateX(near.x);
    sphere.translateY(near.y);
    sphere.translateZ(near.z);
    const materialSphere = this._getMaterialFromSpectrum(near);
    const mesh = new THREE.Mesh(geometrySphere, materialSphere);
    mesh.userData.properties = near;
    sphere.add(mesh);
    this._model.groupOfClosestObjects.add(sphere);
    sphere.add(
      this._createClosestObjectHelper(
        new THREE.Vector3(near.x, near.y, near.z),
        commonMaterialHelper
      )
    );
    if (near.vx && near.vy && near.vz) {
      sphere.add(
        this._createClosestObjectProperMotion(
          dateMax - ObjectsService.EPOCH,
          near,
          commonMaterialProperMotion
        )
      );
    }
  }

  private _createClosestObjectHelper(
    myPosition: THREE.Vector3,
    material: THREE.Material
  ): THREE.Line {
    const geometryZ = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3); // 3 vertices per point
    positions.set([0, 0, -myPosition.z]);
    positions.set([0, 0, 0], 3);
    geometryZ.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.Line(geometryZ, material);
  }

  private _createClosestObjectProperMotion(
    period: number,
    near: BaseCatalogData,
    material: THREE.Material
  ): THREE.Line {
    const geometryZ = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3); // 3 vertices per point
    positions[0] = 0;
    positions[1] = 0;
    positions[2] = 0;
    positions[3] = period * near.vx;
    positions[4] = period * near.vy;
    positions[5] = period * near.vz;
    geometryZ.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.Line(geometryZ, material);
  }

  private _getSpectrum(near: BaseCatalogData): string {
    let spectrum = 'Z';
    if (near.spect && near.spect.length > 0) {
      const idx0 = near.spect.charAt(0);
      if (this._model.basicMaterials[idx0]) {
        spectrum = idx0;
      }
    }
    return spectrum;
  }

  private _getMaterialFromSpectrum(
    near: BaseCatalogData
  ): THREE.MeshBasicMaterial {
    return this._model.basicMaterials[this._getSpectrum(near)];
  }

  private _getShaderMaterialFromSpectrum(
    near: BaseCatalogData
  ): THREE.ShaderMaterial {
    return this._model.shaderMaterials[this._getSpectrum(near)];
  }

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
      this._model.basicMaterials[key] = new THREE.MeshBasicMaterial({
        color: this._model.colors[key],
        transparent: true,
        opacity: 0.1
      });
    });
  }

  private _updateShaderMaterials(): void {
    Object.keys(this._model.colors).forEach((key: string) => {
      this._model.shaderMaterials[key] = this._getShaderMaterialWithColor(
        this._model.colors[key]
      );
    });
  }

  private _getShaderMaterialForPoint(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: {
          value: new THREE.TextureLoader().load(
            'assets/textures/star_alpha.png'
          )
        }
      },
      vertexShader: this._shadersConstant.shaderForPoints().vertex,
      fragmentShader: this._shadersConstant.shaderForPoints().fragment,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });
  }

  private _getShaderMaterialWithColor(color: number): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.1 },
        p: { value: 3.0 },
        glowColor: { value: new THREE.Color(color) },
        viewVector: {
          value: this._trackballControlsService.model.controls.target
            .clone()
            .sub(this._perspectiveCameraService.camera.position)
        }
      },
      vertexShader: this._shadersConstant.shaderForSphereAka().vertex,
      fragmentShader: this._shadersConstant.shaderForSphereAka().fragment,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
  }

  private _isCatalogMessier(objectsImported: BaseCatalogData[]): boolean {
    return (
      objectsImported &&
      objectsImported.length > 0 &&
      objectsImported[0].object_type
    );
  }
}
