import * as THREE from 'three';

import { ICatalogService, BaseCatalogData, Catalog } from './catalog.model';
import { StarsService } from '../stars/stars.service';
import { ThreeComponentModel } from '../three.component.model';
import { Observable, of } from 'rxjs';

export abstract class BaseCatalogService implements ICatalogService {
  constructor(protected _starsService: StarsService) {
    // Empty
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public count$(catalog: Catalog): Observable<number> {
    // To be overridden
    return of(null);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public load(threeComponentModel: ThreeComponentModel): void {
    // To be overridden
  }

  public findOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    threeComponentModel: ThreeComponentModel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id: string
  ): Observable<BaseCatalogData> {
    // To be overridden
    return of(null);
  }

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
