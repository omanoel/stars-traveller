import { Observable, of } from 'rxjs';

import { Injectable } from '@angular/core';

import { StarsService } from '../../stars/stars.service';
import { ThreeComponentModel } from '../../three.component.model';
import { BaseCatalogService } from '../base-catalog.service';
import { BaseCatalogData } from '../catalog.model';

@Injectable({
  providedIn: 'root'
})
export class HygCsvCatalogService extends BaseCatalogService {
  constructor(protected _starsService: StarsService) {
    // Empty
    super(_starsService);
  }

  // @override
  public load(threeComponentModel: ThreeComponentModel): void {
    threeComponentModel.errorMessage = null;
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
  public count$(): Observable<number> {
    return of(119614);
  }

  // @override
  public findOne(
    threeComponentModel: ThreeComponentModel,
    properties: BaseCatalogData
  ): Observable<BaseCatalogData> {
    return of(
      threeComponentModel.starsImported.find((s) => s.id === properties.id)
    );
  }

  // @override
  public transform(data: string): BaseCatalogData[] {
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

  // @override
  public search(threeComponentModel: ThreeComponentModel): Observable<void> {
    threeComponentModel.errorMessage = null;
    threeComponentModel.average = 'Searching stars...';
    this.initialize(threeComponentModel).then(() => {
      // fill objects
      threeComponentModel.starsImported.forEach((item) => {
        item.plx = 1 / item.dist;
      });
      threeComponentModel.filters.forEach((f, k) => {
        threeComponentModel.starsImported = threeComponentModel.starsImported.filter(
          (star) => {
            let keep = true;
            if (f[0] != null) {
              keep = star[k] < f[0];
            }
            if (f[1] != null) {
              keep = star[k] > f[1];
            }
            return keep;
          }
        );
      });
      // refresh
      this._starsService.refreshAfterLoadingCatalog(threeComponentModel);
    });
    return of(null);
  }
}
