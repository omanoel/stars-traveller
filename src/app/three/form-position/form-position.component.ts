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
    
    ngOnInit() {
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

    }

    updateForm(newTarget: THREE.Vector3) {
        if (this.positionForm) {
            this.positionForm.get('x').setValue(newTarget.x, {emitEvent: false});
            this.positionForm.get('y').setValue(newTarget.y, {emitEvent: false});
            this.positionForm.get('z').setValue(newTarget.z, {emitEvent: false});
        }
    }

    updateSpheres(): void {
        this.threeComponentModel.starsService.updateSpheresInScene(
            this.threeComponentModel.perspectiveCameraService.camera,
            this.threeComponentModel.trackballControlsService.controls.target);
    }

}
