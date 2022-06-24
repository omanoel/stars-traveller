import { Injectable } from '@angular/core';
import { MainModel } from '@app/app.model';
import {
  BufferAttribute,
  BufferGeometry,
  Frustum,
  Line,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  SphereBufferGeometry,
  Vector3
} from 'three';
import { BaseCatalogData } from '../../../shared/catalog/catalog.model';
import { PerspectiveCameraService } from '../perspective-camera/perspective-camera.service';
import { TextService } from '../text/text.service';
import {
  ATTRIBUTE_POSITION,
  Collection3d,
  commonMaterialHelper,
  commonMaterialProperMotion
} from './objects.model';

@Injectable({
  providedIn: 'root'
})
export class StarsCloseCameraService {
  //
  private readonly EPOCH_MAX = 10000;
  private readonly EPOCH = 2000;
  private readonly CLOSEST_DISTANCE = 20;

  //
  constructor(
    private _perspectiveCameraService: PerspectiveCameraService,
    private _textService: TextService
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
    if (mainModel.timeline.deltaEpoch === 0) {
      mainModel.objectsNearest = this._getClosestObjectsInFrustum(mainModel);
      this._createOrUpdateClosestObjectsAndHelpers(model, mainModel);
    } else {
      model.groupOfClosestObjects.children = [];
      model.groupOfClosestObjectsLabel.children = [];
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
    const nearestIds = nearest.map((near) => near.id);
    // remove not in frustum closest objects
    model.groupOfClosestObjects.children =
      model.groupOfClosestObjects.children.filter((c) =>
        nearestIds.includes(c.userData.properties.id)
      );
    model.groupOfClosestObjectsLabel.children =
      model.groupOfClosestObjectsLabel.children.filter((c) =>
        nearestIds.includes(c.userData.properties.id)
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
        if (near.proper) {
          const label = this._textService.create(near);
          model.groupOfClosestObjectsLabel.add(label);
        }
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
      ATTRIBUTE_POSITION,
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
      ATTRIBUTE_POSITION,
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
}
