import { Injectable } from '@angular/core';
import { BaseCatalogData } from '@app/shared/catalog/catalog.model';
import { Group, Mesh, MeshPhongMaterial } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontsService } from '../fonts/fonts.service';

@Injectable({
  providedIn: 'root'
})
export class TextService {
  //
  private _materials: MeshPhongMaterial[] = [];
  //
  constructor(private _fontsService: FontsService) {
    //
    this._materials = [
      new MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
      new MeshPhongMaterial({ color: 0xffffff }) // side
    ];
  }

  public create(near: BaseCatalogData): Group {
    const textGroup = new Group();
    textGroup.name = 'Text';
    textGroup.userData.properties = near;
    textGroup.translateX(near.x);
    textGroup.translateY(near.y);
    textGroup.translateZ(near.z);
    const textGeo = new TextGeometry(near.proper.toString(), {
      font: this._fontsService.font,
      size: 0.1,
      height: 0.01,
      curveSegments: 12,
      bevelEnabled: false,
      bevelSize: 0.001,
      bevelThickness: 0.005
    });
    const textMesh1 = new Mesh(textGeo, this._materials);
    textGroup.add(textMesh1);
    return textGroup;
  }
}
