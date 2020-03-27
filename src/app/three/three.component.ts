import { Component, HostListener, OnInit, ElementRef } from '@angular/core';

import * as THREE from 'three';

import { PerspectiveCameraService } from '@app/services/three/camera/perspective-camera.service';
import { TrackballControlsService } from '@app/services/three/controls/trackball-controls.service';
import { RaycasterService } from '@app/services/three/raycaster/raycaster.service';
import { SceneService } from '@app/services/three/scene/scene.service';
import { ThreeComponentService } from './three.component.service';
import { ReferentielService } from '@app/services/objects/referentiel/referentiel.service';

import { ThreeComponentModel } from './three.component.model';
import { StarsService } from '@app/services/objects/stars/stars.service';
import { TargetService } from '@app/services/objects/target/target.service';
import { CatalogService } from '@app/services/objects/stars/catalog.service';
import { OnStarOverService } from '@app/services/objects/stars/on-star-over.service';

@Component({
    selector: 'app-three',
    templateUrl: './three.component.html',
    styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit {

    threeComponentModel: ThreeComponentModel;

    initDist: number;
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
            this.threeComponentModel.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.threeComponentModel.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
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

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        event.preventDefault();
        this.threeComponentService.gotoTarget(this.threeComponentModel);
    }
    constructor(
        public catalogService: CatalogService,
        private element: ElementRef,
        private threeComponentService: ThreeComponentService,
        private trackballControlsService: TrackballControlsService,
        private perspectiveCameraService: PerspectiveCameraService,
        private raycasterService: RaycasterService,
        private sceneService: SceneService,
        private referentielService: ReferentielService,
        private targetService: TargetService,
        private starsService: StarsService,
        private onStarOverService: OnStarOverService) {
        //
        this.threeComponentModel = {
            perspectiveCameraService: this.perspectiveCameraService,
            renderer: this.renderer,
            trackballControlsService: this.trackballControlsService,
            raycasterService: this.raycasterService,
            sceneService: this.sceneService,
            referentielService: this.referentielService,
            targetService: this.targetService,
            starsService: this.starsService,
            onStarOverService: this.onStarOverService,
            element: this.element,
            mouse: new THREE.Vector2(),
            myStarOver: {star: null, userData: null}
        };
        this.resetWidthHeight();
        
    }

    ngOnInit() {
        this.threeComponentService.initialize( this.threeComponentModel );
        // local loading
        this.catalogService.initialize(true).then(
            () => {
                this.afterInitCatalog();
            },
            () => {
                this.catalogService.initialize(false).then(
                    () => {
                        this.afterInitCatalog();
                    }
                )
            }

        );
    }

    ngOnChanges(changes: any) {
        this.threeComponentService.onChanges( this.threeComponentModel, changes );
    }

    ngAfterContentInit() {
        this.threeComponentService.afterContentInit( this.threeComponentModel );
    }

    afterInitCatalog(): void {
        this.threeComponentModel.starsService.initialize();
        this.threeComponentModel.starsService.updateSpheresInScene(
            this.threeComponentModel.perspectiveCameraService.camera,
            this.threeComponentModel.trackballControlsService.controls.target
        );
    }

}
