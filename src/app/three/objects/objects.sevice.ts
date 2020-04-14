import * as THREE from 'three';

import { Injectable } from '@angular/core';

import { SceneService } from '../scene/scene.service';
import { ThreeComponentModel } from '../three.component.model';
import { Collection3d } from './objects.model';
import { ShadersConstant } from './shaders.constant';
import { TargetService } from '../target/target.service';

@Injectable({
  providedIn: 'root',
})
export class ObjectsService {
  //
  private static readonly NEAR = 20;
  //
  constructor(
    private _shadersConstant: ShadersConstant,
    private _targetService: TargetService
  ) {
    // Empty
  }

  public initialize(objectsImported: any): Collection3d {
    const collection3d: Collection3d = {
      nbObjects: 0,
      groupOfObjects: new THREE.Object3D(),
      groupOfObjectsHelpers: new THREE.Object3D(),
      groupOfObjectsGlow: new THREE.Object3D(),
      groupOfObjectsPoints: new THREE.Object3D(),
      shaderMaterials: {},
      basicMaterials: {},
      colors: null,
      loaded: false,
    };
    this._initMaterials(collection3d);
    collection3d.groupOfObjects.name = SceneService.GROUP_INTERSECTED_OBJECTS;
    this._createPoints(objectsImported, collection3d);
    return collection3d;
  }

  public refreshAfterLoadingCatalog(
    threeComponentModel: ThreeComponentModel
  ): void {
    threeComponentModel.average = '';
    threeComponentModel.collection3d.groupOfObjectsPoints.children = [];
    this._createPoints(
      threeComponentModel.objectsImported,
      threeComponentModel.collection3d
    );
    const first = threeComponentModel.objectsImported[0];
    const position = new THREE.Vector3(first.x, first.y, first.z);
    this._targetService.setObjectsOnClick(threeComponentModel, position);
  }

  public addObjectsInScene(
    scene: THREE.Scene,
    collection3d: Collection3d
  ): void {
    if (collection3d.groupOfObjectsPoints && !collection3d.loaded) {
      scene.add(collection3d.groupOfObjectsPoints);
      scene.add(collection3d.groupOfObjectsGlow);
      scene.add(collection3d.groupOfObjectsHelpers);
      scene.add(collection3d.groupOfObjects);
      collection3d.loaded = true;
    }
  }

  public updateProximityObjects(
    threeComponentModel: ThreeComponentModel
  ): void {
    if (!threeComponentModel.collection3d.groupOfObjects) {
      return;
    }
    this._updateShaderMaterials(
      threeComponentModel.collection3d,
      threeComponentModel.camera,
      threeComponentModel.trackballControls.controls.target
    );
    const nearest = this._getNearest(threeComponentModel);
    this._createProximityObjectsAndHelpers(threeComponentModel, nearest);
  }

  private _createPoints(
    objectsImported: any,
    collection3d: Collection3d
  ): void {
    const geometryLight = new THREE.BufferGeometry();
    const geometryGlow = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const sizes = [];

    collection3d.nbObjects = objectsImported.length;
    let maxX = 0;
    let maxY = 0;
    let maxZ = 0;
    for (let i = 0; i < collection3d.nbObjects; i++) {
      const record = objectsImported[i];
      vertices.push(record.x, record.y, record.z);
      if (maxX < record.x) {
        maxX = record.x;
      }
      if (maxY < record.y) {
        maxY = record.y;
      }
      if (maxZ < record.z) {
        maxZ = record.z;
      }
      const color = new THREE.Color(
        collection3d.colors[this._getSpectrum(collection3d, record)]
      );
      colors.push(color.r, color.g, color.b);
      sizes.push(1);
    }
    // Light points
    geometryLight.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    const materialLight = new THREE.PointsMaterial({
      size: 1,
      color: 0xffecdf,
      sizeAttenuation: false,
      alphaTest: 1,
      transparent: false,
    });
    collection3d.groupOfObjectsPoints.add(
      new THREE.Points(geometryLight, materialLight)
    );
    // Glow points (for stars catalog only)
    if (!this._isCatalogMessier(objectsImported)) {
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
      collection3d.groupOfObjectsPoints.add(
        new THREE.Points(geometryGlow, materialGlow)
      );
    }
  }

  private _getNearest(threeComponentModel: ThreeComponentModel): any[] {
    const camera = threeComponentModel.camera;
    const target = threeComponentModel.trackballControls.controls.target;
    let nears = [];
    for (let i = 0; i < threeComponentModel.objectsImported.length; i++) {
      const record = threeComponentModel.objectsImported[i];
      const pos = new THREE.Vector3(record.x, record.y, record.z);
      const target2 = new THREE.Vector3(target.x, target.y, target.z);
      const pos2 = new THREE.Vector3(record.x, record.y, record.z);
      const angle = target2
        .sub(camera.position)
        .angleTo(pos2.sub(camera.position));
      if (
        pos.distanceTo(camera.position) <
          ObjectsService.NEAR * threeComponentModel.scale &&
        angle <= (camera.fov * Math.PI) / 180
      ) {
        nears.push(record);
      }
    }
    return nears;
  }

