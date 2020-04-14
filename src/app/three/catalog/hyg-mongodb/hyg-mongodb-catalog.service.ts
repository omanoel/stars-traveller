import { isNil } from 'lodash';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjectsService } from '@app/three/objects/objects.sevice';

import { ThreeComponentModel } from '../../three.component.model';
import { Catalog, ICatalogService } from '../catalog.model';

@Injectable({
  providedIn: 'root',
})
export class HygMongodbCatalogService implements ICatalogService {
  private static readonly defaultFilter = {
    dist: '0:30',
  };
  //
  constructor(
    protected _objectsService: ObjectsService,
    private _http: HttpClient
  ) {
    // Empty
  }

  // @override
  public count$(catalog: Catalog): Observable<number> {
    return of(119614);
  }

  // @override
  public load(threeComponentModel: ThreeComponentModel): void {
    threeComponentModel.errorMessage = null;
    threeComponentModel.filters.clear();
    threeComponentModel.filters.set('dist', [0, 30]);
    this.search$(threeComponentModel).subscribe();
  }

  // @override
  public findOne$(
    threeComponentModel: ThreeComponentModel,
    properties: any
  ): Observable<any> {
    return this.get$(properties.id, threeComponentModel.selectedCatalog.url);
  }

  public getAll$(baseUrl: string): Observable<any> {
    return this._http.get(baseUrl + '/');
  }

  public get$(id: string, baseUrl: string): Observable<any> {
    return this._http.get(`${baseUrl}/${id}`);
  }

  // @override
  public search$(threeComponentModel: ThreeComponentModel): Observable<void> {
    threeComponentModel.indexOfCurrent = 0;
    threeComponentModel.scale = threeComponentModel.selectedCatalog.scale;
    threeComponentModel.errorMessage = null;
    threeComponentModel.average = 'Searching objects...';
    const filtering = {};
    threeComponentModel.filters.forEach((f, k) => {
      let value = '';
      if (!isNil(f[0])) {
        value += f[0];
      }
      value += ':';
      if (!isNil(f[1])) {
        value += f[1];
      }
      filtering[k] = value;
    });
    return this._http
      .get(
        threeComponentModel.selectedCatalog.url +
          '/search/' +
          JSON.stringify(filtering)
      )
      .pipe(
        map((objectsImported: any) => {
          threeComponentModel.objectsImported = objectsImported;
          // fill objects
          threeComponentModel.objectsImported.forEach((item) => {
            this._fillPositionProperties(threeComponentModel, item);
          });
          // refresh
          this._objectsService.refreshAfterLoadingCatalog(threeComponentModel);
        }),
        catchError((err: any) => {
          threeComponentModel.errorMessage = 'COMMON.CATALOG_NOT_READY';
          return of(null);
        })
      );
  }

  private _fillPositionProperties(
    threeComponentModel: ThreeComponentModel,
    item: any
  ): void {
    item.plx = 1 / item.dist;
  }
}
