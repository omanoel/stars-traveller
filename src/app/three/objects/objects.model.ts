export interface Collection3d {
  nbObjects: number;
  groupOfObjects: THREE.Object3D;
  groupOfObjectsHelpers: THREE.Object3D;
  groupOfObjectsGlow: THREE.Object3D;
  groupOfObjectsPoints: THREE.Object3D;
  groupOfObjectsMovement: THREE.Object3D;
  groupOfObjectsProperMotion: THREE.Object3D;
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
