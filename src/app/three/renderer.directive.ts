import { Directive, ElementRef, Input, ContentChild, ViewChild, OnChanges, AfterContentInit } from '@angular/core';
import * as THREE from 'three';

import { SceneDirective } from './scene.directive';
import { TrackballControlsDirective } from './controls/trackball.directive';

@Directive({ selector: '[appThreeRenderer]' })
export class RendererDirective implements OnChanges, AfterContentInit {

    @Input() height: number;
    @Input() width: number;

    @ContentChild(SceneDirective) sceneDir: SceneDirective;
    @ContentChild(TrackballControlsDirective) trackballDir: TrackballControlsDirective;

    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
        antialias: true
    });

    clock: THREE.Clock = new THREE.Clock();

    initDist: number;

    get scene() {
        return this.sceneDir.scene;
    }

    get camera(): THREE.PerspectiveCamera {
        return this.sceneDir.camera;
    }
    get referentielService() {
        return this.sceneDir.referentielService;
    }

    constructor(private element: ElementRef) {
    }

    ngOnChanges(changes) {

        const widthChng = changes.width && changes.width.currentValue;
        const heightChng = changes.height && changes.height.currentValue;
        if (widthChng || heightChng) {
            this.renderer.setSize(this.width, this.height);
        }
    }

    ngAfterContentInit() {
        this.renderer.setSize(this.width, this.height);
        this.element.nativeElement.appendChild(this.renderer.domElement);
        this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

        this.trackballDir.setupControls(this.camera, this.renderer);
        this.initDist = this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        this.animate();
    }

    animate() {
        if (this.trackballDir) {
            this.trackballDir.updateControls();
        }
        this.referentielService.update(this.scene, this.camera);
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

}
