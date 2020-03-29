import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ThreeComponentModel } from '../three.component.model';
import { StarsModel } from './stars.model';
import { ShadersConstant } from './shaders.constant';

@Injectable({
  providedIn: 'root'
})
export class StarsService {
  constructor(private _shadersConstant: ShadersConstant) {
    // Empty
  }

  public initialize(starsImported: any): StarsModel {
    const starsModel: StarsModel = {
      groupOfStars: new THREE.Object3D(),
      groupOfStarsHelpers: new THREE.Object3D(),
      groupOfStarsGlow: new THREE.Object3D(),
      nbStars: 0,
      starsPoints: new THREE.Object3D(),
      shaderMaterials: {},
      basicMaterials: {},
      colors: null,
      loaded: false,
      meshStars: []
    };
    this._initMaterials(starsModel);
    starsModel.groupOfStars.name = 'GroupOfStars';
    this._createPoints(starsImported, starsModel);
    return starsModel;
  }

  public addStarObjectsInScene(
    scene: THREE.Scene,
    starsModel: StarsModel
  ): void {
    if (starsModel.starsPoints && !starsModel.loaded) {
      scene.add(starsModel.starsPoints);
      // scene.add(starsModel.groupOfStarsGlow);
      scene.add(starsModel.groupOfStarsHelpers);
      scene.add(starsModel.groupOfStars);
      starsModel.loaded = true;
    }
  }

  public updateProximityStars(threeComponentModel: ThreeComponentModel): void {
    if (!threeComponentModel.starsModel.groupOfStars) {
      return;
    }
    this._updateShaderMaterials(
      threeComponentModel.starsModel,
      threeComponentModel.camera,
      threeComponentModel.trackballControls.controls.target
    );
    const nearest = this._getNearest(threeComponentModel);
    this._createSpheresAndHelpers(threeComponentModel.starsModel, nearest);
  }

  public getPositionFromId(id: number, starsImported: any): THREE.Vector3 {
    let goodRecord = starsImported.find(record => record.id === +id);
    if (goodRecord) {
      return new THREE.Vector3(goodRecord.x, goodRecord.y, goodRecord.z);
    } else {
      return null;
    }
  }

