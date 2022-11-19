import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MenuComponentOptions } from './menu.component.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() options: MenuComponentOptions;
  @Output() resetView: EventEmitter<void> = new EventEmitter();

  constructor(public translate: TranslateService) {}

  ngOnInit(): void {
    //
  }

  public toggleAll(withReset = false): void {
    this.options.displayAbout = false;
    this.options.displayLanguage = false;
    this.options.displayCatalogs = false;
    this.options.displayPovControls = false;
    this.options.displayCharts = false;
    this.options.displayHelp = false;
    this.options.displayIndicators = false;
    this.options.displayTooltip = false;
    this.options.displayTimeLine = false;
    if (withReset) {
      this.resetView.emit();
    }
  }

  public toggleAbout(): void {
    const previous = this.options.displayAbout;
    if (this.options.isMobile) {
      this.toggleAll();
    }
    this.options.displayAbout = !previous;
  }

  public toggleControls(): void {
    const previous = this.options.displayPovControls;
    if (this.options.isMobile) {
      this.toggleAll();
    }
    this.options.displayPovControls = !previous;
  }

  public toggleCatalogs(): void {
    const previous = this.options.displayCatalogs;
    if (this.options.isMobile) {
      this.toggleAll();
    }
    this.options.displayCatalogs = !previous;
  }

  public toggleCharts(): void {
    const previous = this.options.displayCharts;
    this.toggleAll();
    this.options.displayCharts = !previous;
  }

  public toggleHelp(): void {
    const previous = this.options.displayHelp;
    if (this.options.isMobile) {
      this.toggleAll();
    }
    this.options.displayHelp = !previous;
  }

  public toggleTooltip(): void {
    const previous = this.options.displayTooltip;
    if (this.options.isMobile) {
      this.toggleAll();
    }
    this.options.displayTooltip = !previous;
  }

  public toggleTimeLine(): void {
    const previous = this.options.displayTimeLine;
    if (this.options.isMobile) {
      this.toggleAll();
    }
    this.options.displayTimeLine = !previous;
  }

  public toggleIndicators(): void {
    const previous = this.options.displayIndicators;
    if (this.options.isMobile) {
      this.toggleAll();
    }
    this.options.displayIndicators = !previous;
  }

  public toggleLanguage(): void {
    const previous = this.options.displayLanguage;
    if (this.options.isMobile) {
      this.toggleAll();
    }
    this.options.displayLanguage = !previous;
  }
}
