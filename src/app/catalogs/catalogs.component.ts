import { Observable } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MainModel } from '@app/app.model';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';

import { Catalog } from '../shared/catalog/catalog.model';
import { CatalogService } from '../shared/catalog/catalog.service';
import { TargetService } from '../three/shared/target/target.service';

export interface CatalogExt extends Catalog {
  count: number;
}

@Component({
  selector: 'app-catalogs',
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.scss']
})
export class CatalogsComponent implements OnInit {
  //
  @Input()
  model: MainModel;

  public catalogsExt: CatalogExt[] = [];
  public catalogsForm: FormGroup;
  public interval;

  constructor(
    public translate: TranslateService,
    private _catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.catalogsForm = new FormGroup({
      catalogFc: new FormControl(
        '' + this.model.selectedCatalog.id,
        Validators.required
      )
    });
    this.model.catalogs.forEach((catalog) => {
      const catalogExt: CatalogExt = { ...catalog, count: 0 };
      this._count$(catalog).subscribe(
        (counter) => {
          catalogExt.count = counter;
        },
        () => {
          catalogExt.count = NaN;
        }
      );
      this.catalogsExt.push(catalogExt);
    });
    // subscriptions
    this.catalogsForm.get('catalogFc').valueChanges.subscribe((id: string) => {
      this.model.selectedCatalog = this.model.catalogs.find(
        (c) => c.id === +id
      );
      this.model.showSearch = false;
      this._catalogService
        .getCatalogService(this.model.selectedCatalog)
        .load(this.model);
    });
  }

  public isCatalogDisabled(catalog: Catalog): boolean {
    if (environment.production) {
      return catalog.production !== environment.production;
    }
    return false;
  }

  public showFilters(): void {
    this.model.showSearch = !this.model.showSearch;
  }

  public play(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      return;
    }
    this.interval = setInterval(() => {
      if (this.model.dateCurrent < this.model.dateMax) {
        this.model.dateCurrent += 100;
        this.catalogsForm
          .get('dateCurrentFc')
          .setValue(this.model.dateCurrent, { emitEvent: false });
      }
    }, 100);
  }
  private _count$(catalog: Catalog): Observable<number> {
    return this._catalogService.getCatalogService(catalog).count$(catalog);
  }

  public getCurrentId(): string {
    if (this.model.lastObjectProperties) {
      return this.model.lastObjectProperties.id.toString();
    } else {
      return '-';
    }
  }
}
