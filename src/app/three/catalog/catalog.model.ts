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
  filter: boolean;
}

export interface ICatalogService {
  load: Function;
  findOne: Function;
  initialize: Function;
  transform: Function;
}
