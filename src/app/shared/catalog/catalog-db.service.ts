import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { DexieDbService } from '../dexie-db/dexie-db.service';
import { Catalog } from './catalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogDbService {
  table: Dexie.Table<Catalog, number>;

  constructor(private dexieService: DexieDbService) {
    this.table = this.dexieService.table('catalog');
  }

  public getAll(): Promise<Catalog[]> {
    return this.table.toArray();
  }

  public getOne(catalogId: number): Promise<Catalog> {
    return this.table.get(catalogId);
  }

  public add(data: Catalog): Promise<number> {
    return this.table.add(data);
  }

  public update(id: number, data: Catalog): Promise<number> {
    return this.table.update(id, data);
  }

  public remove(id: number): Promise<void> {
    return this.table.delete(id);
  }
}
