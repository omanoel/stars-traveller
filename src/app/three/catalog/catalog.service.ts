import { cloneDeep } from 'lodash';

import { Injectable } from '@angular/core';

import { Catalog } from './catalog.model';
import hygcatalogcsvLocal from './config/hyg-catalog-csv-local.json';
import hygcatalogcsvDistant from './config/hyg-catalog-csv-distant.json';
import hygcatalogMongo from './config/hyg-catalog-mongo.json';
import { HygCatalogCsvService } from './hyg-catalog-csv.service';
import { HygCatalogMongoService } from './hyg-catalog-mongo.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  //
  constructor(
    private _hygCatalogCsvService: HygCatalogCsvService,
    private _hygCatalogMongoService: HygCatalogMongoService
  ) {
    // Empty
  }

  public list(): Catalog[] {
    return [hygcatalogcsvLocal, hygcatalogcsvDistant, hygcatalogMongo];
  }

  public getCatalogService(catalog: Catalog): any {
    if (catalog.service === 'HygCatalogCsvService') {
      return this._hygCatalogCsvService;
    } else if (catalog.service === 'HygCatalogMongoService') {
      return this._hygCatalogMongoService;
    }
  }
}
