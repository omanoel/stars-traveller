import { Injectable } from '@angular/core';

import { Catalog } from './catalog.model';
import { HygCsvCatalogService } from './hyg-csv/hyg-csv-catalog.service';
import hygcsvLocal from './hyg-csv/hyg-csv-local.json';
import { HygMongodbCatalogService } from './hyg-mongodb/hyg-mongodb-catalog.service';
import hygMongo from './hyg-mongodb/hyg-mongodb.json';
import { KharchenkoMysqlCatalogService } from './kharchenko-mysql/kharchenko-mysql-catalog.service';
import kharchenkoMysql from './kharchenko-mysql/kharchenko-mysql.json';
import { MessierCsvCatalogService } from './messier-csv/messier-csv-catalog.service';
import messierCsv from './messier-csv/messier-csv.json';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  //
  constructor(
    private _hygCsvCatalogService: HygCsvCatalogService,
    private _hygMongodbCatalogService: HygMongodbCatalogService,
    private _kharchenkoMysqlCatalogService: KharchenkoMysqlCatalogService,
    private _messierCsvCatalogService: MessierCsvCatalogService
  ) {
    // Empty
  }

  public list(): Catalog[] {
    return [hygcsvLocal, hygMongo, kharchenkoMysql, messierCsv];
  }

  public getCatalogService(
    catalog: Catalog
  ):
    | HygCsvCatalogService
    | HygMongodbCatalogService
    | KharchenkoMysqlCatalogService {
    if (catalog.service === 'HygCsvCatalogService') {
      return this._hygCsvCatalogService;
    } else if (catalog.service === 'HygMongodbCatalogService') {
      return this._hygMongodbCatalogService;
    } else if (catalog.service === 'KharchenkoMysqlCatalogService') {
      return this._kharchenkoMysqlCatalogService;
    } else if (catalog.service === 'MessierCsvCatalogService') {
      return this._messierCsvCatalogService;
    }
  }
}
