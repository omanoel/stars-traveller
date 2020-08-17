export interface StarsModel {
  nbStars: number;
  meshStars: THREE.Mesh[];
  groupOfStars: THREE.Object3D;
  groupOfStarsHelpers: THREE.Object3D;
  groupOfStarsGlow: THREE.Object3D;
  starsPoints: THREE.Object3D;
  loaded: boolean;
  colors: StarColors;
  basicMaterials: Map<string, THREE.MeshBasicMaterial>;
  shaderMaterials: Map<string, THREE.ShaderMaterial>;
}

export interface StarBase {
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
