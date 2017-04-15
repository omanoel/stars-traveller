import { Directive, Input } from '@angular/core';
import * as THREE from 'three';

@Directive({ selector: 'three-referentiel' })
export class ReferentielComponent {

  object: THREE.PolarGridHelper;

  ngOnInit() {

        let polarGridHelper = new THREE.PolarGridHelper( 20000, 16, 8, 64, 0x0000ff, 0x808080 );
        polarGridHelper.position.y = 0;
        polarGridHelper.position.x = 0;

        this.object = polarGridHelper;
    }
  }

