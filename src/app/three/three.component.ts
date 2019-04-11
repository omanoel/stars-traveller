import { Component, HostListener, OnInit, ElementRef } from '@angular/core';

import * as THREE from 'three';

import { PerspectiveCameraService } from '@app/services/three/camera/perspective-camera.service';
import { TrackballControlsService } from '@app/services/three/controls/trackball-controls.service';
import { RaycasterService } from '@app/services/three/raycaster/raycaster.service';
import { SceneService } from '@app/services/three/scene/scene.service';
import { ThreeComponentService } from './three.component.service';
import { ReferentielService } from '@app/services/objects/referentiel/referentiel.service';

import { StarOver } from '@app/utils/interfaces';
import { ThreeComponentModel } from './three.component.model';

@Component({
    selector: 'app-three',
    templateUrl: './three.component.html'
})
export class ThreeComponent implements OnInit {

    threeComponentModel: ThreeComponentModel;
    myStarOver: StarOver;
    initDist: number;
    mouse = new THREE.Vector2();
    mouseDown = false;

    clock: THREE.Clock = new THREE.Clock();

    currentIntersected: any;

    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
        antialias: true
    });

    @HostListener('window:resize')
    resetWidthHeight() {
        this.threeComponentService.resetWidthHeight(
            this.threeComponentModel,
            window.innerWidth,
            window.innerHeight
        );
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

    constructor(
        private element: ElementRef,
        private threeComponentService: ThreeComponentService,
        private trackballControlsService: TrackballControlsService,
        private perspectiveCameraService: PerspectiveCameraService,
        private raycasterService: RaycasterService,
        private sceneService: SceneService,
        private referentielService: ReferentielService) {
        //
        this.threeComponentModel = {
            perspectiveCameraService: this.perspectiveCameraService,
            renderer: this.renderer,
            trackballControlsService: this.trackballControlsService,
            raycasterService: this.raycasterService,
            sceneService: this.sceneService,
            referentielService: this.referentielService,
            element: this.element
        };
        this.resetWidthHeight();
        
    }

    ngOnInit() {
        this.threeComponentService.initialize( this.threeComponentModel );
        this.myStarOver = {star: null};
    }

    ngOnChanges(changes: any) {
        this.threeComponentService.onChanges( this.threeComponentModel, changes );
    }

    ngAfterContentInit() {
        this.threeComponentService.afterContentInit( this.threeComponentModel );
    }

}
