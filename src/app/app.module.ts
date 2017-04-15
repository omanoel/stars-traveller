import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
//import { CubeComponent } from './cube/cube.component';
//import { PanoramaEquirectangularComponent } from './panorama-equirectangular/panorama-equirectangular.component';

import { ThreeModule } from './three/three.module';

@NgModule({
  declarations: [
    AppComponent,
    //CubeComponent,
    //PanoramaEquirectangularComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ThreeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
