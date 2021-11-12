import { Subject } from 'rxjs';
import { Object3D } from 'three';

import { MenuComponentOptions } from './menu/menu.component.model';
import { BaseCatalogData, Catalog } from './shared/catalog/catalog.model';
import { TimelineModel } from './timeline/timeline.model';

export interface MainModel {
  average: string;
  catalogs: Catalog[];
  objectsImported: BaseCatalogData[];
  objectsFiltered: BaseCatalogData[];
  objectsNearest: BaseCatalogData[];
  selectedCatalog: Catalog;
  showSearch: boolean;
  filters: Map<string, number[]>;
  errorMessage: string;
  scale: number;
  closeToTarget: boolean;
  closeToTarget$: Subject<boolean>;
  indexOfCurrent: number;
  showProperMotion: boolean;
  lastObjectProperties: BaseCatalogData;
  changeOnShowProperMotion: boolean;
  catalogReadySubject: Subject<boolean>;
  currentIntersected: Object3D;
  menuOptions: MenuComponentOptions;
  timeline: TimelineModel;
}
