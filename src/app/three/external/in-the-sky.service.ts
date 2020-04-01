import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InTheSkyService {
  public static readonly url = 'https://in-the-sky.org/data/object.php?id=';
  mapping: any = [
    {
      hip: 25,
      tyc: '7529-356-1'
    }
  ];
}
