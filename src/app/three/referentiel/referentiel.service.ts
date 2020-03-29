import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ReferentielModel } from './referentiel.model';

@Injectable()
export class ReferentielService {
  private static readonly COUNT = 20;
  private static readonly FACTOR = 4;

  constructor() {}

  public initialize(camera: THREE.PerspectiveCamera): ReferentielModel {
    const color = 0xffffff;
    const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    return {
      distReference: distance,
      objects: this._buildObjects(color, distance)
    };
  }

  update(
    referentiel: ReferentielModel,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) {
    const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    if (dist > referentiel.distReference * (ReferentielService.FACTOR - 1)) {
      referentiel.distReference = dist;
      this._updateObjects(referentiel, scene, camera);
    } else if (dist < referentiel.distReference) {
      referentiel.distReference = dist / (ReferentielService.FACTOR - 1);
      this._updateObjects(referentiel, scene, camera);
    }
  }

  private _updateObjects(
    referentiel: ReferentielModel,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ): void {
    for (const ellipse of referentiel.objects) {
      scene.remove(ellipse);
    }
    const color = 0xffffff;
    referentiel.objects = this._buildObjects(color, referentiel.distReference);
    for (const ellipse of referentiel.objects) {
      scene.add(ellipse);
    }
  }

  private _buildObjects(color, distance: number): THREE.Line[] {
    const objects: THREE.Line[] = [];
    this._buildLinesXY(objects, color, distance);
    this._buildEllipsesOnXY(objects, color, distance);
    return objects;
  }

  private _buildLinesXY(objects: THREE.Line[], color, distance: number): void {
    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.1
    });

    for (let i = 0; i < 12; i++) {
      this._buildLine(objects, material, (15 * i * Math.PI) / 180, distance);
    }
  }

  private _buildLine(
    objects: THREE.Line[],
    material: THREE.LineBasicMaterial,
    angle,
    distance: number
  ): void {
    const geometryX = new THREE.Geometry();
    geometryX.vertices.push(
      new THREE.Vector3(
        -distance * Math.cos(angle),
        -distance * Math.sin(angle),
        0
      ),
      new THREE.Vector3(
        distance * Math.cos(angle),
        distance * Math.sin(angle),
        0
      )
    );
    objects.push(new THREE.Line(geometryX, material));
  }

  private _buildEllipsesOnXY(
    objects: THREE.Line[],
    color,
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
      const geometry = new THREE.Geometry().setFromPoints(curve.getPoints(50));
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
