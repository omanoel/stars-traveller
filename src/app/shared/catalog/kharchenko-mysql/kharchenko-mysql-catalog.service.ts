import { Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MainModel } from '@app/app.model';
import { ObjectsService } from '@app/three/shared/objects/objects.service';

import {
  BaseCatalogData,
  Catalog,
  CountOfStars,
  ICatalogService
} from '../catalog.model';
import { environment } from '@env/environment';

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
    return this._http.get(environment.basePath + catalog.url + '/count').pipe(
      map((result) => {
        return result[0].total;
      })
    );
  }

  // @override
  public findOne$(
    mainModel: MainModel,
    prop: BaseCatalogData
  ): Observable<BaseCatalogData> {
    return <Observable<BaseCatalogData>>this.get$(
      <string>prop.id,
      mainModel.selectedCatalog.url
    ).pipe(
      map((objectImported: BaseCatalogData) => {
        this._fillPositionProperties(mainModel, objectImported);
        return objectImported;
      }),
      catchError(() => of('Error, could not count'))
    );
  }

  // @override
  public initialize$(mainModel: MainModel): Promise<void> {
    mainModel.average = 'Loading objects...';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => {
      // empty
    });
  }

  // @override
  public load(mainModel: MainModel): void {
    mainModel.errorMessage = null;
    mainModel.filters.clear();
    mainModel.filters.set('bmag', [-1429, 7000]);
    this.search$(mainModel).subscribe({
      complete: () => {
        //
      }
    });
  }

  // @override
  public search$(mainModel: MainModel): Observable<void> {
    mainModel.indexOfCurrent = 0;
    mainModel.scale = mainModel.selectedCatalog.scale;
    mainModel.errorMessage = null;
    mainModel.average = 'Searching objects...';
    let filtering = '?';
    mainModel.filters.forEach((f, k) => {
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
      .get(mainModel.selectedCatalog.url + '/count' + filtering)
      .pipe(
        concatMap((countOfObjects: CountOfStars[]) => {
          const count = +countOfObjects[0].total;
          if (count < 50000) {
            return <Observable<BaseCatalogData[]>>(
              this._http.get(mainModel.selectedCatalog.url + filtering)
            );
          } else {
            return of(null);
          }
        }),
        map((objectsImported: BaseCatalogData[]) => {
          if (objectsImported) {
            mainModel.errorMessage = null;
            mainModel.objectsImported = objectsImported;
            // fill objects
            mainModel.objectsImported.forEach((item) => {
              this._fillPositionProperties(mainModel, item);
            });
            // refresh
            this._objectsService.refreshAfterLoadingCatalog(mainModel);
          } else {
            mainModel.errorMessage = 'COMMON.ERROR_TOO_MANY_OBJECTS';
          }
        }),
        catchError(() => {
          mainModel.errorMessage = 'COMMON.CATALOG_NOT_READY';
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
    mainModel: MainModel,
    item: BaseCatalogData
  ): void {
    mainModel.selectedCatalog.properties.forEach((prop) => {
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
      mainModel.scale;
    item.y =
      (item.dist *
        Math.cos((item.dec * Math.PI) / 180) *
        Math.sin((item.ra * Math.PI) / 12)) /
      mainModel.scale;
    item.z =
      (item.dist * Math.sin((item.dec * Math.PI) / 180)) / mainModel.scale;
    item.ci = (item.bmag - item.vmag) / 1000;
    item.mag = (item.bmag + item.vmag) / 2000;
    item.absmag = this._computeAbsoluteMagnitude(item.mag, item.dist);
  }

  private _computeAbsoluteMagnitude(
    magnitude: number,
    distance: number
  ): number {
    return magnitude + 5 * Math.log(distance) - 5;
  }
}
