import { Directive, Input, OnInit, OnChanges } from '@angular/core';
import * as THREE from 'three';

@Directive({ selector: 'three-sphere' })
export class SphereComponent implements OnInit, OnChanges{

    object: THREE.Mesh;

    ngOnInit() {
        // Create sphere
        let geometry = new THREE.SphereGeometry(50, 32, 16);
        let material = new THREE.MeshNormalMaterial();
        let wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ee00, wireframe: true, transparent: true } );
        let sphere = new THREE.Mesh(geometry, wireframeMaterial);

        this.object = sphere;
    }

    ngOnChanges() {

    }
}
