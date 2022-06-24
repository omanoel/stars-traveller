import {
  BufferGeometry,
  LineBasicMaterial,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial
} from 'three';

export interface Collection3d {
  groupOfClosestObjects: Object3D;
  groupOfClosestObjectsHelpers: Object3D;
  groupOfClosestObjectsProperMotion: Object3D;
  groupOfClosestObjectsLabel: Object3D;
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

export const starColorFromSpectrum = {
  Z: 0xffffff,
  O: 0x93b6ff,
  B: 0xa7c3ff,
  A: 0xd5e0ff,
  F: 0xf9f5ff,
  G: 0xffecdf,
  K: 0xffd6ac,
  M: 0xffaa58,
  L: 0xff7300,
  T: 0xff3500,
  Y: 0x999999
};

export enum ColorIndex {
  O5V = 'O5V',
  B0V = 'B0V',
  A0V = 'A0V',
  F0V = 'F0V',
  G0V = 'G0V',
  K0V = 'K0V',
  M0V = 'M0V'
}

export const starColorFromColorIndexOrigin = {
  O5V: 0x7070ff,
  B0V: 0x50a0ff,
  A0V: 0xc0cfff,
  F0V: 0xcfffff,
  G0V: 0xefffdf,
  K0V: 0xffff7f,
  M0V: 0xff7f7f
};

export const starColorFromColorIndex = {
  O5V: 0x93b6ff,
  B0V: 0xa7c3ff,
  A0V: 0xd5e0ff,
  F0V: 0xf9f5ff,
  G0V: 0xffecdf,
  K0V: 0xffd6ac,
  M0V: 0xffaa58
};

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

export const ATTRIBUTE_POSITION = 'position';
export const ATTRIBUTE_COLOR = 'color';
export const ATTRIBUTE_SIZE = 'size';
export const ATTRIBUTE_ABSMAG = 'absmag';
