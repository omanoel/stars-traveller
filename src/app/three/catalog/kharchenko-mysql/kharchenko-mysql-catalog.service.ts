import { isNil } from 'lodash';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjectsService } from '@app/three/objects/objects.sevice';

import { ThreeComponentModel } from '../../three.component.model';
import { Catalog, ICatalogService } from '../catalog.model';

@Injectable({
  providedIn: 'root',
})
export class KharchenkoMysqlCatalogService implements ICatalogService {
  //
  constructor(
    private _objectsService: ObjectsService,
    private _http: HttpClient
  ) {
    // Empty
  }

  // @override
  public count$(catalog: Catalog): Observable<number> {
    return this._http.get(catalog.url + '/count').pipe(
      map((result) => {
        return result[0].total;
      })
    );
  }

  // @override
  public findOne$(
    threeComponentModel: ThreeComponentModel,
    properties: any
  ): Observable<any> {
    return this.get$(
      properties.id,
      threeComponentModel.selectedCatalog.url
    ).pipe(
      map((objectImported: any) => {
        this._fillPositionProperties(threeComponentModel, objectImported);
        return objectImported;
      }),
      catchError(() => of('Error, could not count'))
    );
  }

  initialize$: Function;

  // @override
  public load(threeComponentModel: ThreeComponentModel): void {
    threeComponentModel.filters.clear();
    threeComponentModel.errorMessage = null;
    threeComponentModel.filters.set('bmag', [-1429, 7000]);
    this.search$(threeComponentModel).subscribe();
  }

  // @override
  public search$(threeComponentModel: ThreeComponentModel): Observable<void> {
    threeComponentModel.indexOfCurrent = 0;
    threeComponentModel.scale = threeComponentModel.selectedCatalog.scale;
    threeComponentModel.errorMessage = null;
    threeComponentModel.average = 'Searching objects...';
    let filtering = '?';
    threeComponentModel.filters.forEach((f, k) => {
      let value = k + '=';
      if (!isNil(f[0])) {
        value += f[0];
      }
      value += ':';
      if (!isNil(f[1])) {
        value += f[1];
      }
      filtering += value + '&';
    });
    return this._http
      .get(threeComponentModel.selectedCatalog.url + '/count' + filtering)
      .pipe(
        concatMap((countOfObjects: any) => {
          console.log(countOfObjects);
          const count = +countOfObjects[0].total;
          if (count < 50000) {
            return this._http.get(
              threeComponentModel.selectedCatalog.url + filtering
            );
          } else {
            return of(null);
          }
        }),
        map((objectsImported: any) => {
          if (objectsImported) {
            threeComponentModel.errorMessage = null;
            threeComponentModel.objectsImported = objectsImported;
            // fill objects
            threeComponentModel.objectsImported.forEach((item) => {
              this._fillPositionProperties(threeComponentModel, item);
            });
            // refresh
            this._objectsService.refreshAfterLoadingCatalog(
              threeComponentModel
            );
          } else {
            threeComponentModel.errorMessage = 'COMMON.ERROR_TOO_MANY_OBJECTS';
          }
        }),
        catchError((err: any) => {
          threeComponentModel.errorMessage = 'COMMON.CATALOG_NOT_READY';
          return of(null);
        })
      );
  }

  public getAll$(baseUrl: string): Observable<any> {
    return this._http.get(baseUrl + '/');
  }

  public get$(id: string, baseUrl: string): Observable<any> {
    return this._http.get(`${baseUrl}/${id}`);
  }

  private _fillPositionProperties(
    threeComponentModel: ThreeComponentModel,
    item: any
  ): void {
    threeComponentModel.selectedCatalog.properties.forEach((prop) => {
      if (prop.type === 'number' && item[prop.key]) {
        item[prop.key] = +item[prop.key];
      }
    });
    if (item.plx === 0) {
      item.plx = 0.01;
    }
    item.dist = 100000 / Math.abs(item.plx);
    item.x =
      (item.dist *
        Math.cos((item.dec * Math.PI) / 180) *
        Math.cos((item.ra * Math.PI) / 12)) /
      threeComponentModel.scale;
    item.y =
      (item.dist *
        Math.cos((item.dec * Math.PI) / 180) *
        Math.sin((item.ra * Math.PI) / 12)) /
      threeComponentModel.scale;
    item.z =
      (item.dist * Math.sin((item.dec * Math.PI) / 180)) /
      threeComponentModel.scale;
  }
}
