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
    id: string
  ) => Observable<BaseCatalogData>;
  initialize: (threeComponentModel: ThreeComponentModel) => Promise<void>;
  transform: (data: string) => BaseCatalogData[];
}
