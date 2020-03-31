import { isNil } from 'lodash';
import * as THREE from 'three';

import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { StarsService } from '../stars/stars.service';
import { TargetService } from '../target/target.service';
import { ThreeComponentModel } from '../three.component.model';

@Component({
  selector: 'app-form-position',
  templateUrl: './form-position.component.html',
  styleUrls: ['./form-position.component.scss']
})
export class FormPositionComponent implements OnInit {
  constructor(
    private _targetService: TargetService,
    private _starsService: StarsService
  ) {}

  @Input() threeComponentModel: ThreeComponentModel;

  positionForm: FormGroup;
  starForm: FormGroup;
  distanceToTarget: number;
  helpVisible = false;

  ngOnInit() {
    this._updateDistanceFromCameraToTarget(
      this.threeComponentModel.trackballControls.controls.target
    );
    this.positionForm = new FormGroup({
      x: new FormControl(
        this.threeComponentModel.trackballControls.controls.target.x,
        {
          updateOn: 'blur'
        }
      ),
      y: new FormControl(
        this.threeComponentModel.trackballControls.controls.target.y,
        {
          updateOn: 'blur'
        }
      ),
      z: new FormControl(
        this.threeComponentModel.trackballControls.controls.target.y,
        {
          updateOn: 'blur'
        }
      )
    });
    this.starForm = new FormGroup({
      id: new FormControl('', {
        updateOn: 'blur'
      })
    });
    this.threeComponentModel.trackballControls.target$.subscribe(
      (newValue: THREE.Vector3) => {
        this._updateForm(newValue);
      }
    );
    this.positionForm.get('x').valueChanges.subscribe(newVal => {
      this.threeComponentModel.trackballControls.controls.target.setX(+newVal);
      this._updateSpheres();
    });
    this.positionForm.get('y').valueChanges.subscribe(newVal => {
      this.threeComponentModel.trackballControls.controls.target.setY(+newVal);
      this._updateSpheres();
    });
    this.positionForm.get('z').valueChanges.subscribe(newVal => {
      this.threeComponentModel.trackballControls.controls.target.setZ(+newVal);
      this._updateSpheres();
    });
    this.starForm.get('id').valueChanges.subscribe(newVal => {
      const newPos = this._starsService.getPositionFromId(
        newVal,
        this.threeComponentModel.starsImported
      );
      if (!isNil(newPos)) {
        this._targetService.setObjectsOnClick(this.threeComponentModel, newPos);
      } else {
        alert('id not found !');
      }
    });
  }

  seeHelp(): void {
    this.helpVisible = !this.helpVisible;
  }

  private _updateForm(newTarget: THREE.Vector3) {
    if (this.positionForm) {
      this.positionForm.get('x').setValue(newTarget.x, { emitEvent: false });
      this.positionForm.get('y').setValue(newTarget.y, { emitEvent: false });
      this.positionForm.get('z').setValue(newTarget.z, { emitEvent: false });
    }
    this._updateDistanceFromCameraToTarget(newTarget);
  }

  private _updateSpheres(): void {
    this._starsService.updateProximityStars(this.threeComponentModel);
  }

  private _updateDistanceFromCameraToTarget(target: THREE.Vector3): void {
    const dist = this.threeComponentModel.camera.position.distanceTo(target);
    if (dist < 100) {
      this.distanceToTarget = Math.round(dist * 100) / 100;
    } else {
      this.distanceToTarget = Math.round(dist);
    }
  }
}
