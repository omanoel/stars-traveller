import * as THREE from 'three';

import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

import { ThreeComponentModel } from '../three.component.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  constructor() {
    // Empty
  }

  public initialize(
    threeComponentModel: ThreeComponentModel,
    localPath: boolean
  ): Promise<any> {
    const _that = this;
    return new Promise((resolve, reject) => {
      new THREE.FileLoader().load(
        // resource URL
        localPath ? environment.catalogLocalPath : environment.catalogUrl,

        // Function when resource is loaded
        (data: string) => {
          threeComponentModel.average = '';
          threeComponentModel.starsImported = _that._csvJSON(data);
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

  private _csvJSON(csv): any {
    const lines = csv.split('\n');
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
