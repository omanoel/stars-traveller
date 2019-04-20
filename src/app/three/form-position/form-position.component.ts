import { Component, Input, OnInit } from '@angular/core';
import { ThreeComponentModel } from '../three.component.model';
import { FormControl, FormGroup } from '@angular/forms';
import * as THREE from 'three';

@Component({
    selector: 'app-form-position',
    templateUrl: './form-position.component.html',
    styleUrls: ['./form-position.component.scss']
})
export class FormPositionComponent implements OnInit {

    @Input() threeComponentModel: ThreeComponentModel;
    
    positionForm: FormGroup;
    starForm: FormGroup;
    distanceToTarget: number;
    helpVisible = false;
    
    ngOnInit() {
        this.updateDistanceFromCameraToTarget(this.threeComponentModel.trackballControlsService.controls.target);
        this.positionForm = new FormGroup({
            x: new FormControl(this.threeComponentModel.trackballControlsService.controls.target.x, {
                updateOn: 'blur'
             }),
            y: new FormControl(this.threeComponentModel.trackballControlsService.controls.target.y, {
                updateOn: 'blur'
             }),
            z: new FormControl(this.threeComponentModel.trackballControlsService.controls.target.y, {
                updateOn: 'blur'
             })
        });
        this.starForm = new FormGroup({
            id: new FormControl('', {
                updateOn: 'blur'
            }),
        });
        this.threeComponentModel.trackballControlsService.target$.subscribe((newValue: THREE.Vector3) => {
            this.updateForm(newValue);
        });
        this.positionForm.get('x').valueChanges.subscribe((newVal) => {
            this.threeComponentModel.trackballControlsService.controls.target.setX(+newVal);
            this.updateSpheres();
        });
        this.positionForm.get('y').valueChanges.subscribe((newVal) => {
            this.threeComponentModel.trackballControlsService.controls.target.setY(+newVal);
            this.updateSpheres();
        });
        this.positionForm.get('z').valueChanges.subscribe((newVal) => {
            this.threeComponentModel.trackballControlsService.controls.target.setZ(+newVal);
            this.updateSpheres();
        });
        this.starForm.get('id').valueChanges.subscribe((newVal) => {
            const newPos = this.threeComponentModel.starsService.getPositionFromId(newVal);
            this.threeComponentModel.targetService.updateOnClick(newPos, this.threeComponentModel);
        });
    }

    updateForm(newTarget: THREE.Vector3) {
        if (this.positionForm) {
            this.positionForm.get('x').setValue(newTarget.x, {emitEvent: false});
            this.positionForm.get('y').setValue(newTarget.y, {emitEvent: false});
            this.positionForm.get('z').setValue(newTarget.z, {emitEvent: false});
        }
        this.updateDistanceFromCameraToTarget(newTarget);
    }

    updateSpheres(): void {
        this.threeComponentModel.starsService.updateSpheresInScene(
            this.threeComponentModel.perspectiveCameraService.camera,
            this.threeComponentModel.trackballControlsService.controls.target);
    }

    seeHelp(): void {
        this.helpVisible = !this.helpVisible;
    }

    updateDistanceFromCameraToTarget(target: THREE.Vector3): void {
        const dist = this.threeComponentModel.perspectiveCameraService.camera.position.distanceTo(
            target
        );
        if (dist < 100) {
            this.distanceToTarget = Math.round(dist * 100) / 100;
        } else {
            this.distanceToTarget = Math.round(dist);
        }
    }

}
