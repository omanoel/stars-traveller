import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ThreeComponentModel } from '../three.component.model';
import { map } from 'lodash';
import { StarsService } from '../stars/stars.service';
import { ICatalogService } from './catalog.model';

@Injectable({
  providedIn: 'root'
})
export class HygCatalogMongoService implements ICatalogService {
  //
  constructor(private _http: HttpClient, private _starsService: StarsService) {
    // Empty
  }

  // @override
  public load(threeComponentModel: ThreeComponentModel): void {
    this.getAll$(threeComponentModel.selectedCatalog.url).subscribe(resp => {
      threeComponentModel.starsImported = resp;
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
