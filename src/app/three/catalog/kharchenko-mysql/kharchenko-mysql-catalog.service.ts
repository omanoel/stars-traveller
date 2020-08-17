import { Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjectsService } from '@app/three/objects/objects.sevice';

import { ThreeComponentModel } from '../../three.component.model';
import {
  Catalog,
  ICatalogService,
  BaseCatalogData,
  CountOfStars
} from '../catalog.model';

@Injectable({
  providedIn: 'root'
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
    prop: BaseCatalogData
  ): Observable<BaseCatalogData> {
    return <Observable<BaseCatalogData>>this.get$(
      <string>prop.id,
      threeComponentModel.selectedCatalog.url
    ).pipe(
      map((objectImported: BaseCatalogData) => {
        this._fillPositionProperties(threeComponentModel, objectImported);
        return objectImported;
      }),
      catchError(() => of('Error, could not count'))
    );
  }

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
      if (f[0] != null) {
        value += f[0];
      }
      value += ':';
      if (f[1] != null) {
        value += f[1];
      }
      filtering += value + '&';
    });
    return this._http
      .get(threeComponentModel.selectedCatalog.url + '/count' + filtering)
      .pipe(
        concatMap((countOfObjects: CountOfStars[]) => {
          const count = +countOfObjects[0].total;
          if (count < 50000) {
            return <Observable<BaseCatalogData[]>>(
              this._http.get(
                threeComponentModel.selectedCatalog.url + filtering
              )
            );
          } else {
            return of(null);
          }
        }),
        map((objectsImported: BaseCatalogData[]) => {
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
        catchError(() => {
          threeComponentModel.errorMessage = 'COMMON.CATALOG_NOT_READY';
          return of(null);
        })
      );
  }

  public getAll$(baseUrl: string): Observable<BaseCatalogData[]> {
    return <Observable<BaseCatalogData[]>>this._http.get(baseUrl + '/');
  }

  public get$(id: string, baseUrl: string): Observable<BaseCatalogData> {
    return <Observable<BaseCatalogData>>this._http.get(`${baseUrl}/${id}`);
  }

  private _fillPositionProperties(
    threeComponentModel: ThreeComponentModel,
    item: BaseCatalogData
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
