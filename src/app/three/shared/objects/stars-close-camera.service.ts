import { Injectable } from '@angular/core';
import { MainModel } from '@app/app.model';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  Frustum,
  Line,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Points,
  ShaderMaterial,
  SphereBufferGeometry,
  TextureLoader,
  Vector3
} from 'three';
import { BaseCatalogData } from '../../../shared/catalog/catalog.model';
import { PerspectiveCameraService } from '../perspective-camera/perspective-camera.service';
import {
  Collection3d,
  commonMaterialHelper,
  commonMaterialProperMotion
} from './objects.model';
import { ShadersConstant } from './shaders.constant';

@Injectable({
  providedIn: 'root'
})
export class StarsCloseCameraService {
  //
  private readonly EPOCH_MAX = 10000;
  private readonly EPOCH = 2000;
  private readonly CLOSEST_DISTANCE = 20;
  private readonly CLOSE_CAMERA_POINTS = 'CLOSE_CAMERA_POINTS';
  private readonly ATTRIBUTE_POSITION = 'position';
  private readonly ATTRIBUTE_COLOR = 'color';
  private readonly ATTRIBUTE_SIZE = 'size';

  //
  constructor(
    private _shadersConstant: ShadersConstant,
    private _perspectiveCameraService: PerspectiveCameraService
  ) {
    // Empty
  }

  public createOrUpdate(model: Collection3d, mainModel: MainModel): void {
    if (!model.groupOfClosestObjects) {
      return;
    }
    if (mainModel.showProperMotion) {
      commonMaterialProperMotion.opacity = 0.5;
    } else {
      commonMaterialProperMotion.opacity = 0;
    }
    mainModel.objectsNearest = this._getClosestObjectsInFrustum(mainModel);
    this._createOrUpdateClosestObjectsAndHelpers(model, mainModel);
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
    for (let i = 0; i < mainModel.objectsFiltered.length; i++) {
      const record = mainModel.objectsFiltered[i];
      const pos = new Vector3(record.x, record.y, record.z);
      if (
        frustum.containsPoint(pos) &&
        camera.position.distanceTo(pos) < this.CLOSEST_DISTANCE
      ) {
        nears.push(record);
      }
    }
    return nears;
  }

  private _createOrUpdateClosestObjectsAndHelpers(
    model: Collection3d,
    mainModel: MainModel
  ): void {
    const nearest = mainModel.objectsNearest;
    const needsUpdate =
      mainModel.objectsNearest.length ===
      model.groupOfClosestObjects.children.length - 1;
    const nearestIds = nearest.map((near) => near.id);
    // add new glow points
    const vertices = [];
    const colors = [];
    const sizes = [];
    // remove all previous glow points
    const alreadyGlowPoints = model.groupOfClosestObjects.children.find(
      (c) => c.name === this.CLOSE_CAMERA_POINTS
    );
    if (!alreadyGlowPoints) {
      const geometryGlow = new BufferGeometry();
      geometryGlow.setAttribute(
        this.ATTRIBUTE_POSITION,
        new Float32BufferAttribute(vertices, 3)
      );
      geometryGlow.setAttribute(
        this.ATTRIBUTE_COLOR,
        new Float32BufferAttribute(colors, 3)
      );
      geometryGlow.setAttribute(
        this.ATTRIBUTE_SIZE,
        new Float32BufferAttribute(sizes, 1)
      );
      const materialGlow = this._getShaderMaterialForPoint();
      const glowPoints = new Points(geometryGlow, materialGlow);
      glowPoints.name = this.CLOSE_CAMERA_POINTS;
      glowPoints.userData = {
        properties: {
          id: -1
        }
      };
      model.groupOfClosestObjects.add(glowPoints);
    } else {
      const geometryGlowPoints = (<Points>alreadyGlowPoints).geometry;
      if (needsUpdate) {
        geometryGlowPoints.setAttribute(
          this.ATTRIBUTE_POSITION,
          new Float32BufferAttribute(vertices, 3)
        );
        geometryGlowPoints.setAttribute(
          this.ATTRIBUTE_COLOR,
          new Float32BufferAttribute(colors, 3)
        );
        geometryGlowPoints.setAttribute(
          this.ATTRIBUTE_SIZE,
          new Float32BufferAttribute(sizes, 1)
        );
      }
    }
    // remove not in frustum closest objects
    model.groupOfClosestObjects.children =
      model.groupOfClosestObjects.children.filter(
        (c) =>
          nearestIds.includes(c.userData.properties.id) ||
          c.name === this.CLOSE_CAMERA_POINTS
      );

    // add not existing closest objects
    const geometrySphere = new SphereBufferGeometry(0.02, 32, 16);
    nearest.forEach((near) => {
      const alreadyInClosest = model.groupOfClosestObjects.children.find(
        (c) => c.userData.properties.id === near.id
      );
      if (alreadyInClosest === undefined) {
        const closest = this._createClosestObjectSphereAndHelper(
          model,
          near,
          geometrySphere
        );
        model.groupOfClosestObjects.add(closest);
      }
    });
  }

  private _createClosestObjectSphereAndHelper(
    model: Collection3d,
    near: BaseCatalogData,
    geometrySphere: SphereBufferGeometry
  ): Object3D {
    const sphere = new Object3D();
    sphere.userData.properties = near;
    sphere.translateX(near.x);
    sphere.translateY(near.y);
    sphere.translateZ(near.z);
    const materialSphere = this._getMaterialFromSpectrum(model, near);
    const mesh = new Mesh(geometrySphere, materialSphere);
    mesh.userData.properties = near;
    sphere.add(mesh);
    model.groupOfClosestObjects.add(sphere);
    sphere.add(
      this._createClosestObjectHelper(
        new Vector3(near.x, near.y, near.z),
        commonMaterialHelper
      )
    );
    if (near.vx && near.vy && near.vz) {
      sphere.add(
        this._createClosestObjectProperMotion(
          this.EPOCH_MAX - this.EPOCH,
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
    geometryZ.setAttribute(
      this.ATTRIBUTE_POSITION,
      new BufferAttribute(positions, 3)
    );
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
    geometryZ.setAttribute(
      this.ATTRIBUTE_POSITION,
      new BufferAttribute(positions, 3)
    );
    return new Line(geometryZ, material);
  }

  private _getSpectrum(model: Collection3d, near: BaseCatalogData): string {
    let spectrum = 'Z';
    if (near.spect && near.spect.length > 0) {
      const idx0 = near.spect.charAt(0);
      if (model.basicMaterials[idx0]) {
        spectrum = idx0;
      }
    }
    return spectrum;
  }

  private _getMaterialFromSpectrum(
    model: Collection3d,
    near: BaseCatalogData
  ): MeshBasicMaterial {
    return model.basicMaterials[this._getSpectrum(model, near)];
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
}
