import { Observable, of } from 'rxjs';
import * as THREE from 'three';

import { Injectable } from '@angular/core';
import { ObjectsService } from '@app/three/objects/objects.service';

import { ThreeComponentModel } from '../../three.component.model';
import { ICatalogService, BaseCatalogData } from '../catalog.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class HygCsvCatalogService implements ICatalogService {
  //
  constructor(private _objectsService: ObjectsService) {
    // Empty
  }

  // @override
  public count$(): Observable<number> {
    return of(119614);
  }

  // @override
  public findOne$(
    threeComponentModel: ThreeComponentModel,
    properties: BaseCatalogData
  ): Observable<BaseCatalogData> {
    return of(
      threeComponentModel.objectsImported.find((s) => s.id === properties.id)
    );
  }

  // @override
  public initialize$(threeComponentModel: ThreeComponentModel): Promise<void> {
    threeComponentModel.average = 'Loading objects...';
    return new Promise((resolve, reject) => {
      new THREE.FileLoader().load(
        // resource URL
        environment.catalogCsvPath + threeComponentModel.selectedCatalog.url,

        // Function when resource is loaded
        (data: string) => {
          threeComponentModel.objectsImported = this._transform(data);
          resolve();
        },

        // Function called when download progresses
        (progress: ProgressEvent) => {
          threeComponentModel.average = this._displaySize(progress.loaded);
        },

        // Function called when download errors
        () => {
          reject();
        }
      );
    });
  }

  // @override
  public load(threeComponentModel: ThreeComponentModel): void {
    threeComponentModel.indexOfCurrent = 0;
    threeComponentModel.errorMessage = null;
    this.initialize$(threeComponentModel).then(() => {
      // fill objects
      threeComponentModel.objectsImported.forEach((item) => {
        item.plx = 1 / item.dist;
      });
      // refresh
      this._objectsService.refreshAfterLoadingCatalog(threeComponentModel);
    });
  }

  // @override
  public search$(threeComponentModel: ThreeComponentModel): Observable<void> {
    threeComponentModel.scale = threeComponentModel.selectedCatalog.scale;
    threeComponentModel.errorMessage = null;
    threeComponentModel.average = 'Searching objects...';
    this.initialize$(threeComponentModel).then(() => {
      // fill objects
      threeComponentModel.objectsImported.forEach((item) => {
        item.plx = 1 / item.dist;
      });
      threeComponentModel.filters.forEach((f, k) => {
        threeComponentModel.objectsImported = threeComponentModel.objectsImported.filter(
          (item) => {
            let keep = true;
            if (f[0] != null) {
              keep = item[k] >= f[0];
              if (keep && f[1] != null) {
                keep = item[k] <= f[1];
              }
            } else if (f[1] != null) {
              keep = item[k] <= f[1];
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

  private _transform(data: string): BaseCatalogData[] {
    const lines = data.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(',');
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

  private _displaySize(size: number): string {
    return size + '...';
  }
}
