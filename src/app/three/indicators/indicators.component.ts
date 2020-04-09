import { Component, Input, OnInit } from '@angular/core';

import { ThreeComponentModel } from '../three.component.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss'],
})
export class IndicatorsComponent implements OnInit {
  //
  @Input() model: ThreeComponentModel;
  public target: THREE.Vector3;
  public expanded: boolean = true;
  //
  constructor(public translate: TranslateService) {}

  ngOnInit() {
    this.target = this.model.trackballControls.controls.target;
  }

  public roundValue(val: number): number {
    if (val < 100) {
      return Math.round(val * 100) / 100;
    } else {
      return Math.round(val);
    }
  }

  public distanceToTarget(): number {
    const dist = this.model.camera.position.distanceTo(
      this.model.trackballControls.controls.target
    );
    return this.roundValue(dist);
  }

  public distanceToLastObject(): number {
    if (this.model.lastObjectIntersected) {
      const dist = this.model.camera.position.distanceTo(
        this.model.lastObjectIntersected.position
      );
      return this.roundValue(dist);
    } else {
      return this.distanceToTarget();
    }
  }
}
