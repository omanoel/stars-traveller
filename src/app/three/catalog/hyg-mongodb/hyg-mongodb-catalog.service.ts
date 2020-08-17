import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjectsService } from '@app/three/objects/objects.service';

import { ThreeComponentModel } from '../../three.component.model';
import { ICatalogService, BaseCatalogData } from '../catalog.model';

@Injectable({
  providedIn: 'root'
})
export class HygMongodbCatalogService implements ICatalogService {
  private static readonly defaultFilter = {
    dist: '0:30'
  };
  //
  constructor(
    protected _objectsService: ObjectsService,
    private _http: HttpClient
  ) {
    // Empty
  }

  // @override
  public count$(): Observable<number> {
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
    prop: BaseCatalogData
  ): Observable<BaseCatalogData> {
    return this.get$(<string>prop.id, threeComponentModel.selectedCatalog.url);
  }

  // @override
  public initialize$(threeComponentModel: ThreeComponentModel): Promise<void> {
    threeComponentModel.average = 'Loading objects...';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => {
      // empty
    });
  }

  public getAll$(baseUrl: string): Observable<BaseCatalogData[]> {
    return <Observable<BaseCatalogData[]>>this._http.get(baseUrl + '/');
  }

  public get$(id: string, baseUrl: string): Observable<BaseCatalogData> {
    return <Observable<BaseCatalogData>>this._http.get(`${baseUrl}/${id}`);
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
      if (f[0] != null) {
        value += f[0];
      }
      value += ':';
      if (f[1] != null) {
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
        map((objectsImported: BaseCatalogData[]) => {
          threeComponentModel.objectsImported = objectsImported;
          // fill objects
          threeComponentModel.objectsImported.forEach(
            (item: BaseCatalogData) => {
              this.fillPositionProperties(item);
            }
          );
          // refresh
          this._objectsService.refreshAfterLoadingCatalog(threeComponentModel);
        }),
        catchError(() => {
          threeComponentModel.errorMessage = 'COMMON.CATALOG_NOT_READY';
          return of(null);
        })
      );
  }

  public fillPositionProperties(star: BaseCatalogData): void {
    star.plx = 1 / star.dist;
  }
}
