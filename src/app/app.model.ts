import { Subject } from 'rxjs';
import { BaseCatalogData, Catalog } from './shared/catalog/catalog.model';
import { MenuComponentOptions } from './menu/menu.component.model';

export interface MainModel {
  average: string;
  catalogs: Catalog[];
  objectsImported: BaseCatalogData[];
  selectedCatalog: Catalog;
  showSearch: boolean;
  filters: Map<string, number[]>;
  errorMessage: string;
  scale: number;
  near: number;
  indexOfCurrent: number;
  dateMax: number;
  dateCurrent: number;
  showProperMotion: boolean;
  lastObjectProperties: BaseCatalogData;
  changeOnShowProperMotion: boolean;
  catalogReadySubject: Subject<boolean>;
  currentIntersected: THREE.Object3D;
  menuOptions: MenuComponentOptions;
}
