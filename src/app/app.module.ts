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

@NgModule({
  declarations: [
    AppComponent,
    CatalogsComponent,
    IndicatorsComponent,
    SearchComponent,
    TooltipComponent,
    MenuComponent,
    LanguageComponent,
    AboutComponent,
    HelpComponent,
    TimelineComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    ThreeModule,
    ReactiveFormsModule,
    UiComponentsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [TranslateModule]
})
export class AppModule {}
