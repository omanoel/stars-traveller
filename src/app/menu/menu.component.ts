import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MenuComponentOptions } from './menu.component.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
  @Input() options: MenuComponentOptions;

  constructor(public translate: TranslateService) {}

  ngOnInit(): void {
    //
  }

  public toggleAll(): void {
    this.options.displayAbout = false;
    this.options.displayLanguage = false;
    this.options.displayCatalogs = false;
    this.options.displayHelp = false;
    this.options.displayIndicators = false;
    this.options.displayTooltip = false;
  }

  public toggleHelp(): void {
    this.options.displayAbout = false;
    this.options.displayLanguage = false;
    this.options.displayCatalogs = false;
    this.options.displayHelp = !this.options.displayHelp;
  }

  public toggleAbout(): void {
    this.options.displayLanguage = false;
    this.options.displayHelp = false;
    this.options.displayCatalogs = false;
    this.options.displayAbout = !this.options.displayAbout;
  }

  public toggleCatalogs(): void {
    this.options.displayAbout = false;
    this.options.displayLanguage = false;
    this.options.displayHelp = false;
    this.options.displayCatalogs = !this.options.displayCatalogs;
  }

  public toggleTooltip(): void {
    this.options.displayTooltip = !this.options.displayTooltip;
  }

  public toggleIndicators(): void {
    this.options.displayIndicators = !this.options.displayIndicators;
  }

  public toggleLanguage(): void {
    this.options.displayAbout = false;
    this.options.displayCatalogs = false;
    this.options.displayHelp = false;
    this.options.displayLanguage = !this.options.displayLanguage;
  }
}
