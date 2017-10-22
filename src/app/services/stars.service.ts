import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class StarsService {

    stars: Array<THREE.Mesh> = [];

    constructor() { }

    initialize() {

        const material = new THREE.MeshNormalMaterial();
        const r = 6371;

        for (let i = 1; i < 15; i++) {
            const wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ee00, wireframe: true, transparent: true } );
            const geometry = new THREE.SphereGeometry(50, 32, 16);
            const star = new THREE.Mesh(geometry, wireframeMaterial);
            star.translateX(100 * i * Math.random() * 10 * Math.cos(i * Math.PI / 15));
            star.translateY(100 * i * Math.random() * 10 * Math.cos(i * Math.PI / 15) );
            star.translateZ(100 * i * Math.random() * 10  * Math.cos(i * Math.PI / 15) );

            this.stars.push(star);
        }

    }
}
