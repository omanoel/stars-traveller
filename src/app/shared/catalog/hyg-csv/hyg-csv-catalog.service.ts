import { Observable, of } from 'rxjs';
import * as THREE from 'three';

import { Injectable } from '@angular/core';
import { MainModel } from '@app/app.model';
import { ObjectsService } from '@app/three/shared/objects/objects.service';
import { environment } from '@env/environment';

import { BaseCatalogData, ICatalogService } from '../catalog.model';

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
    mainModel: MainModel,
    properties: BaseCatalogData
  ): Observable<BaseCatalogData> {
    return of(mainModel.objectsImported.find((s) => s.id === properties.id));
  }

  public initialize$(mainModel: MainModel): Promise<void> {
    mainModel.average = 'Loading objects...';
    return new Promise((resolve, reject) => {
      new THREE.FileLoader().load(
        // resource URL
        environment.catalogCsvPath + mainModel.selectedCatalog.url,

        // Function when resource is loaded
        (data: string) => {
          mainModel.objectsImported = this._transform(data);
          resolve();
        },

        // Function called when download progresses
        (progress: ProgressEvent) => {
          mainModel.average = this._displaySize(progress.loaded);
        },

        // Function called when download errors
        () => {
          reject();
        }
      );
    });
  }

  // @override
  public load(mainModel: MainModel): void {
    mainModel.indexOfCurrent = 0;
    mainModel.errorMessage = null;
    mainModel.filters.clear();
    this.initialize$(mainModel).then(() => {
      // fill objects
      mainModel.objectsImported.forEach((item) => {
        item.plx = 1 / item.dist;
      });
      // refresh
      this._objectsService.refreshAfterLoadingCatalog(mainModel);
    });
  }

  // @override
  public search$(mainModel: MainModel): Observable<void> {
    mainModel.scale = mainModel.selectedCatalog.scale;
    mainModel.errorMessage = null;
    mainModel.average = 'Searching objects...';
    this.initialize$(mainModel).then(() => {
      // fill objects
      mainModel.objectsImported.forEach((item) => {
        item.plx = 1 / item.dist;
      });
      mainModel.filters.forEach((f, k) => {
        mainModel.objectsImported = mainModel.objectsImported.filter((item) => {
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
        });
      });
      // refresh
      this._objectsService.refreshAfterLoadingCatalog(mainModel);
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
