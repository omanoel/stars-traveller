import { Observable, of } from 'rxjs';

import { Injectable } from '@angular/core';

import { StarsService } from '../../stars/stars.service';
import { ThreeComponentModel } from '../../three.component.model';
import { BaseCatalogService } from '../base-catalog.service';

@Injectable({
  providedIn: 'root',
})
export class HygCsvCatalogService extends BaseCatalogService {
  constructor(protected _starsService: StarsService) {
    // Empty
    super(_starsService);
  }

  // @override
  public load(threeComponentModel: ThreeComponentModel): void {
    this.initialize(threeComponentModel).then(() => {
      // fill objects
      threeComponentModel.starsImported.forEach((item) => {
        item.plx = 1 / item.dist;
      });
      // refresh
      this._starsService.refreshAfterLoadingCatalog(threeComponentModel);
    });
  }

  // @override
  public find(
    threeComponentModel: ThreeComponentModel,
    id: string
  ): Observable<any> {
    return of(threeComponentModel.starsImported.find((s) => s.id === id));
  }

  // @override
  public transform(data: any): any {
    const lines = data.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(',');
      if (currentline.length > 1) {
        for (let j = 0; j < headers.length; j++) {
          const value = currentline[j];
          let valueTransform;
          valueTransform = parseFloat(value);
          if (isNaN(valueTransform)) {
            valueTransform = value;
          }
          obj[headers[j]] = valueTransform;
        }
        result.push(obj);
      }
    }
    return result;
  }
}
