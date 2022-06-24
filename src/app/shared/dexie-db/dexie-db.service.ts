import { Injectable } from '@angular/core';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DexieDbService extends Dexie {
  constructor() {
    super('StarsTraveller');
    this.version(1).stores({
      catalog: 'id'
    });
  }
}
