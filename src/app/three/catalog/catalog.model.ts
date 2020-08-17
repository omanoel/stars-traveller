import { Observable } from 'rxjs';
import { ThreeComponentModel } from '../three.component.model';

export interface Catalog {
  id: number;
  name: string;
  production: boolean;
  url: string;
  properties: Property[];
  service: string;
  scale: number;
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
  load: (threeComponentModel: ThreeComponentModel) => void;
  findOne$: (
    threeComponentModel: ThreeComponentModel,
    prop: BaseCatalogData
  ) => Observable<BaseCatalogData>;
  search$: (threeComponentModel: ThreeComponentModel) => Observable<void>;
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
  spect: string;
  ci: string;
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
