import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { StarsService } from '../../stars/stars.service';
import { ThreeComponentModel } from '../../three.component.model';
import { BaseCatalogService } from '../base-catalog.service';

@Injectable({
  providedIn: 'root',
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
  public load(threeComponentModel: ThreeComponentModel): void {
    this.initialize(threeComponentModel).then(() => {
      // fill objects
      threeComponentModel.starsImported.forEach((item) => {
        this.fillPositionProperties(threeComponentModel, item);
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
    return this.get$(id, threeComponentModel.selectedCatalog.url).pipe(
      map((starImported: any) => {
        this.fillPositionProperties(threeComponentModel, starImported);
        return starImported;
      })
    );
  }

  public getAll$(baseUrl: string): Observable<any> {
    return this._http.get(baseUrl + '/');
  }

  public get$(id: string, baseUrl: string): Observable<any> {
    return this._http.get(`${baseUrl}/${id}`);
  }

  public fillPositionProperties(
    threeComponentModel: ThreeComponentModel,
    star: any
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
    star.x = star.dist * Math.cos((star.ra * Math.PI) / 12);
    star.y = star.dist * Math.sin((star.ra * Math.PI) / 12);
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
