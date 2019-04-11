import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class ReferentielService {

    objects: Array<THREE.Line> = [];
    distReference: number;
    count = 20;
    factor = 4;

    constructor() { }

    initialize(camera: THREE.PerspectiveCamera) {

        this.distReference = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        const color = 0xffffff;
        this.buildObjects(color);

    }

    getObjects() {
        return this.objects;
    }

    buildObjects(color) {
        this.objects = [];
        this._buildLinesXY(0xffffff);
        this._buildEllipsesOnXY(0xffffff);
    }

    update(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        if (dist > this.distReference * (this.factor - 1)) {
            this.distReference = dist;
            for (const ellipse of this.objects) {
                scene.remove(ellipse);
            }
            const color = 0xffffff;
            this.buildObjects(color);
            for (const ellipse of this.objects) {
                scene.add(ellipse);
            }
        } else if (dist < this.distReference) {
            this.distReference = dist / (this.factor - 1);
            for (const ellipse of this.objects) {
                scene.remove(ellipse);
            }
            const color = 0xffffff;
            this.buildObjects(color);
            for (const ellipse of this.objects) {
                scene.add(ellipse);
            }
        }
    }

    _buildLinesXY(color) {
        const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.1 });

        for (let i = 0; i < 12; i++) {
            this._buildLine(material, 15 * i * Math.PI / 180);
        }
    }

    _buildLine(material, angle) {
        const geometryX = new THREE.Geometry();
        geometryX.vertices.push(
            new THREE.Vector3( -this.distReference * Math.cos(angle), -this.distReference * Math.sin(angle), 0 ),
            new THREE.Vector3( this.distReference * Math.cos(angle), this.distReference * Math.sin(angle), 0 )
        );
        const lineX = new THREE.Line( geometryX, material );
        this.objects.push(lineX);
    }
    /**
     *
     * @param color
     */
    _buildEllipsesOnXY(color) {
        for (let i = 1; i < this.count; i++) {
            const radius = this.distReference * i * this.factor / this.count;
            const curve = new THREE.EllipseCurve(
                0, 0,            // ax, aY
                radius, radius,  // xRadius, yRadius
                0, 2 * Math.PI,  // aStartAngle, aEndAngle
                false,            // aClockwise
                0                 // aRotation
            );

            // const path = new THREE.Path(curve.getPoints(50));
            const geometry = new THREE.Geometry().setFromPoints(curve.getPoints(50));
            const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 / i });

            // Create the final object to add to the scene
            const ellipse = new THREE.Line(geometry, material);

            this.objects.push(ellipse);
        }
    }

}
