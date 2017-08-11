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
        let color = 0xffffff;
        this.buildObjects(color);

    }

    getObjects() {
        return this.objects;
    }

    buildObjects(color) {
        this.objects = [];
        for (let i = 1; i < this.count; i++) {
            const radius = this.distReference * i * this.factor / this.count;
            var curve = new THREE.EllipseCurve(
                0, 0,            // ax, aY
                radius, radius,  // xRadius, yRadius
                0, 2 * Math.PI,  // aStartAngle, aEndAngle
                false,            // aClockwise
                0                 // aRotation
            );

            var path = new THREE.Path(curve.getPoints(50));
            var geometry = path.createPointsGeometry(50);
            var material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.1 });

            // Create the final object to add to the scene
            var ellipse = new THREE.Line(geometry, material);

            this.objects.push(ellipse);

        }
    }

    update(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        let dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        if (dist > this.distReference * (this.factor - 1)) {
            this.distReference = dist;
            for (let ellipse of this.objects) {
                scene.remove(ellipse);
            }
            let color = 0xffffff;
            this.buildObjects(color);
            for (let ellipse of this.objects) {
                scene.add(ellipse);
            }
        } else if (dist < this.distReference) {
            this.distReference = dist / (this.factor - 1);
            for (let ellipse of this.objects) {
                scene.remove(ellipse);
            }
            let color = 0xffffff;
            this.buildObjects(color);
            for (let ellipse of this.objects) {
                scene.add(ellipse);
            }
        }
    }

}
