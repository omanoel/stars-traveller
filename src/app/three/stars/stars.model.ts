export interface StarsModel {
  nbStars: number;
  meshStars: THREE.Mesh[];
  groupOfStars: THREE.Object3D;
  groupOfStarsHelpers: THREE.Object3D;
  groupOfStarsGlow: THREE.Object3D;
  starsPoints: THREE.Object3D;
  loaded: boolean;
  colors: any;
  basicMaterials: any;
  shaderMaterials: any;
}
