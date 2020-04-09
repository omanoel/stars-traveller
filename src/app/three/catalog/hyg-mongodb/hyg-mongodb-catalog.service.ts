import { isNil } from 'lodash';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { StarsService } from '../../stars/stars.service';
import { ThreeComponentModel } from '../../three.component.model';
import { BaseCatalogService } from '../base-catalog.service';
import { Catalog } from '../catalog.model';

@Injectable({
  providedIn: 'root',
})
export class HygMongodbCatalogService extends BaseCatalogService {
  private static readonly defaultFilter = {
    dist: '0:30',
  };
  //
  constructor(
    protected _starsService: StarsService,
    private _http: HttpClient
  ) {
    // Empty
    super(_starsService);
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
    this.search(threeComponentModel).subscribe();
  }

  // @override
  public findOne(
    threeComponentModel: ThreeComponentModel,
    id: string
  ): Observable<any> {
    return this.get$(id, threeComponentModel.selectedCatalog.url);
  }

  public getAll$(baseUrl: string): Observable<any> {
    return this._http.get(baseUrl + '/');
  }

  public get$(id: string, baseUrl: string): Observable<any> {
    return this._http.get(`${baseUrl}/${id}`);
  }

  // @override
  public search(threeComponentModel: ThreeComponentModel): Observable<void> {
    threeComponentModel.errorMessage = null;
    threeComponentModel.average = 'Searching stars...';
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
        map((starsImported: any) => {
          threeComponentModel.starsImported = starsImported;
          // fill objects
          threeComponentModel.starsImported.forEach((item) => {
            this.fillPositionProperties(threeComponentModel, item);
          });
          // refresh
          this._starsService.refreshAfterLoadingCatalog(threeComponentModel);
        }),
        catchError((err: any) => {
          threeComponentModel.errorMessage = 'COMMON.CATALOG_NOT_READY';
          return of(null);
        })
      );
  }

  public fillPositionProperties(
    threeComponentModel: ThreeComponentModel,
    star: any
  ): void {
    star.plx = 1 / star.dist;
  }
  /*
  public create(data) {
    return this._http.post(baseUrl, data);
  }

  public update(id, data) {
    return this._http.put(`${baseUrl}/${id}`, data);
  }

  public delete(id) {
    return this._http.delete(`${baseUrl}/${id}`);
  }

  public deleteAll() {
    return this._http.delete(baseUrl);
  }

  public findByTitle(title) {
    return this._http.get(`${baseUrl}?title=${title}`);
  }
  */
}
