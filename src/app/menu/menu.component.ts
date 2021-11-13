import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MenuComponentOptions } from './menu.component.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
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
    this.options.displayTimeLine = false;
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
    this.options.displayTimeLine = false;
  }

  public toggleTooltip(): void {
    this.options.displayTooltip = !this.options.displayTooltip;
  }

  public toggleTimeLine(): void {
    this.options.displayCatalogs = false;
    this.options.displayTimeLine = !this.options.displayTimeLine;
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
