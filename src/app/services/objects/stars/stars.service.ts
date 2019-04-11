import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class StarsService {

    catalog = [];

    stars: Array<THREE.Mesh> = [];
    starsPoints: THREE.Points;

    constructor() { }

    initialize() {

        const r = 6371;

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const nbStars = this.catalog.length;
        let maxX = 0;
        let maxY = 0;
        let maxZ = 0;
        for (let i = 0; i < nbStars; i++) {
            const record = this.catalog[i];
            vertices.push( record.fields.x, record.fields.y, record.fields.z );
            if (maxX < record.fields.x) { maxX = record.fields.x; }
            if (maxY < record.fields.y) { maxY = record.fields.y; }
            if (maxZ < record.fields.z) { maxZ = record.fields.z; }
        }
        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        const material = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false, alphaTest: 1, transparent: false } );
        material.color.setHSL( 0.33, 0.59, 0.80 );
        this.starsPoints = new THREE.Points( geometry, material );
        /*
        const wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ee00, wireframe: false, transparent: false } );
        for (let i = 0; i < this.catalog.length; i++) {
            const star = new THREE.Mesh(geometry, wireframeMaterial);
            const record = this.catalog[i];
            star.translateX(record.fields.x);
            star.translateY(record.fields.y);
            star.translateZ(record.fields.z);

            this.stars.push(star);
        }
        */

    }
}
