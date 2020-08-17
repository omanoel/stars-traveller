import * as THREE from 'three';

import { ICatalogService, BaseCatalogData } from './catalog.model';
import { StarsService } from '../stars/stars.service';
import { ThreeComponentModel } from '../three.component.model';
import { Observable } from 'rxjs';

export abstract class BaseCatalogService implements ICatalogService {
  constructor(protected _starsService: StarsService) {
    // Empty
  }
  public count$: () => Observable<number>;
  public load: () => void;
  public findOne: () => Observable<BaseCatalogData>;

  public initialize(threeComponentModel: ThreeComponentModel): Promise<void> {
    threeComponentModel.average = 'loading stars...';
    return new Promise((resolve, reject) => {
      new THREE.FileLoader().load(
        // resource URL
        threeComponentModel.selectedCatalog.url,

        // Function when resource is loaded
        (data: string) => {
          threeComponentModel.starsImported = this.transform(data);
          resolve();
        },

        // Function called when download progresses
        (progress: ProgressEvent) => {
          threeComponentModel.average = this._displaySize(progress.loaded);
        },

        // Function called when download errors
        () => {
          // console.error('An error happened: ' + error);
          reject();
        }
      );
    });
  }

  public transform(data: string): BaseCatalogData[] {
    return JSON.parse(data);
  }

  private _displaySize(size: number): string {
    return size + '...';
  }
}
