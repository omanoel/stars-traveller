import { ICatalogService, Catalog } from './catalog.model';
import { StarsService } from '../stars/stars.service';
import { ThreeComponentModel } from '../three.component.model';
import { Observable, of } from 'rxjs';
import * as THREE from 'three';

export abstract class BaseCatalogService implements ICatalogService {
  constructor(protected _starsService: StarsService) {
    // Empty
  }

  // @override
  public count$(catalog: Catalog): Observable<number> {
    return of(0);
  }

  // @override
  public load(threeComponentModel: ThreeComponentModel): void {}

  // @override
  public findOne(
    threeComponentModel: ThreeComponentModel,
    id: string
  ): Observable<any> {
    return of(null);
  }

  public initialize(threeComponentModel: ThreeComponentModel): Promise<any> {
    threeComponentModel.average = 'loading stars...';
    const _that = this;
    return new Promise((resolve, reject) => {
      new THREE.FileLoader().load(
        // resource URL
        threeComponentModel.selectedCatalog.url,

        // Function when resource is loaded
        (data: string) => {
          threeComponentModel.starsImported = _that.transform(data);
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

  public transform(data): any {
    return JSON.parse(data);
  }

  private _displaySize(size: number): string {
    return size + '...';
  }
}
