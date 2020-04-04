import { ThreeComponentModel } from '../three.component.model';

export interface Catalog {
  id: number;
  name: string;
  url: string;
  properties: Property[];
  service: string;
}

export interface Property {
  key: string;
  type: string;
  tooltip: string;
  min: number;
  max: number;
}

export interface ICatalogService {
  load: Function;
  find: Function;
}
