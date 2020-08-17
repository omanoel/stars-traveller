import { Injectable } from '@angular/core';

export interface InTheSkyData {
  hip: number;
  tyc: string;
}
@Injectable({
  providedIn: 'root'
})
export class InTheSkyService {
  public static readonly url = 'https://in-the-sky.org/data/object.php?id=';
  mapping: InTheSkyData[] = [
    {
      hip: 25,
      tyc: '7529-356-1'
    }
  ];
}
