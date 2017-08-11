import { Directive, ElementRef, Input, ContentChild, ViewChild, OnChanges, AfterContentInit } from '@angular/core';
import * as THREE from 'three';

import { SceneDirective } from './scene.directive';
import { FlyControlsDirective } from './controls/fly.directive';

@Directive({ selector: '[appThreeRenderer]' })
export class RendererDirective implements OnChanges, AfterContentInit {

    @Input() height: number;
    @Input() width: number;

    @ContentChild(SceneDirective) sceneDir: SceneDirective;
    @ContentChild(FlyControlsDirective) flyDir: FlyControlsDirective;

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

        if (this.flyDir) {
            this.flyDir.setupControls(this.camera, this.renderer);
        }

        this.initDist = this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));

        this.render();
    }

    render() {

        if (this.flyDir) {
            this.flyDir.updateControls(this.scene, this.camera, this.clock.getDelta());
        }
        this.referentielService.update(this.scene, this.camera);
        //this.camera.lookAt(this.scene.position);
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(() => this.render());
    }

}
