import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormPositionComponent } from './form-position/form-position.component';
import { MapComponent } from './map/map.component';
import { ThreeComponent } from './three.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { SearchComponent } from './search/search.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
  declarations: [
    ThreeComponent,
    MapComponent,
    SearchComponent,
    TooltipComponent,
    FormPositionComponent
  ],
  exports: [ThreeComponent]
})
export class ThreeModule {}
