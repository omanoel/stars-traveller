import {
    Directive, ElementRef, HostListener,
    Input,
    ContentChild,
    OnChanges, AfterContentInit
} from '@angular/core';
import * as THREE from 'three';

import { SceneDirective } from './scene.directive';
import { TrackballControlsDirective } from './controls/trackball.directive';
import { RaycasterService } from '../services/raycaster.service';
import { StarOver } from '@app/utils/interfaces';

@Directive({ selector: '[appRenderer]' })
export class RendererDirective implements OnChanges, AfterContentInit {

    @Input() height: number;
    @Input() width: number;
    @Input() starOver: StarOver;

    @ContentChild(SceneDirective) sceneDir: SceneDirective;
    @ContentChild(TrackballControlsDirective) trackballDir: TrackballControlsDirective;

    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
        antialias: true
    });

    mouse = new THREE.Vector2();
    mouseDown = false;

    raycasterService: RaycasterService = new RaycasterService();

    clock: THREE.Clock = new THREE.Clock();

    currentIntersected: any;

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

    @HostListener('mousemove', ['$event'])
    onMousemove(event: MouseEvent) {
        event.preventDefault();
        if (!this.mouseDown) {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        }
    }

    @HostListener('mousedown', ['$event'])
    onMousedown(event: MouseEvent) {
        event.preventDefault();
        this.mouseDown = true;
    }

    @HostListener('mouseup', ['$event'])
    onMouseup(event: MouseEvent) {
        event.preventDefault();
        this.mouseDown = false;
    }

    constructor(private element: ElementRef) {

    }

    ngOnChanges(changes) {

        const widthChange = changes.width && changes.width.currentValue;
        const heightChange = changes.height && changes.height.currentValue;
        if (widthChange || heightChange) {
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
        requestAnimationFrame(() => this.animate());
        this.render();
    }

    render() {
        if (this.trackballDir) {
            this.trackballDir.updateControls();
        }
        this.referentielService.update(this.scene, this.camera);
        this.findIntersection();
        this.renderer.render(this.scene, this.camera);
    }

    findIntersection() {

        this.raycasterService.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycasterService.raycaster.intersectObjects(this.sceneDir.parentTransform.children, false);
        if (intersects.length > 0) {
            if (this.currentIntersected !== undefined) {
                this.currentIntersected.material.linewidth = 1;
                return;
            }
            this.currentIntersected = intersects[0].object;
            this.starOver.star = this.currentIntersected;
            // this.currentIntersected.material.color.b = 1;
            this.sceneDir.addPosition(this.currentIntersected.position);
            // sphereInter.visible = true;
            // sphereInter.position.copy( intersects[ 0 ].point );
        } else {
            if (this.currentIntersected !== undefined) {
                // this.currentIntersected.material.color.b = 0;
                this.sceneDir.delPosition();
                this.starOver.star = null;
            }

            this.currentIntersected = undefined;
            // sphereInter.visible = false;
        }
    }

}
