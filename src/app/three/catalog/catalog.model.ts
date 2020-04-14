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
  count$: Function;
  findOne$: Function;
  load: Function;
  search$: Function;
}
