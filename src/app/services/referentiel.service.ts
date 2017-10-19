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
        this._buildEllipsesOnXZ(0xffff00);
        this._buildEllipsesOnYZ(0x00ffff);
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

        const geometryX = new THREE.Geometry();
        geometryX.vertices.push(
            new THREE.Vector3( -this.distReference, 0, 0 ),
            new THREE.Vector3( this.distReference, 0, 0 )
        );
        const lineX = new THREE.Line( geometryX, material );
        this.objects.push(lineX);
        const geometryY = new THREE.Geometry();
        geometryY.vertices.push(
            new THREE.Vector3( 0, -this.distReference, 0 ),
            new THREE.Vector3( 0, this.distReference,  0 )
        );
        const lineY = new THREE.Line( geometryY, material );
        this.objects.push(lineY);
        const geometryA = new THREE.Geometry();
        geometryA.vertices.push(
            new THREE.Vector3( -this.distReference, -this.distReference, 0 ),
            new THREE.Vector3( this.distReference, this.distReference,  0 )
        );
        const lineA = new THREE.Line( geometryA, material );
        this.objects.push(lineA);
        const geometryB = new THREE.Geometry();
        geometryB.vertices.push(
            new THREE.Vector3( -this.distReference, this.distReference, 0 ),
            new THREE.Vector3( this.distReference, -this.distReference,  0 )
        );
        const lineB = new THREE.Line( geometryB, material );
        this.objects.push(lineB);
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

            const path = new THREE.Path(curve.getPoints(50));
            const geometry = path.createPointsGeometry(50);
            const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 / i });

            // Create the final object to add to the scene
            const ellipse = new THREE.Line(geometry, material);

            this.objects.push(ellipse);
        }
    }
    /**
     *
     * @param color
     */
    _buildEllipsesOnXZ(color) {
        for (let i = 1; i < this.count; i++) {
            const radius = this.distReference * i * this.factor / this.count;
            const curve = new THREE.EllipseCurve(
                0, 0,            // ax, aY
                radius, radius,  // xRadius, yRadius
                0, 2 * Math.PI,  // aStartAngle, aEndAngle
                false,            // aClockwise
                0                 // aRotation
            );

            const path = new THREE.Path(curve.getPoints(50));
            const geometry = path.createPointsGeometry(50);
            const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 / i });

            // Create the final object to add to the scene
            const ellipse = new THREE.Line(geometry, material);
            ellipse.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
            this.objects.push(ellipse);
        }
    }

    /**
     *
     * @param color
     */
    _buildEllipsesOnYZ(color) {
        for (let i = 1; i < this.count; i++) {
            const radius = this.distReference * i * this.factor / this.count;
            const curve = new THREE.EllipseCurve(
                0, 0,            // ax, aY
                radius, radius,  // xRadius, yRadius
                0, 2 * Math.PI,  // aStartAngle, aEndAngle
                false,            // aClockwise
                0                 // aRotation
            );

            const path = new THREE.Path(curve.getPoints(50));
            const geometry = path.createPointsGeometry(50);
            const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 / i });

            // Create the final object to add to the scene
            const ellipse = new THREE.Line(geometry, material);
            ellipse.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            this.objects.push(ellipse);
        }
    }

}
