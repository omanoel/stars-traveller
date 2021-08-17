import * as THREE from 'three';

export interface Collection3d {
  nbObjects: number;
  groupOfClosestObjects: THREE.Object3D;
  groupOfClosestObjectsHelpers: THREE.Object3D;
  groupOfClosestObjectsProperMotion: THREE.Object3D;
  groupOfObjectsGlow: THREE.Object3D;
  // all objects as points
  groupOfObjectsPoints: THREE.Object3D;
  groupOfObjectsMovement: THREE.Object3D;
  geometryMovementGlow: THREE.BufferGeometry;
  loaded: boolean;
  colors: StarColors;
  basicMaterials: Map<string, THREE.MeshBasicMaterial>;
  shaderMaterials: Map<string, THREE.ShaderMaterial>;
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
export const commonMaterialHelper = new THREE.LineBasicMaterial({
  color: 0xfffff,
  transparent: true,
  opacity: 0.2
});
// common material ProperMotion
export const commonMaterialProperMotion = new THREE.LineBasicMaterial({
  color: 0xcdcd00,
  transparent: true,
  opacity: 0.5
});
