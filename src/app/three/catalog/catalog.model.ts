import { ThreeComponentModel } from '../three.component.model';

export interface Catalog {
  id: number;
  name: string;
  production: boolean;
  url: string;
  properties: Property[];
  service: string;
}

export interface Property {
  key: string;
  type: string;
  unit: string;
  tooltip: string;
  min: number;
  max: number;
}

export interface ICatalogService {
  load: Function;
  find: Function;
  initialize: Function;
  transform: Function;
}
