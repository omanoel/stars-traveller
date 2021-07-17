import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MapComponent } from './map/map.component';
import { ThreeComponent } from './three.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  declarations: [ThreeComponent, MapComponent],
  exports: [ThreeComponent]
})
export class ThreeModule {}
