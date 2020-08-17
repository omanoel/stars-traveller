import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { IndicatorsComponent } from './indicators/indicators.component';
import { MapComponent } from './map/map.component';
import { SearchComponent } from './search/search.component';
import { ThreeComponent } from './three.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { TranslateModule } from '@ngx-translate/core';
import { CatalogsComponent } from './catalogs/catalogs.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  declarations: [
    ThreeComponent,
    MapComponent,
    CatalogsComponent,
    IndicatorsComponent,
    SearchComponent,
    TooltipComponent
  ],
  exports: [ThreeComponent]
})
export class ThreeModule {}
