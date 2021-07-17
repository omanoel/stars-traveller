import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { ThreeModule } from './three/three.module';
import { TranslateModule } from '@ngx-translate/core';
import { CatalogsComponent } from './catalogs/catalogs.component';
import { IndicatorsComponent } from './indicators/indicators.component';
import { SearchComponent } from './search/search.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { MenuComponent } from './menu/menu.component';
import { LanguageComponent } from './language/language.component';
import { AboutComponent } from './about/about.component';
import { HelpComponent } from './help/help.component';

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
    HelpComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    ThreeModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [TranslateModule]
})
export class AppModule {}
