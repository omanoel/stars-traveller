import * as THREE from 'three';

import { Injectable } from '@angular/core';

import { ReferentielModel } from './referentiel.model';
import { PerspectiveCameraService } from '../perspective-camera/perspective-camera.service';
import { SceneService } from '../scene/scene.service';

@Injectable({
  providedIn: 'root'
})
export class ReferentielService {
  private static readonly COUNT = 20;
  private static readonly FACTOR = 4;

  private _model: ReferentielModel;

  constructor(
    private _sceneService: SceneService,
    private _perspectiveCameraService: PerspectiveCameraService
  ) {
    // Empty
  }

  public get model(): ReferentielModel {
    return this._model;
  }

  public initialize(): void {
    const color = 0xffffff;
    const distance = this._perspectiveCameraService.camera.position.distanceTo(
      new THREE.Vector3(0, 0, 0)
    );
    this._model = {
      distReference: distance,
      objects: this._buildObjects(color, distance)
    };
  }

  public update(): void {
    const dist = this._perspectiveCameraService.camera.position.distanceTo(
      new THREE.Vector3(0, 0, 0)
    );
    if (dist > this._model.distReference * (ReferentielService.FACTOR - 1)) {
      this._model.distReference = dist;
      this._updateObjects();
    } else if (dist < this._model.distReference) {
      this._model.distReference = dist / (ReferentielService.FACTOR - 1);
      this._updateObjects();
    }
  }

  private _updateObjects(): void {
    for (const ellipse of this._model.objects) {
      this._sceneService.model.remove(ellipse);
    }
    const color = 0xffffff;
    this._model.objects = this._buildObjects(color, this._model.distReference);
    for (const ellipse of this._model.objects) {
      this._sceneService.model.add(ellipse);
    }
  }

  private _buildObjects(color: number, distance: number): THREE.Line[] {
    const objects: THREE.Line[] = [];
    this._buildLinesXY(objects, color, distance);
    this._buildEllipsesOnXY(objects, color, distance);
    return objects;
  }

  private _buildLinesXY(
    objects: THREE.Line[],
    color: number,
    distance: number
  ): void {
    const materialMajor = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2
    });
    const materialMinor = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.1
    });

    for (let i = 0; i < 12; i++) {
      const material = i % 6 === 0 ? materialMajor : materialMinor;
      this._buildLine(objects, material, (15 * i * Math.PI) / 180, distance);
    }
  }

  private _buildLine(
    objects: THREE.Line[],
    material: THREE.LineBasicMaterial,
    angle: number,
    distance: number
  ): void {
    const geometryX = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3); // 3 vertices per point
    positions[0] = -distance * Math.cos(angle);
    positions[1] = -distance * Math.sin(angle);
    positions[2] = 0;
    positions[3] = distance * Math.cos(angle);
    positions[4] = distance * Math.sin(angle);
    positions[5] = 0;
    geometryX.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    objects.push(new THREE.Line(geometryX, material));
  }

  private _buildEllipsesOnXY(
    objects: THREE.Line[],
    color: number,
    distance: number
  ): void {
    for (let i = 1; i < ReferentielService.COUNT; i++) {
      const radius =
        (distance * i * ReferentielService.FACTOR) / ReferentielService.COUNT;
      const curve = new THREE.EllipseCurve(
        0,
        0, // ax, aY
        radius,
        radius, // xRadius, yRadius
        0,
        2 * Math.PI, // aStartAngle, aEndAngle
        false, // aClockwise
        0 // aRotation
      );

      // const path = new THREE.Path(curve.getPoints(50));
      const geometry = new THREE.BufferGeometry().setFromPoints(
        curve.getPoints(50)
      );
      const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3 / i
      });

      // Create the final object to add to the scene
      objects.push(new THREE.Line(geometry, material));
    }
  }
}
