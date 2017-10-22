import { Directive, Input } from '@angular/core';
import * as THREE from 'three';

@Directive({ selector: 'three-circle' })
export class CircleComponent {

    object: THREE.LineSegments;

    ngOnInit() {
        // Create circle
        let geometry = new THREE.CircleBufferGeometry(5, 64);
        /*let material = new THREE.MeshNormalMaterial();
        let circle = new THREE.Mesh(geometry, material);*/

        let wireframe = new THREE.WireframeGeometry(geometry);

        let circle = new THREE.LineSegments(wireframe);
        circle.material.depthTest = false;
        circle.material.opacity = 0.25;
        circle.material.transparent = true;

        this.object = circle;
    }

}
