import { from, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { MainModel } from '@app/app.model';
import { ObjectsService } from '@app/three/shared/objects/objects.service';
import { environment } from '@env/environment';

import { BaseCatalogData, Catalog, ICatalogService } from '../catalog.model';
import { FileLoader } from 'three';
import { CatalogDbService } from '../catalog-db.service';

@Injectable({
  providedIn: 'root'
})
export class HygCsvCatalogService implements ICatalogService {
  //
  constructor(
    private _objectsService: ObjectsService,
    private _catalogDbService: CatalogDbService
  ) {
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
    return this._catalogDbService
      .getOne(mainModel.selectedCatalog.id)
      .then((catalog: Catalog) => {
        if (catalog) {
          mainModel.selectedCatalog = catalog;
          mainModel.objectsImported = catalog.data;
        } else {
          return new Promise<void>((resolve, reject) => {
            new FileLoader().load(
              // resource URL
              environment.basePath +
                environment.catalogCsvPath +
                mainModel.selectedCatalog.url,

              // Function when resource is loaded
              (data: string) => {
                mainModel.objectsImported = this._transform(data);
                mainModel.selectedCatalog.data = mainModel.objectsImported;
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
          })
            .then(() => {
              return this._catalogDbService.add(mainModel.selectedCatalog);
            })
            .then(() => {
              // Nothing
            });
        }
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
    return from(
      this.initialize$(mainModel).then(() => {
        // fill objects
        mainModel.objectsImported.forEach((item) => {
          item.plx = 1 / item.dist;
        });
        mainModel.filters.forEach((f, k) => {
          mainModel.objectsImported = mainModel.objectsImported.filter(
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
        this._objectsService.refreshAfterLoadingCatalog(mainModel);
      })
    );
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
