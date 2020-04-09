import { isNil } from 'lodash';

import { Component, Input, OnInit } from '@angular/core';

import { Catalog, Property } from '../catalog/catalog.model';
import { InTheSkyService } from '../external/in-the-sky.service';
import { ThreeComponentModel } from '../three.component.model';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent implements OnInit {
  //
  @Input() model: ThreeComponentModel;
  public selectedCatalog: Catalog;
  public expanded = true;

  constructor(private _inTheSkyService: InTheSkyService) {}
  //
  ngOnInit() {}

  public isVisible(): boolean {
    return (
      this.model.average === '' &&
      this.model.lastStarIntersected &&
      this.model.lastStarIntersected.userData.starProp &&
      !isNil(this.model.lastStarIntersected.userData.starProp.pmra)
    );
  }

  public getValue(data: any, prop: Property): string {
    if (prop.key === 'ra') {
      return this._computeRa(data[prop.key]);
    } else if (prop.key === 'dec') {
      return this._computeDec(data[prop.key]);
    }
    if (data[prop.key]) {
      return data[prop.key] + (prop.unit ? ' ' + prop.unit : '');
    } else {
      return '-';
    }
  }

  public getLink(data: any, key: string): string {
    if (key === 'hip') {
      const mapp = this._inTheSkyService.mapping.find(
        (m) => m.hip === data[key]
      );
      if (mapp) {
        return InTheSkyService.url + mapp.tyc;
      }
    }
    return null;
  }

  private _computeRa(ra: string): string {
    const raNumber = Number(ra);
    const hours = Math.floor(raNumber);
    const minutes = raNumber - hours;
    const min = Math.floor(minutes * 60);
    const secondes = (minutes - min / 60) * 60;
    return (
      hours +
      'h ' +
      min +
      'm ' +
      (Math.floor(secondes * 6000) / 100).toFixed(3) +
      's'
    );
  }

  private _computeDec(dec: string): string {
    const raNumber = Number(dec);
    const hours = Math.floor(raNumber);
    const minutes = raNumber - hours;
    const min = Math.floor(minutes * 60);
    const secondes = (minutes - min / 60) * 60;
    return (
      hours +
      '° ' +
      min +
      "' " +
      (Math.floor(secondes * 6000) / 100).toFixed(3) +
      '"'
    );
  }
}
