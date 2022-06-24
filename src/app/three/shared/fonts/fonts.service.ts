import { Injectable } from '@angular/core';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
@Injectable({
  providedIn: 'root'
})
export class FontsService {
  _font: Font;

  constructor() {
    //
    const loader = new FontLoader();
    loader.load('assets/fonts/optimer_regular.typeface.json', (response) => {
      this._font = response;
    });
  }

  public get font(): Font {
    return this._font;
  }
}
