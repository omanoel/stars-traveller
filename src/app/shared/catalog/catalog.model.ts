import { Observable } from 'rxjs';

import { MainModel } from '@app/app.model';

export interface Catalog {
  id: number;
  name: string;
  production: boolean;
  url: string;
  properties: Property[];
  service: string;
  scale: number;
  data?: BaseCatalogData[];
}

export interface Property {
  key: string;
  type: string;
  unit: string;
  tooltip: string;
  min: number;
  max: number;
  filter: boolean;
}

export interface ICatalogService {
  count$: (catalog: Catalog) => Observable<number>;
  load: (mainModel: MainModel) => void;
  findOne$: (
    mainModel: MainModel,
    prop: BaseCatalogData
  ) => Observable<BaseCatalogData>;
  search$: (mainModel: MainModel) => Observable<void>;
}

export interface BaseCatalogData {
  id: number | string;
  hip: number | string;
  hd: string;
  hr: string;
  gl: string;
  bf: string;
  proper: string;
  ra: number;
  dec: number;
  dist: number;
  pmra: number;
  pmdec: number;
  rv: string;
  mag: number;
  absmag: number;
  bmag: number;
  vmag: number;
  spect: string;
  ci: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rarad: number;
  decrad: number;
  pmrarad: number;
  pmdecrad: number;
  bayer: string;
  flam: string;
  con: string;
  comp: string;
  comp_primary: string;
  base: string;
  lum: number;
  var: string;
  var_min: string;
  var_max: string;
  tyc: string;
  plx: number;
  tyc1: string;
  tyc2: string;
  tyc3: string;
  object_type: boolean;
}

export interface CountOfStars {
  total: number;
}

export type BaseCatalogProp = keyof BaseCatalogData;

export interface BaseCatalogRange {
  min: number;
  max: number;
}
