import {
  BufferGeometry,
  LineBasicMaterial,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial
} from 'three';

export interface Collection3d {
  nbObjects: number;
  groupOfClosestObjects: Object3D;
  groupOfClosestObjectsHelpers: Object3D;
  groupOfClosestObjectsProperMotion: Object3D;
  // all objects as points
  groupOfObjectsPoints: Object3D;
  groupOfObjectsMovement: Object3D;
  geometryMovementGlow: BufferGeometry;
  loaded: boolean;
  colors: StarColors;
  basicMaterials: Map<string, MeshBasicMaterial>;
  shaderMaterials: Map<string, ShaderMaterial>;
}

export interface ObjectBase {
  id: string;
  ra: number;
  dec: number;
  plx: number;
  dist: number;
  spect: string;
  x: number;
  y: number;
  z: number;
}

export interface StarColors {
  Z: number;
  O: number;
  B: number;
  A: number;
  F: number;
  G: number;
  K: number;
  M: number;
  L: number;
  T: number;
  Y: number;
}

// common material helper
export const commonMaterialHelper = new LineBasicMaterial({
  color: 0xfffff,
  transparent: true,
  opacity: 0.2
});
// common material ProperMotion
export const commonMaterialProperMotion = new LineBasicMaterial({
  color: 0xcdcd00,
  transparent: true,
  opacity: 0.5
});
