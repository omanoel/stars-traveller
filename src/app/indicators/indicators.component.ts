import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { MainModel } from '@app/app.model';
import { PerspectiveCameraService } from '@app/three/shared/perspective-camera/perspective-camera.service';
import { TrackballControlsService } from '@app/three/shared/trackball-controls/trackball-controls.service';
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from '@ui-components/loader';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss'],
  providers: [LoaderService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndicatorsComponent implements OnInit {
  //
  @Input() model: MainModel;
  public target: THREE.Vector3;
  //
  constructor(
    public translate: TranslateService,
    private _trackballControlsService: TrackballControlsService,
    private _perspectiveCameraService: PerspectiveCameraService
  ) {}

  public ngOnInit(): void {
    this.target = this._trackballControlsService.model.controls.target;
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
}
