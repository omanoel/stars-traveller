import { Line, Mesh } from 'three';

export interface ReferentielModel {
  objects: Line[];
  distReference: number;
  skyMap: Mesh;
}
