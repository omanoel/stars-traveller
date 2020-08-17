import { isNil } from 'lodash';
import { Observable, of } from 'rxjs';
import * as THREE from 'three';

import { Injectable } from '@angular/core';
import { ObjectsService } from '@app/three/objects/objects.sevice';

import { ThreeComponentModel } from '../../three.component.model';
import { Catalog, ICatalogService, Property } from '../catalog.model';

@Injectable({
  providedIn: 'root',
})
export class MessierCsvCatalogService implements ICatalogService {
  //
  constructor(protected _objectsService: ObjectsService) {
    // Empty
  }

  // @override
  public load(threeComponentModel: ThreeComponentModel): void {
    threeComponentModel.filters.clear();
    threeComponentModel.errorMessage = null;
    this.search$(threeComponentModel).subscribe();
  }

  // @override
  public count$(catalog: Catalog): Observable<number> {
    return of(110);
  }

  // @override
  public findOne$(
    threeComponentModel: ThreeComponentModel,
    properties: any
  ): Observable<any> {
    return of(
      threeComponentModel.objectsImported.find((s) => s.id === properties.id)
    );
  }

  // @override
  public transform(data: any): any {
    const lines = data.split('\n');
    const result = [];
    const headers = lines[0].split(';');

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(';');
      if (currentline.length > 1) {
        for (let j = 0; j < headers.length; j++) {
          const value = currentline[j];
          let valueTransform;
          valueTransform = parseFloat(value);
          if (isNaN(valueTransform)) {
            valueTransform = value;
          }
          obj[headers[j]] = valueTransform;
        }
        result.push(obj);
      }
    }
    return result;
  }

  // @override
  public search$(threeComponentModel: ThreeComponentModel): Observable<void> {
    threeComponentModel.scale = threeComponentModel.selectedCatalog.scale;
    threeComponentModel.errorMessage = null;
    threeComponentModel.average = 'Searching objects...';
    this._initialize$(threeComponentModel).then(() => {
      // fill objects
      threeComponentModel.objectsImported.forEach((item) => {
        this._fillPositionProperties(threeComponentModel, item);
      });
      threeComponentModel.filters.forEach((f, k) => {
        threeComponentModel.objectsImported = threeComponentModel.objectsImported.filter(
          (star) => {
            let keep = true;
            if (!isNil(f[0])) {
              keep = star[k] < f[0];
            }
            if (!isNil(f[1])) {
              keep = star[k] > f[1];
            }
            return keep;
          }
        );
      });
      // refresh
      this._objectsService.refreshAfterLoadingCatalog(threeComponentModel);
    });
    return of(null);
  }

  private _initialize$(threeComponentModel: ThreeComponentModel): Promise<any> {
    threeComponentModel.average = 'Loading objects...';
    const _that = this;
    return new Promise((resolve, reject) => {
      new THREE.FileLoader().load(
        // resource URL
        threeComponentModel.selectedCatalog.url,

        // Function when resource is loaded
        (data: string) => {
          threeComponentModel.objectsImported = _that._transform(
            threeComponentModel.selectedCatalog.properties,
            data
          );
          resolve();
        },

        // Function called when download progresses
        (progress: ProgressEvent) => {
          threeComponentModel.average = this._displaySize(progress.loaded);
        },

        // Function called when download errors
        (error: ErrorEvent) => {
          console.error('An error happened: ' + error);
          reject();
        }
      );
    });
  }

  private _transform(properties: Property[], data: any): any {
    const lines = data.replace(/\r/g, '').split('\n');
    const result = [];
    const headers = lines[0].split(';');

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      let isCanBePlaced = true;
      const currentline = lines[i].split(';');
      if (currentline.length > 1) {
        for (let j = 0; j < headers.length; j++) {
          const value = currentline[j];
          const prop = properties.find((_prop) => _prop.key === headers[j]);
          let valueTransform = value;
          if (prop) {
            if (prop.key === 'ra') {
              valueTransform = this._computeRa(value);
              if (isNaN(valueTransform)) {
                isCanBePlaced = false;
              }
            } else if (prop.key === 'dec') {
              valueTransform = this._computeDec(value);
              if (isNaN(valueTransform)) {
                isCanBePlaced = false;
              }
            } else if (prop.type === 'number') {
              valueTransform = parseFloat(value);
              if (isNaN(valueTransform)) {
                isCanBePlaced = false;
              }
            }
          }
          obj[headers[j]] = valueTransform;
        }
        if (isCanBePlaced) {
          result.push(obj);
        }
      }
    }
    return result;
  }

  private _displaySize(size: number): string {
    return size + '...';
  }

  private _fillPositionProperties(
    threeComponentModel: ThreeComponentModel,
    item: any
  ): void {
    threeComponentModel.selectedCatalog.properties.forEach((prop) => {
      if (prop.type === 'number' && item[prop.key]) {
        item[prop.key] = +item[prop.key];
      }
    });
    item.plx = 1 / item.dist;
    if (item.dist === 0) {
      item.dist = 0.01;
    }
    item.dist = Math.round(item.dist / 3.26156);
    item.plx = 1 / item.dist;
    item.x = Math.round(
      (item.dist *
        Math.cos((item.dec * Math.PI) / 180) *
        Math.cos((item.ra * Math.PI) / 12)) /
        threeComponentModel.scale
    );
    item.y = Math.round(
      (item.dist *
        Math.cos((item.dec * Math.PI) / 180) *
        Math.sin((item.ra * Math.PI) / 12)) /
        threeComponentModel.scale
    );
    item.z = Math.round(
      (item.dist * Math.sin((item.dec * Math.PI) / 180)) /
        threeComponentModel.scale
    );
  }

  // 12:25:24.11 > 12,4
  private _computeRa(value: string): number {
    const aTerms = value.split(':');
    return (
      Number(aTerms[0]) + Number(aTerms[1]) / 60 + Number(aTerms[2]) / 3600
    );
  }

  // +18:11:29.4 > 12,4
  private _computeDec(value: string): number {
    const aTerms = value.split(':');
    return (
      Number(aTerms[0]) + Number(aTerms[1]) / 60 + Number(aTerms[2]) / 3600
    );
  }
}
