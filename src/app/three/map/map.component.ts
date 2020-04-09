import { Component, HostListener, Input, OnInit } from '@angular/core';

import { ThreeComponentModel } from '../three.component.model';
import { ThreeComponentService } from '../three.component.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  private _mouseDown = false;
  @Input() model: ThreeComponentModel;

  constructor(private _threeComponentService: ThreeComponentService) {}

  @HostListener('window:resize')
  resetWidthHeight() {
    this._threeComponentService.resetWidthHeight(
      this.model,
      window.innerWidth,
      window.innerHeight
    );
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    event.preventDefault();
    if (!this._mouseDown) {
      this.model.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.model.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event: MouseEvent) {
    event.preventDefault();
    this._mouseDown = true;
  }

  @HostListener('mouseup', ['$event'])
  onMouseup(event: MouseEvent) {
    event.preventDefault();
    this.model.target.targetOnClick = null;
    this._mouseDown = false;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    event.preventDefault();
    this._threeComponentService.gotoTarget(this.model);
  }

  ngOnInit(): void {}
}
