import { Component, Input, OnInit } from '@angular/core';
import { InTheSkyService } from '../external/in-the-sky.service';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {
  @Input() lastStarIntersected: THREE.Object3D;

  public isHelpVisible = false;

  public tooltip = {
    id: {
      title: 'The database primary key',
      unit: ''
    },
    ra: {
      title: "The star's right ascension, for epoch and equinox 2000.0",
      unit: ''
    },
    dec: {
      title: "The star's declination ascension, for epoch and equinox 2000.0",
      unit: '°'
    },
    dist: {
      title: "The star's distance in parsecs",
      unit: 'pc'
    },
    hip: {
      title: "The star's ID in the Hipparcos catalog, if known.",
      unit: ''
    },
    hd: {
      title: "The star's ID in the Henry Draper catalog, if known.",
      unit: ''
    },
    hr: {
      title:
        "The star's ID in the Harvard Revised catalog, which is the same as its number in the Yale Bright Star Catalog.",
      unit: ''
    },
    gl: {
      title:
        "The star's ID in the third edition of the Gliese Catalog of Nearby Stars.",
      unit: ''
    },
    bf: {
      title:
        'The Bayer / Flamsteed designation, primarily from the Fifth Edition of the Yale Bright Star Catalog.',
      unit: ''
    },
    proper: {
      title: '',
      unit: ''
    },
    pmra: {
      title: '',
      unit: ''
    },
    pmdec: {
      title: '',
      unit: ''
    },
    rv: {
      title: '',
      unit: ''
    },
    mag: {
      title: '',
      unit: ''
    },
    absmag: {
      title: '',
      unit: ''
    },
    spect: {
      title: '',
      unit: ''
    },
    ci: {
      title: '',
      unit: ''
    },
    x: {
      title: '',
      unit: ''
    },
    y: {
      title: '',
      unit: ''
    },
    z: {
      title: '',
      unit: ''
    },
    vx: {
      title: '',
      unit: ''
    },
    vy: {
      title: '',
      unit: ''
    },
    vz: {
      title: '',
      unit: ''
    },
    rarad: {
      title: '',
      unit: ''
    },
    decrad: {
      title: '',
      unit: ''
    },
    pmrarad: {
      title: '',
      unit: ''
    },
    pmdecrad: {
      title: '',
      unit: ''
    },
    bayer: {
      title: '',
      unit: ''
    },
    flam: {
      title: '',
      unit: ''
    },
    con: {
      title: '',
      unit: ''
    },
    comp: {
      title: '',
      unit: ''
    },
    comp_primary: {
      title: '',
      unit: ''
    },
    base: {
      title: '',
      unit: ''
    },
    lum: {
      title: '',
      unit: ''
    },
    var: {
      title: '',
      unit: ''
    },
    var_min: {
      title: '',
      unit: ''
    },
    var_max: {
      title: '',
      unit: ''
    },
    tyc: {
      title: '',
      unit: ''
    }
  };

  objectKeys = Object.keys;

  constructor(private _inTheSkyService: InTheSkyService) {}
  //
  ngOnInit() {}

  public getTitle(key: string): string {
    if (this.tooltip[key] && this.tooltip[key].title) {
      return this.tooltip[key].title;
    }
    return key;
  }

  public getUnit(key: string): string {
    if (this.tooltip[key] && this.tooltip[key].unit) {
      return this.tooltip[key].unit;
    }
    return '';
  }

  public getValue(data: any, key: string): string {
    if (key === 'ra') {
      return this._computeRa(data[key]);
    } else if (key === 'dec') {
      return this._computeDec(data[key]);
    }
    return data[key];
  }

  public getLink(data: any, key: string): string {
    if (key === 'hip') {
      const mapp = this._inTheSkyService.mapping.find(m => m.hip === data[key]);
      if (mapp) {
        return InTheSkyService.url + mapp.tyc;
      }
    }
    return null;
  }

  public seeHelp(status: boolean): void {
    this.isHelpVisible = status;
  }

  private _computeRa(ra: string): string {
    const raNumber = Number(ra);
    const hours = Math.floor(raNumber);
    const minutes = raNumber - hours;
    const min = Math.floor(minutes * 60);
    const secondes = (minutes - min / 60) * 60;
    return (
      hours +
      'h ' +
      min +
      'm ' +
      (Math.floor(secondes * 6000) / 100).toFixed(3) +
      's'
    );
  }

  private _computeDec(dec: string): string {
    const raNumber = Number(dec);
    const hours = Math.floor(raNumber);
    const minutes = raNumber - hours;
    const min = Math.floor(minutes * 60);
    const secondes = (minutes - min / 60) * 60;
    return (
      hours +
      '° ' +
      min +
      "' " +
      (Math.floor(secondes * 6000) / 100).toFixed(3) +
      '"'
    );
  }
}
