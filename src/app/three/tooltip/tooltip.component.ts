import { Input, Component, OnInit } from '@angular/core';
import { StarOver, ThreeComponentModel } from '../three.component.model';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {
  @Input() lastStarIntersected: THREE.Object3D;

  public tooltip = {
    id: {
      title: 'The database primary key',
      unit: ''
    },
    ra: {
      title: "The star's right ascension, for epoch and equinox 2000.0",
      unit: '°'
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
      title: '',
      unit: ''
    },
    hd: {
      title: '',
      unit: ''
    },
    hr: {
      title: '',
      unit: ''
    },
    gl: {
      title: '',
      unit: ''
    },
    bf: {
      title: '',
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

  ngOnInit() {}

  public getTooltipTitle(key: string): string {
    if (this.tooltip[key] && this.tooltip[key].title) {
      return this.tooltip[key].title;
    }
    return key;
  }
  public getTooltipUnit(key: string): string {
    if (this.tooltip[key] && this.tooltip[key].unit) {
      return this.tooltip[key].unit;
    }
    return '';
  }
}
