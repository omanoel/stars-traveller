import { Injectable } from '@angular/core';

import { Catalog } from './catalog.model';
import { HygCsvCatalogService } from './hyg-csv/hyg-csv-catalog.service';
import hygcsvDistant from './hyg-csv/hyg-csv-distant.json';
import hygcsvLocal from './hyg-csv/hyg-csv-local.json';
import { HygMongodbCatalogService } from './hyg-mongodb/hyg-mongodb-catalog.service';
import hygMongo from './hyg-mongodb/hyg-mongodb.json';
import { KharchenkoMysqlCatalogService } from './kharchenko-mysql/kharchenko-mysql-catalog.service';
import kharchenkoMysql from './kharchenko-mysql/kharchenko-mysql.json';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  //
  constructor(
    private _hygCsvCatalogService: HygCsvCatalogService,
    private _hygMongodbCatalogService: HygMongodbCatalogService,
    private _kharchenkoMysqlCatalogService: KharchenkoMysqlCatalogService
  ) {
    // Empty
  }

  public list(): Catalog[] {
    return [hygcsvLocal, hygcsvDistant, hygMongo, kharchenkoMysql];
  }

  public getCatalogService(catalog: Catalog): any {
    if (catalog.service === 'HygCsvCatalogService') {
      return this._hygCsvCatalogService;
    } else if (catalog.service === 'HygMongodbCatalogService') {
      return this._hygMongodbCatalogService;
    } else if (catalog.service === 'KharchenkoMysqlCatalogService') {
      return this._kharchenkoMysqlCatalogService;
    }
  }
}