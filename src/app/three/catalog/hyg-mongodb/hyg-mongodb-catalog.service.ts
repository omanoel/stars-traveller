import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as THREE from 'three';

import { StarsService } from '../../stars/stars.service';
import { ThreeComponentModel } from '../../three.component.model';
import { ICatalogService } from '../catalog.model';
import { BaseCatalogService } from '../base-catalog.service';

@Injectable({
  providedIn: 'root',
})
export class HygMongodbCatalogService extends BaseCatalogService {
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
        item.plx = 1 / item.dist;
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
    return this.get$(id, threeComponentModel.selectedCatalog.url);
  }

  public getAll$(baseUrl: string): Observable<any> {
    return this._http.get(baseUrl + '/');
  }

  public get$(id: string, baseUrl: string): Observable<any> {
    return this._http.get(`${baseUrl}/${id}`);
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
