import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input
} from '@angular/core';
import { TargetService } from '../shared/target/target.service';

import { ThreeComponentModel } from '../three-component.model';
import { ThreeComponentService } from '../three-component.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent {
  private _mouseDown = false;
  @Input() model: ThreeComponentModel;

  constructor(
    private _threeComponentService: ThreeComponentService,
    private _targetService: TargetService
  ) {}

  @HostListener('window:resize')
  resetWidthHeight(): void {
    this._threeComponentService.resetWidthHeight(
      this.model,
      window.innerWidth,
      window.innerHeight
    );
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent): void {
    event.preventDefault();
    if (!this._mouseDown) {
      this.model.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.model.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event: MouseEvent): void {
    event.preventDefault();
    this._mouseDown = true;
  }

  @HostListener('mouseup', ['$event'])
  onMouseup(event: MouseEvent): void {
    event.preventDefault();
    this._targetService.model.targetOnClick = undefined;
    this._mouseDown = false;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    this._threeComponentService.gotoTarget(this.model);
  }
}