  private _createProximityObjectsAndHelpers(
    threeComponentModel: ThreeComponentModel,
    nearest: any[]
  ): void {
    threeComponentModel.collection3d.groupOfObjects.children = [];
    threeComponentModel.collection3d.groupOfObjectsHelpers.children = [];
    threeComponentModel.collection3d.groupOfObjectsGlow.children = [];

    const materialHelper = new THREE.LineBasicMaterial({
      color: 0xfffff,
      transparent: true,
      opacity: 0.2,
    });
    const geometrySphere = new THREE.SphereBufferGeometry(0.02, 32, 16);
    const geometryPlane = new THREE.PlaneBufferGeometry(0.5, 0.5, 1);
    // const geometrySphereGlow = new THREE.SphereGeometry(0.02, 32, 16);

    const isMessierCatalog = this._isCatalogMessier(
      threeComponentModel.objectsImported
    );
    nearest.forEach((near) => {
      if (!isMessierCatalog) {
        const sphere = new THREE.Object3D();
        sphere.translateX(near.x);
        sphere.translateY(near.y);
        sphere.translateZ(near.z);
        const materialSphere = this._getMaterialFromSpectrum(
          threeComponentModel.collection3d,
          near
        );
        const object = new THREE.Mesh(geometrySphere, materialSphere);
        object.userData.properties = near;
        sphere.add(object);
        threeComponentModel.collection3d.groupOfObjects.add(sphere);
      } else {
        const plane = new THREE.Object3D();
        plane.translateX(near.x);
        plane.translateY(near.y);
        plane.translateZ(near.z);
        let materialTexture;
        const matKey = Object.keys(
          threeComponentModel.collection3d.shaderMaterials
        ).find((k) => k === near.id);
        if (!matKey) {
          const texture = new THREE.TextureLoader().load('./assets/m1.jpg');
          materialTexture = new THREE.MeshBasicMaterial({
            alphaMap: texture,
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
          });
          threeComponentModel.collection3d.shaderMaterials[
            near.id
          ] = materialTexture;
        } else {
          materialTexture =
            threeComponentModel.collection3d.shaderMaterials[matKey];
        }
        const object = new THREE.Mesh(geometryPlane, materialTexture);
        object.userData.properties = near;
        const from = new THREE.Vector3(0, 0, 1);
        const to = new THREE.Vector3(-near.x, -near.y, -near.z).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(from, to);
        object.applyQuaternion(quat);
        plane.add(object);
        threeComponentModel.collection3d.groupOfObjects.add(plane);
      }
      this._createObjectHelper(
        threeComponentModel.collection3d,
        new THREE.Vector3(near.x, near.y, near.z),
        materialHelper
      );
    });
  }

  private _createObjectHelper(
    collection3d: Collection3d,
    myPosition: THREE.Vector3,
    material: THREE.Material
  ) {
    const geometryZ = new THREE.Geometry();
    geometryZ.vertices.push(
      new THREE.Vector3(myPosition.x, myPosition.y, myPosition.z),
      new THREE.Vector3(myPosition.x, myPosition.y, 0)
    );
    collection3d.groupOfObjectsHelpers.add(new THREE.Line(geometryZ, material));
  }

  private _getSpectrum(collection3d: Collection3d, near: any): string {
    let spectrum = 'Z';
    if (near.spect && near.spect.length > 0) {
      const idx0 = near.spect.charAt(0);
      if (collection3d.basicMaterials[idx0]) {
        spectrum = idx0;
      }
    }
    return spectrum;
  }

  private _getMaterialFromSpectrum(
    collection3d: Collection3d,
    near: any
  ): THREE.MeshBasicMaterial {
    return collection3d.basicMaterials[this._getSpectrum(collection3d, near)];
  }

  private _getShaderMaterialFromSpectrum(
    collection3d: Collection3d,
    near: any
  ): THREE.ShaderMaterial {
    return collection3d.shaderMaterials[this._getSpectrum(collection3d, near)];
  }

  private _initMaterials(collection3d: Collection3d): void {
    collection3d.colors = {
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
      Y: 0x999999,
    };
    Object.keys(collection3d.colors).forEach((key: string) => {
      collection3d.basicMaterials[key] = new THREE.MeshBasicMaterial({
        color: collection3d.colors[key],
        transparent: true,
        opacity: 0.1,
      });
    });
  }

  private _updateShaderMaterials(
    collection3d: Collection3d,
    camera: THREE.PerspectiveCamera,
    target: THREE.Vector3
  ): void {
    Object.keys(collection3d.colors).forEach((key: string) => {
      collection3d.shaderMaterials[key] = this._getShaderMaterialWithColor(
        collection3d.colors[key],
        camera,
        target
      );
    });
  }

  private _getShaderMaterialForPoint(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: {
          value: new THREE.TextureLoader().load(
            'assets/textures/star_alpha.png'
          ),
        },
      },
      vertexShader: this._shadersConstant.shaderForPoints().vertex,
      fragmentShader: this._shadersConstant.shaderForPoints().fragment,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
    });
  }

  private _getShaderMaterialWithColor(
    color: any,
    camera: THREE.PerspectiveCamera,
    target: THREE.Vector3
  ): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        c: { type: 'f', value: 0.1 },
        p: { type: 'f', value: 3.0 },
        glowColor: { type: 'c', value: new THREE.Color(color) },
        viewVector: { type: 'v3', value: target.clone().sub(camera.position) },
      },
      vertexShader: this._shadersConstant.shaderForSphereAka().vertex,
      fragmentShader: this._shadersConstant.shaderForSphereAka().fragment,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
  }

  private _isCatalogMessier(objectsImported: any): boolean {
    return (
      objectsImported &&
      objectsImported.length > 0 &&
      objectsImported[0].object_type
    );
  }
}
