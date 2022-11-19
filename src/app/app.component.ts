import { Subject } from 'rxjs';

import WebGL from 'three/examples/jsm/capabilities/WebGL';

import { Component, ElementRef, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';

import en from '../assets/i18n/en.json';
import fr from '../assets/i18n/fr.json';
import { MainModel } from './app.model';
import { MenuComponentOptions } from './menu/menu.component.model';
import { CatalogService } from './shared/catalog/catalog.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  //
  private _mainModel: MainModel;
  private _isWebGLAvailable = true;
  public isHelpDisplayed = false;

  constructor(
    public translate: TranslateService,
    private _element: ElementRef,
    private _catalogService: CatalogService,
    private _deviceService: DeviceDetectorService
  ) {
    translate.setTranslation('en', en);
    translate.setTranslation('fr', fr);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  ngOnInit(): void {
    if (!WebGL.isWebGLAvailable()) {
      this._isWebGLAvailable = false;
      const warning = WebGL.getWebGLErrorMessage();
      this._element.nativeElement.appendChild(warning);
      return;
    }

    this._mainModel = {
      average: '',
      catalogs: [],
      objectsImported: [],
      objectsFiltered: [],
      objectsNearest: [],
      selectedCatalog: undefined,
      showSearch: false,
      filters: new Map<string, number[]>(),
      errorMessage: undefined,
      scale: 1,
      closeToTarget: false,
      closeToTarget$: new Subject(),
      indexOfCurrent: 0,
      showProperMotion: false,
      changeOnShowProperMotion: false,
      lastObjectProperties: undefined,
      catalogReadySubject: new Subject(),
      currentIntersected: undefined,
      menuOptions: {
        displayAbout: false,
        displayCatalogs: false,
        displayPovControls: false,
        displayCharts: false,
        displayHelp: false,
        displayIndicators: false,
        displayLanguage: false,
        displayTooltip: false,
        displayTimeLine: false,
        isMobile: this._deviceService.isMobile(),
        isTablet: this._deviceService.isTablet(),
        isDesktopDevice: this._deviceService.isDesktop()
      },
      timeline: {
        startEpoch: 2000,
        deltaEpoch: 0,
        deltaSpeedEpoch: 1,
        displayAnimation: false,
        deltaEpoch$: new Subject()
      }
    };
    this.initComponent();
  }

  public get mainModel(): MainModel {
    return this._mainModel;
  }

  public get menuOptions(): MenuComponentOptions {
    return this._mainModel.menuOptions;
  }

  public get isWebGLAvailable(): boolean {
    return this._isWebGLAvailable;
  }

  public initComponent(): void {
    // get catalogs
    this._mainModel.catalogs = this._catalogService
      .list()
      .filter((c) =>
        environment.production ? c.production === environment.production : true
      );
    //
    //
    this._mainModel.selectedCatalog = this._mainModel.catalogs[0];
    this._catalogService
      .getCatalogService(this._mainModel.selectedCatalog)
      .initialize$(this._mainModel)
      .then(() => {
        this._mainModel.average = '';
        this._mainModel.catalogReadySubject.next(true);
      });
  }

  public resetView(): void {
    // reset all filters
    this._mainModel.timeline.deltaEpoch = 0;
    this._mainModel.timeline.displayAnimation = false;
    this._mainModel.closeToTarget$.next(false);
    this._mainModel.showProperMotion = false;
    this._mainModel.filters = new Map();
    this._catalogService
      .getCatalogService(this._mainModel.selectedCatalog)
      .search$(this._mainModel)
      .subscribe({
        next: () => {
          this._mainModel.objectsFiltered = this._mainModel.objectsImported;
        }
      });
  }
}
