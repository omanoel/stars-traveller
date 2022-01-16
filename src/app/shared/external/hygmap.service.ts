import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HygMapService {
  public static readonly HYGMAP_URL =
    'http://hygmap.space/?select_star={0}&select_center=1';

  public getUrl(id: string): string {
    return HygMapService.HYGMAP_URL.replace('{0}', id);
  }
}
