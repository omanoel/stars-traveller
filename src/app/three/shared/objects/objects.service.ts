import { Injectable } from '@angular/core';
import { MainModel } from '@app/app.model';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  FrontSide,
  Frustum,
  Line,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
  Points,
  PointsMaterial,
  Quaternion,
  ShaderMaterial,
  SphereBufferGeometry,
  TextureLoader,
  Vector3
} from 'three';

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
  private static readonly CLOSEST_DISTANCE = 20;
  private static readonly NEAR_GLOW_POINTS = 'NEAR_GLOW_POINTS';
  private static readonly LIGHT_POINTS = 'LIGHT_POINTS';
  private static readonly GLOW_POINTS = 'GLOW_POINTS';

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

  public initialize(): void {
    this._model = {
      nbObjects: 0,
      groupOfObjectsPoints: new Object3D(),
      groupOfClosestObjects: new Object3D(),
      groupOfClosestObjectsHelpers: new Object3D(),
      groupOfClosestObjectsProperMotion: new Object3D(),
      groupOfObjectsMovement: new Object3D(),
      geometryMovementGlow: null,
      shaderMaterials: new Map<string, ShaderMaterial>(),
      basicMaterials: new Map<string, MeshBasicMaterial>(),
      colors: null,
      loaded: false
    };
    this._initMaterials();
    this._model.groupOfClosestObjects.name =
      SceneService.GROUP_INTERSECTED_OBJECTS;
  }

  public refreshAfterLoadingCatalog(mainModel: MainModel): void {
    mainModel.average = '';
    this._model.groupOfObjectsPoints.children = [];
    this._model.groupOfClosestObjectsHelpers.children = [];
    this._model.groupOfClosestObjects.children = [];
    this._model.groupOfObjectsMovement.children = [];
    this._model.groupOfClosestObjectsProperMotion.children = [];
    this.createObjectsAsPoints(mainModel.objectsImported);
    const first = mainModel.objectsImported[0];
    const position = new Vector3(first.x, first.y, first.z);
    this._targetService.goToThisPosition(position);
  }

  public addObjectsInScene(): void {
    if (this._model.groupOfObjectsPoints && !this._model.loaded) {
      this._sceneService.model.add(this._model.groupOfObjectsPoints);
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
      nearest,
      nearest.length === this._model.groupOfClosestObjects.children.length - 1
    );
    this._model.groupOfObjectsPoints.children
      // .filter((point) => point.name === ObjectsService.LIGHT_POINTS)
      .forEach((point) => {
        point.visible = !threeComponentModel.mainModel.near;
      });
  }

  // ========================================================================
  // Create objects as points (light and glow)
  // ========================================================================
  public createObjectsAsPoints(objectsImported: BaseCatalogData[]): void {
    const vertices = [];
    const colors = [];
    const sizes = [];

    this._model.nbObjects = objectsImported.length;
    for (let i = 0; i < this._model.nbObjects; i++) {
      const record = objectsImported[i];
      vertices.push(record.x, record.y, record.z);
      const color = new Color(this._model.colors[this._getSpectrum(record)]);
      colors.push(color.r, color.g, color.b);
      sizes.push(1);
    }

    // Light points
    const geometryLight = new BufferGeometry();
    geometryLight.setAttribute(
      'position',
      new Float32BufferAttribute(vertices, 3)
    );
    const materialLight = new PointsMaterial({
      size: 1,
      color: 0xffecdf,
      sizeAttenuation: false,
      alphaTest: 1,
      transparent: false
    });
    const lightPoints = new Points(geometryLight, materialLight);
    lightPoints.name = ObjectsService.LIGHT_POINTS;
    this._model.groupOfObjectsPoints.add(lightPoints);

    // Glow points (for stars catalog only)
    if (!this._isCatalogMessier(objectsImported)) {
      const geometryGlow = new BufferGeometry();
      geometryGlow.setAttribute(
        'position',
        new Float32BufferAttribute(vertices, 3)
      );
      geometryGlow.setAttribute('color', new Float32BufferAttribute(colors, 3));
      geometryGlow.setAttribute('size', new Float32BufferAttribute(sizes, 1));
      const materialGlow = this._getShaderMaterialForPoint();
      const glowPoints = new Points(geometryGlow, materialGlow);
      glowPoints.name = ObjectsService.GLOW_POINTS;
      this._model.groupOfObjectsPoints.add(glowPoints);
    }
  }

  public refreshShaders(): void {
    const alreadyGlowPoints = this._model.groupOfClosestObjects.children.find(
      (c) => c.name === ObjectsService.NEAR_GLOW_POINTS
    );
    if (alreadyGlowPoints) {
      this._model.groupOfClosestObjects.remove(alreadyGlowPoints);
      const geometryGlow = new BufferGeometry();
      geometryGlow.setAttribute(
        'position',
        (<any>alreadyGlowPoints).geometry.getAttribute('position')
      );
      geometryGlow.setAttribute(
        'color',
        (<any>alreadyGlowPoints).geometry.getAttribute('color')
      );
      geometryGlow.setAttribute(
        'size',
        (<any>alreadyGlowPoints).geometry.getAttribute('size')
      );
      const materialGlow = this._getShaderMaterialForPoint();
      const glowPoints = new Points(geometryGlow, materialGlow);
      glowPoints.name = ObjectsService.NEAR_GLOW_POINTS;
      glowPoints.userData = {
        properties: {
          id: -1
        }
      };
      this._model.groupOfClosestObjects.add(glowPoints);
    }
  }

  private _getClosestObjectsInFrustum(mainModel: MainModel): BaseCatalogData[] {
    const camera = this._perspectiveCameraService.camera;
    const frustum = new Frustum();
    frustum.setFromProjectionMatrix(
      new Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );
    const nears: BaseCatalogData[] = [];
    for (let i = 0; i < mainModel.objectsImported.length; i++) {
      const record = mainModel.objectsImported[i];
      const pos = new Vector3(record.x, record.y, record.z);
      if (
        frustum.containsPoint(pos) &&
        camera.position.distanceTo(pos) < ObjectsService.CLOSEST_DISTANCE
      ) {
        nears.push(record);
      }
    }
    return nears;
  }

  private _updateClosestObjectsAndHelpers(
    mainModel: MainModel,
    nearest: BaseCatalogData[],
    needsUpdate: boolean
  ): void {
    const isMessierCatalog = this._isCatalogMessier(mainModel.objectsImported);
    const nearestIds = nearest.map((near) => near.id);
    // add new glow points
    const vertices = [];
    const colors = [];
    const sizes = [];
    if (mainModel.near) {
      nearest.forEach((record) => {
        vertices.push(record.x, record.y, record.z);
        const color = new Color(this._model.colors[this._getSpectrum(record)]);
        colors.push(color.r, color.g, color.b);
        sizes.push(1);
      });
    }
    // remove all previous glow points
    const alreadyGlowPoints = this._model.groupOfClosestObjects.children.find(
      (c) => c.name === ObjectsService.NEAR_GLOW_POINTS
    );
    if (!alreadyGlowPoints) {
      const geometryGlow = new BufferGeometry();
      geometryGlow.setAttribute(
        'position',
        new Float32BufferAttribute(vertices, 3)
      );
      geometryGlow.setAttribute('color', new Float32BufferAttribute(colors, 3));
      geometryGlow.setAttribute('size', new Float32BufferAttribute(sizes, 1));
      const materialGlow = this._getShaderMaterialForPoint();
      const glowPoints = new Points(geometryGlow, materialGlow);
      glowPoints.name = ObjectsService.NEAR_GLOW_POINTS;
      glowPoints.userData = {
        properties: {
          id: -1
        }
      };
      this._model.groupOfClosestObjects.add(glowPoints);
    } else {
      if (needsUpdate) {
        (<any>alreadyGlowPoints).geometry.setAttribute(
          'position',
          new Float32BufferAttribute(vertices, 3)
        );
        (<any>alreadyGlowPoints).geometry.setAttribute(
          'color',
          new Float32BufferAttribute(colors, 3)
        );
        (<any>alreadyGlowPoints).geometry.setAttribute(
          'size',
          new Float32BufferAttribute(sizes, 1)
        );
        (<any>alreadyGlowPoints).geometry.verticesNeedUpdate = true;
      } else {
        (<any>alreadyGlowPoints).geometry.verticesNeedUpdate = false;
      }
    }
    // remove not in frustum closest objects
    this._model.groupOfClosestObjects.children =
      this._model.groupOfClosestObjects.children.filter(
        (c) =>
          nearestIds.includes(c.userData.properties.id) ||
          c.name === ObjectsService.NEAR_GLOW_POINTS
      );

    // add not existing closest objects
    const geometrySphere = new SphereBufferGeometry(0.02, 32, 16);
    nearest.forEach((near) => {
      const alreadyInClosest = this._model.groupOfClosestObjects.children.find(
        (c) => c.userData.properties.id === near.id
      );
      if (alreadyInClosest === undefined) {
        if (!isMessierCatalog) {
          const closest = this._createClosestObjectSphereAndHelper(
            near,
            geometrySphere,
            mainModel.showProperMotion,
            mainModel.dateMax
          );
          this._model.groupOfClosestObjects.add(closest);
        } else {
          const geometryPlane = new PlaneBufferGeometry(0.5, 0.5, 1);
          nearest.forEach((near) => {
            const plane = new Object3D();
            plane.translateX(near.x);
            plane.translateY(near.y);
            plane.translateZ(near.z);
            let materialTexture;
            const matKey = Object.keys(this._model.shaderMaterials).find(
              (k) => k === near.id
            );
            if (!matKey) {
              const texture = new TextureLoader().load(
                './assets/messier/' + near.id + '.jpg'
              );
              materialTexture = new MeshBasicMaterial({
                alphaMap: texture,
                map: texture,
                transparent: true,
                side: DoubleSide
              });
              this._model.shaderMaterials[near.id] = materialTexture;
            } else {
              materialTexture = this._model.shaderMaterials[matKey];
            }
            const object = new Mesh(geometryPlane, materialTexture);
            object.userData.properties = near;
            const from = new Vector3(0, 0, 1);
            const to = new Vector3(-near.x, -near.y, -near.z).normalize();
            const quat = new Quaternion().setFromUnitVectors(from, to);
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
    (<BufferAttribute>(
      this._model.geometryMovementGlow.getAttribute('position')
    )).needsUpdate = true;
  }

  private _createClosestObjectSphereAndHelper(
    near: BaseCatalogData,
    geometrySphere: SphereBufferGeometry,
    showProperMotion: boolean,
    dateMax: number
  ): Object3D {
    const sphere = new Object3D();
    sphere.userData.properties = near;
    sphere.translateX(near.x);
    sphere.translateY(near.y);
    sphere.translateZ(near.z);
    const materialSphere = this._getMaterialFromSpectrum(near);
    const mesh = new Mesh(geometrySphere, materialSphere);
    mesh.userData.properties = near;
    sphere.add(mesh);
    this._model.groupOfClosestObjects.add(sphere);
    sphere.add(
      this._createClosestObjectHelper(
        new Vector3(near.x, near.y, near.z),
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
    return sphere;
  }

  private _createClosestObjectHelper(
    myPosition: Vector3,
    material: Material
  ): Line {
    const geometryZ = new BufferGeometry();
    const positions = new Float32Array(2 * 3); // 3 vertices per point
    positions.set([0, 0, -myPosition.z]);
    positions.set([0, 0, 0], 3);
    geometryZ.setAttribute('position', new BufferAttribute(positions, 3));
    return new Line(geometryZ, material);
  }

  private _createClosestObjectProperMotion(
    period: number,
    near: BaseCatalogData,
    material: Material
  ): Line {
    const geometryZ = new BufferGeometry();
    const positions = new Float32Array(2 * 3); // 3 vertices per point
    positions[0] = 0;
    positions[1] = 0;
    positions[2] = 0;
    positions[3] = period * near.vx;
    positions[4] = period * near.vy;
    positions[5] = period * near.vz;
    geometryZ.setAttribute('position', new BufferAttribute(positions, 3));
    return new Line(geometryZ, material);
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

  private _getMaterialFromSpectrum(near: BaseCatalogData): MeshBasicMaterial {
    return this._model.basicMaterials[this._getSpectrum(near)];
  }

  private _getShaderMaterialFromSpectrum(
    near: BaseCatalogData
  ): ShaderMaterial {
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
      this._model.basicMaterials[key] = new MeshBasicMaterial({
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

  private _getShaderMaterialForPoint(): ShaderMaterial {
    return new ShaderMaterial({
      uniforms: {
        pointTexture: {
          value: new TextureLoader().load('assets/textures/star_alpha.png')
        },
        magnitude: { value: 1.0 }
      },
      vertexShader: this._shadersConstant.shaderForPoints().vertex,
      fragmentShader: this._shadersConstant.shaderForPoints().fragment,
      blending: AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });
  }

  private _getShaderMaterialWithColor(color: number): ShaderMaterial {
    return new ShaderMaterial({
      uniforms: {
        c: { value: 0.1 },
        p: { value: 3.0 },
        glowColor: { value: new Color(color) },
        viewVector: {
          value: this._trackballControlsService.model.controls.target
            .clone()
            .sub(this._perspectiveCameraService.camera.position)
        }
      },
      vertexShader: this._shadersConstant.shaderForSphereAka().vertex,
      fragmentShader: this._shadersConstant.shaderForSphereAka().fragment,
      side: FrontSide,
      blending: AdditiveBlending,
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
