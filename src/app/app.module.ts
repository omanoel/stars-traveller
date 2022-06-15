import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { UiComponentsModule } from '@ngx-repository/ui-components';

import { AboutComponent } from './about/about.component';
import { AppComponent } from './app.component';
import { CatalogsComponent } from './catalogs/catalogs.component';
import { HelpComponent } from './help/help.component';
import { IndicatorsComponent } from './indicators/indicators.component';
import { LanguageComponent } from './language/language.component';
import { MenuComponent } from './menu/menu.component';
import { SearchComponent } from './search/search.component';
import { ThreeModule } from './three/three.module';
import { TooltipComponent } from './tooltip/tooltip.component';
import { TimelineComponent } from './timeline/timeline.component';
import { ChartsComponent } from './charts/charts.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { CardComponent } from './shared/ui/card/card.component';

@NgModule({
  declarations: [
    AppComponent,
    CatalogsComponent,
    ChartsComponent,
    IndicatorsComponent,
    SearchComponent,
    TooltipComponent,
    MenuComponent,
    LanguageComponent,
    AboutComponent,
    HelpComponent,
    TimelineComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    ThreeModule,
    ReactiveFormsModule,
    UiComponentsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [TranslateModule, CardComponent]
})
export class AppModule {}
