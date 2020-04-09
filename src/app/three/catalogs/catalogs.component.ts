import { Observable } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Catalog } from '../catalog/catalog.model';
import { CatalogService } from '../catalog/catalog.service';
import { ThreeComponentModel } from '../three.component.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '@env/environment';

export interface CatalogExt extends Catalog {
  count: number;
}

@Component({
  selector: 'app-catalogs',
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.scss'],
})
export class CatalogsComponent implements OnInit {
  //
  @Input()
  model: ThreeComponentModel;

  public catalogsExt: CatalogExt[] = [];
  public catalogsForm: FormGroup;

  constructor(
    public translate: TranslateService,
    private _catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.catalogsForm = new FormGroup({
      catalogFc: new FormControl(
        '' + this.model.selectedCatalog.id,
        Validators.required
      ),
    });
    this.model.catalogs.forEach((catalog) => {
      const catalogExt: CatalogExt = { ...catalog, count: 0 };
      this._count$(catalog).subscribe(
        (counter) => {
          catalogExt.count = counter;
        },
        (error: any) => {
          catalogExt.count = NaN;
        }
      );
      this.catalogsExt.push(catalogExt);
    });
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

  private _count$(catalog: Catalog): Observable<number> {
    return this._catalogService.getCatalogService(catalog).count$(catalog);
  }
}
