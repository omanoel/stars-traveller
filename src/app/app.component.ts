import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import en from '../assets/i18n/en.json';
import fr from '../assets/i18n/fr.json';
import { MainModel } from './app.model';
import { CatalogService } from './shared/catalog/catalog.service';
import { MenuComponentOptions } from './menu/menu.component.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  //
  private _mainModel: MainModel;
  isHelpDisplayed = false;

  constructor(
    public translate: TranslateService,
    private _catalogService: CatalogService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    translate.setTranslation('en', en);
    translate.setTranslation('fr', fr);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  ngOnInit(): void {
    this._mainModel = {
      average: '',
      catalogs: [],
      objectsImported: [],
      selectedCatalog: undefined,
      showSearch: false,
      filters: new Map<string, number[]>(),
      errorMessage: undefined,
      scale: 1,
      near: 20,
      indexOfCurrent: 0,
      dateMax: 10000,
      dateCurrent: 2000,
      showProperMotion: false,
      changeOnShowProperMotion: false,
      lastObjectProperties: undefined,
      catalogReadySubject: new Subject(),
      currentIntersected: undefined,
      menuOptions: {
        displayAbout: false,
        displayCatalogs: false,
        displayHelp: false,
        displayIndicators: false,
        displayLanguage: false,
        displayTooltip: false
      }
    };
    this.initComponent();
  }

  get mainModel(): MainModel {
    return this._mainModel;
  }

  get menuOptions(): MenuComponentOptions {
    return this._mainModel.menuOptions;
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
        this._changeDetectorRef.detectChanges();
      });
  }
}
