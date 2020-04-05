import { Component, Input, OnInit } from '@angular/core';

import { ThreeComponentModel } from '../three.component.model';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss'],
})
export class IndicatorsComponent implements OnInit {
  //
  constructor() {}

  @Input() model: ThreeComponentModel;
  target: THREE.Vector3;

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

  public distanceToLastStar(): number {
    const dist = this.model.camera.position.distanceTo(
      this.model.lastStarIntersected.position
    );
    return this.roundValue(dist);
  }
}
