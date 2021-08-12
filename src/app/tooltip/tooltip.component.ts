import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MainModel } from '@app/app.model';

import { BaseCatalogData, Catalog, Property } from '../shared/catalog/catalog.model';
import { InTheSkyService } from '../shared/external/in-the-sky.service';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipComponent {
  //
  @Input() model: MainModel;
  public selectedCatalog: Catalog;

  constructor(private _inTheSkyService: InTheSkyService) {}

  /**
   *
   * @param data
   * @param prop
   * @returns
   */
  public getValue(data: BaseCatalogData, prop: Property): string {
    if (!data) {
      return '-';
    }
    if (prop.key === 'ra') {
      return this._computeRa(data[prop.key]);
    } else if (prop.key === 'dec') {
      return this._computeDec(data[prop.key]);
    }
    if (data[prop.key]) {
      if (prop.type === 'number') {
        let value = data[prop.key];
        if ((value > 1 && value < 1000) || (value < -1 && value > -1000)) {
          value = Math.round(value * 100) / 100;
        } else if (value >= 1000 || value <= -1000) {
          value = Math.round(value);
        }
        return value + (prop.unit ? ' ' + prop.unit : '');
      } else {
        return data[prop.key];
      }
    } else {
      return '-';
    }
  }

  /**
   *
   * @param data
   * @param key
   * @returns
   */
  public getLink(data: BaseCatalogData, key: string): string {
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

  /**
   *
   * @param ra
   * @returns
   */
  private _computeRa(ra: number | string): string {
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

  /**
   *
   * @param dec
   * @returns
   */
  private _computeDec(dec: number | string): string {
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
