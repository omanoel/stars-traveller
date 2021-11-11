import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MainModel } from '@app/app.model';
import { PerspectiveCameraService } from '@app/three/shared/perspective-camera/perspective-camera.service';
import { TargetService } from '@app/three/shared/target/target.service';
import { TrackballControlsService } from '@app/three/shared/trackball-controls/trackball-controls.service';
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from '@ui-components/loader';
import { Vector3 } from 'three';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss'],
  providers: [LoaderService]
})
export class IndicatorsComponent implements OnInit, OnDestroy {
  //
  @Input() model: MainModel;
  public target: Vector3;
  public indicatorsForm: FormGroup;
  //
  constructor(
    public translate: TranslateService,
    private _trackballControlsService: TrackballControlsService,
    private _perspectiveCameraService: PerspectiveCameraService,
    private _targetService: TargetService
  ) {}

  public ngOnInit(): void {
    this.target = this._trackballControlsService.model.controls.target;
    this.indicatorsForm = new FormGroup({
      properMotionFc: new FormControl(this.model.showProperMotion),
      nearDetectionFc: new FormControl(0)
    });
    // subscriptions
    this.indicatorsForm
      .get('properMotionFc')
      .valueChanges.subscribe((value: boolean) => {
        this.model.showProperMotion = value;
        this.model.changeOnShowProperMotion = true;
      });
    this.indicatorsForm
      .get('nearDetectionFc')
      .valueChanges.subscribe((value: boolean) => {
        this.model.closeToTarget$.next(value);
      });
  }

  public ngOnDestroy(): void {
    //
  }

  public roundValue(val: number): number {
    if (val < 100) {
      return Math.round(val * 100) / 100;
    } else {
      return Math.round(val);
    }
  }

  public distanceToTarget(): number {
    const dist = this._perspectiveCameraService.camera.position.distanceTo(
      this._trackballControlsService.model.controls.target
    );
    return this.roundValue(dist);
  }

  public distanceToLastObject(): number {
    if (this.model.currentIntersected) {
      const dist = this._perspectiveCameraService.camera.position.distanceTo(
        this.model.currentIntersected.parent.position
      );
      return this.roundValue(dist);
    } else {
      return this.distanceToTarget();
    }
  }

  public goToPreviousObject(): void {
    if (this.model.indexOfCurrent === 0) {
      this.model.indexOfCurrent = this.model.objectsImported.length - 1;
    } else {
      this.model.indexOfCurrent -= 1;
    }
    const objImported = this.model.objectsImported[this.model.indexOfCurrent];
    const position = new Vector3(objImported.x, objImported.y, objImported.z);
    this._targetService.goToThisPosition(position);
  }

  public goToNextObject(): void {
    if (this.model.indexOfCurrent === this.model.objectsImported.length - 1) {
      this.model.indexOfCurrent = 0;
    } else {
      this.model.indexOfCurrent += 1;
    }
    const objImported = this.model.objectsImported[this.model.indexOfCurrent];
    const position = new Vector3(objImported.x, objImported.y, objImported.z);
    this._targetService.goToThisPosition(position);
  }

  public goToClosestObject(): void {
    const targetPosition = this._targetService.model.axesHelper.position;
    let minimalDistance = Infinity;
    let newPosition: Vector3;
    this.model.objectsImported.forEach((objectImported, indexOfCurrent) => {
      const tempPosition = new Vector3(
        objectImported.x,
        objectImported.y,
        objectImported.z
      );
      if (
        minimalDistance > tempPosition.distanceTo(targetPosition) &&
        tempPosition.distanceTo(targetPosition) > 1e-8 &&
        this.model.indexOfCurrent !== indexOfCurrent
      ) {
        minimalDistance = tempPosition.distanceTo(targetPosition);
        newPosition = tempPosition;
        this.model.indexOfCurrent = indexOfCurrent;
      }
    });
    this._targetService.goToThisPosition(newPosition);
  }
}
