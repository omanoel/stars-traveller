import { Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { StarsService } from '../../stars/stars.service';
import { ThreeComponentModel } from '../../three.component.model';
import { BaseCatalogService } from '../base-catalog.service';
import { Catalog, BaseCatalogData, CountOfStars } from '../catalog.model';

@Injectable({
  providedIn: 'root'
})
export class KharchenkoMysqlCatalogService extends BaseCatalogService {
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
    return this._http.get(catalog.url + '/count').pipe(
      map((result) => {
        return result[0].total;
      })
    );
  }

  // @override
  public load(threeComponentModel: ThreeComponentModel): void {
    threeComponentModel.filters.clear();
    threeComponentModel.errorMessage = null;
    threeComponentModel.filters.set('bmag', [-1429, 7000]);
    this.search(threeComponentModel).subscribe();
  }

  // @override
  public findOne(
    threeComponentModel: ThreeComponentModel,
    properties: BaseCatalogData
  ): Observable<BaseCatalogData> {
    return <Observable<BaseCatalogData>>this.get$(
      properties.id,
      threeComponentModel.selectedCatalog.url
    ).pipe(
      map((starImported: BaseCatalogData) => {
        this.fillPositionProperties(threeComponentModel, starImported);
        return starImported;
      }),
      catchError(() => of('Error, could not count'))
    );
  }

  // @override
  public search(threeComponentModel: ThreeComponentModel): Observable<void> {
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
        concatMap((countOfStars: CountOfStars[]) => {
          const count = +countOfStars[0].total;
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
        map((starsImported: BaseCatalogData[]) => {
          if (starsImported) {
            threeComponentModel.errorMessage = null;
            threeComponentModel.starsImported = starsImported;
            // fill objects
            threeComponentModel.starsImported.forEach((item) => {
              this.fillPositionProperties(threeComponentModel, item);
            });
            // refresh
            this._starsService.refreshAfterLoadingCatalog(threeComponentModel);
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

  public fillPositionProperties(
    threeComponentModel: ThreeComponentModel,
    star: BaseCatalogData
  ): void {
    threeComponentModel.selectedCatalog.properties.forEach((prop) => {
      if (prop.type === 'number' && star[prop.key]) {
        star[prop.key] = +star[prop.key];
      }
    });
    if (star.plx === 0) {
      star.plx = 0.01;
    }
    star.dist = 100000 / Math.abs(star.plx);
    star.x =
      star.dist *
      Math.cos((star.dec * Math.PI) / 180) *
      Math.cos((star.ra * Math.PI) / 12);
    star.y =
      star.dist *
      Math.cos((star.dec * Math.PI) / 180) *
      Math.sin((star.ra * Math.PI) / 12);
    star.z = star.dist * Math.sin((star.dec * Math.PI) / 180);
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
