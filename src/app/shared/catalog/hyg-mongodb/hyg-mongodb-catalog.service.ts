import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjectsService } from '@app/three/shared/objects/objects.service';

import { ICatalogService, BaseCatalogData } from '../catalog.model';
import { MainModel } from '@app/app.model';

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
  public load(mainModel: MainModel): void {
    mainModel.errorMessage = null;
    mainModel.filters.clear();
    mainModel.filters.set('dist', [0, 30]);
    this.search$(mainModel).subscribe();
  }

  // @override
  public findOne$(
    mainModel: MainModel,
    prop: BaseCatalogData
  ): Observable<BaseCatalogData> {
    return this.get$(<string>prop.id, mainModel.selectedCatalog.url);
  }

  // @override
  public initialize$(mainModel: MainModel): Promise<void> {
    mainModel.average = 'Loading objects...';
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
  public search$(mainModel: MainModel): Observable<void> {
    mainModel.indexOfCurrent = 0;
    mainModel.scale = mainModel.selectedCatalog.scale;
    mainModel.errorMessage = null;
    mainModel.average = 'Searching objects...';
    const filtering = {};
    mainModel.filters.forEach((f, k) => {
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
        mainModel.selectedCatalog.url + '/search/' + JSON.stringify(filtering)
      )
      .pipe(
        map((objectsImported: BaseCatalogData[]) => {
          mainModel.objectsImported = objectsImported;
          // fill objects
          mainModel.objectsImported.forEach((item: BaseCatalogData) => {
            this.fillPositionProperties(item);
          });
          // refresh
          this._objectsService.refreshAfterLoadingCatalog(mainModel);
        }),
        catchError(() => {
          mainModel.errorMessage = 'COMMON.CATALOG_NOT_READY';
          return of(null);
        })
      );
  }

  public fillPositionProperties(star: BaseCatalogData): void {
    star.plx = 1 / star.dist;
  }
}
