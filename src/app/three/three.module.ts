import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MapComponent } from './map/map.component';
import { ThreeComponent } from './three.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  declarations: [ThreeComponent, MapComponent],
  exports: [ThreeComponent]
})
export class ThreeModule {}