  private _createPoints(starsImported: any, starsModel: StarsModel): void {
    const geometryLight = new THREE.BufferGeometry();
    const geometryGlow = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const sizes = [];

    starsModel.nbStars = starsImported.length;
    let maxX = 0;
    let maxY = 0;
    let maxZ = 0;
    for (let i = 0; i < starsModel.nbStars; i++) {
      const record = starsImported[i];
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
        starsModel.colors[this._getSpectrum(starsModel, record)]
      );
      colors.push(color.r, color.g, color.b);
      sizes.push(0.5);
    }
    geometryLight.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
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
    const materialLight = new THREE.PointsMaterial({
      size: 1,
      color: 0xffecdf,
      sizeAttenuation: false,
      alphaTest: 1,
      transparent: false
    });
    starsModel.starsPoints.add(new THREE.Points(geometryLight, materialLight));
    starsModel.starsPoints.add(new THREE.Points(geometryGlow, materialGlow));
  }

  private _getNearest(threeComponentModel: ThreeComponentModel): any[] {
    const camera = threeComponentModel.camera;
    const target = threeComponentModel.trackballControls.controls.target;
    let nears = [];
    for (let i = 0; i < threeComponentModel.starsImported.length; i++) {
      const record = threeComponentModel.starsImported[i];
      const pos = new THREE.Vector3(record.x, record.y, record.z);
      const target2 = new THREE.Vector3(target.x, target.y, target.z);
      const pos2 = new THREE.Vector3(record.x, record.y, record.z);
      const angle = target2
        .sub(camera.position)
        .angleTo(pos2.sub(camera.position));
      if (
        pos.distanceTo(camera.position) < 20 &&
        angle <= (camera.fov * Math.PI) / 180
      ) {
        nears.push(record);
      }
    }
    return nears;
  }

  private _createSpheresAndHelpers(
    starsModel: StarsModel,
    nearest: any[]
  ): void {
    starsModel.meshStars = [];
    starsModel.groupOfStars.children = [];
    starsModel.groupOfStarsHelpers.children = [];
    starsModel.groupOfStarsGlow.children = [];
    const materialHelper = new THREE.LineBasicMaterial({
      color: 0xfffff,
      transparent: true,
      opacity: 0.2
    });
    const geometrySphere = new THREE.SphereBufferGeometry(0.01, 32, 16);
    // const geometrySphereGlow = new THREE.SphereGeometry(0.02, 32, 16);

    nearest.forEach(near => {
      const materialSphere = this._getMaterialFromSpectrum(starsModel, near);
      const star = new THREE.Mesh(geometrySphere, materialSphere);
      star.translateX(near.x);
      star.translateY(near.y);
      star.translateZ(near.z);
      star.userData.hyg = near;
      // starsModel.meshStars.push(star);
      starsModel.groupOfStars.add(star);
      this._createStarHelper(
        starsModel,
        new THREE.Vector3(near.x, near.y, near.z),
        materialHelper
      );
      /*
      const materialSphereGlow = this._getShaderMaterialFromSpectrum(
        starsModel,
        near
      );
      const starGlow = new THREE.Mesh(geometrySphereGlow, materialSphereGlow);
      starGlow.translateX(near.x);
      starGlow.translateY(near.y);
      starGlow.translateZ(near.z);
      starGlow.userData.hyg = near;
      starsModel.groupOfStarsGlow.add(starGlow);
      */
    });
  }

  private _createStarHelper(
    starsModel: StarsModel,
    myPosition: THREE.Vector3,
    material: THREE.Material
  ) {
    const geometryZ = new THREE.Geometry();
    geometryZ.vertices.push(
      new THREE.Vector3(myPosition.x, myPosition.y, myPosition.z),
      new THREE.Vector3(myPosition.x, myPosition.y, 0)
    );
    starsModel.groupOfStarsHelpers.add(new THREE.Line(geometryZ, material));
  }

  private _getSpectrum(starsModel: StarsModel, near: any): string {
    let spectrum = 'Z';
    if (near.spect && near.spect.length > 0) {
      const idx0 = near.spect.charAt(0);
      if (starsModel.basicMaterials[idx0]) {
        spectrum = idx0;
      }
    }
    return spectrum;
  }

  private _getMaterialFromSpectrum(
    starsModel: StarsModel,
    near: any
  ): THREE.MeshBasicMaterial {
    return starsModel.basicMaterials[this._getSpectrum(starsModel, near)];
  }

  private _getShaderMaterialFromSpectrum(
    starsModel: StarsModel,
    near: any
  ): THREE.ShaderMaterial {
    return starsModel.shaderMaterials[this._getSpectrum(starsModel, near)];
  }

  private _initMaterials(starsModel: StarsModel): void {
    starsModel.colors = {
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
    Object.keys(starsModel.colors).forEach((key: string) => {
      starsModel.basicMaterials[key] = new THREE.MeshBasicMaterial({
        color: starsModel.colors[key]
      });
    });
  }

  private _updateShaderMaterials(
    starsModel: StarsModel,
    camera: THREE.PerspectiveCamera,
    target: THREE.Vector3
  ): void {
    Object.keys(starsModel.colors).forEach((key: string) => {
      starsModel.shaderMaterials[key] = this._getShaderMaterialWithColor(
        starsModel.colors[key],
        camera,
        target
      );
    });
  }

  private _getShaderMaterialForPoint(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: {
          value: new THREE.TextureLoader().load('assets/textures/spark1.png')
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
        viewVector: { type: 'v3', value: target.clone().sub(camera.position) }
      },
      vertexShader: this._shadersConstant.shaderForPoints().vertex,
      fragmentShader: this._shadersConstant.shaderForPoints().fragment,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    /*
    return new THREE.ShaderMaterial({
      depthWrite: false,
      fragmentShader,
      transparent: true,
      uniforms: {
        coefficient: {
          type: 'f',
          value: 0.5
        },
        color: {
          type: 'c',
          value: new THREE.Color(color)
        },
        power: {
          type: 'f',
          value: 1
        }
      },
      vertexShader,
      side: THREE.FrontSide,
      blending: THREE.NormalBlending
    });
    */
  }
}
