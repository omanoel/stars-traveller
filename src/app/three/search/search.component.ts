import { isNil } from 'lodash';

import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from '@env/environment';

import { Catalog, Property } from '../catalog/catalog.model';
import { CatalogService } from '../catalog/catalog.service';
import { ThreeComponentModel } from '../three.component.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @Input() model: ThreeComponentModel;

  public isHelpVisible = false;
  searchForm: FormGroup;
  selectedCatalog: Catalog;
  isSelectedCatalogWithSearch: boolean;

  constructor(
    public translate: TranslateService,
    private _catalogService: CatalogService
  ) {}
  //
  ngOnInit() {
    this.model.selectedCatalog = this.model.catalogs[0];
    this.isSelectedCatalogWithSearch = !isNil(
      this._catalogService.getCatalogService(this.model.selectedCatalog).search
    );
    this.searchForm = new FormGroup({
      catalogFc: new FormControl(this.model.selectedCatalog),
    });
    this._buildRangeForProperties(this.model.selectedCatalog.properties);

    this.searchForm
      .get('catalogFc')
      .valueChanges.subscribe((value: Catalog) => {
        this._removeRangeForProperties(this.model.selectedCatalog.properties);
        this.model.selectedCatalog = value;
        this._buildRangeForProperties(this.model.selectedCatalog.properties);
        this._catalogService.getCatalogService(value).load(this.model);
        this.isSelectedCatalogWithSearch = !isNil(
          this._catalogService.getCatalogService(this.model.selectedCatalog)
            .search
        );
      });

    this.searchForm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((values: any) => {
        this._manageFormProperties(values);
      });
  }

  public propertiesWithFilter(properties: Property[]): Property[] {
    return properties.filter((p) => p.filter);
  }

  public isCatalogDisabled(catalog: Catalog): boolean {
    if (environment.production) {
      return catalog.production !== environment.production;
    }
    return false;
  }

  public seeHelp(status: boolean): void {
    this.isHelpVisible = status;
  }

  public search(): void {
    this._catalogService
      .getCatalogService(this.model.selectedCatalog)
      .search(this.model)
      .subscribe();
  }

  isPropertyDisabled(propKey): boolean {
    return !this.searchForm.get(propKey).value;
  }

  private _manageFormProperties(values: any): void {
    this.propertiesWithFilter(this.model.selectedCatalog.properties).forEach(
      (prop) => {
        if (!isNil(values[prop.key]) && values[prop.key]) {
          if (!this.model.filters.has(prop.key)) {
            this.searchForm.get(prop.key + '_1').enable({ emitEvent: false });
            this.searchForm.get(prop.key + '_r1').enable({ emitEvent: false });
            this.searchForm.get(prop.key + '_2').enable({ emitEvent: false });
            this.searchForm.get(prop.key + '_r2').enable({ emitEvent: false });
            this.model.filters.set(prop.key, [
              this.searchForm.get(prop.key + '_1').value,
              this.searchForm.get(prop.key + '_2').value,
            ]);
            return;
          }
          const f = this.model.filters.has(prop.key)
            ? this.model.filters.get(prop.key)
            : [null, null];

          const vr1 = values[prop.key + '_r1'];
          const vr2 = values[prop.key + '_r2'];
          const v1 = values[prop.key + '_1'];
          const v2 = values[prop.key + '_2'];
          let newV1 = v1;
          let newV2 = v2;
          if (vr1 !== v1) {
            if (vr1 !== f[0]) {
              newV1 = vr1;
            } else {
              newV1 = v1;
            }
          }
          if (vr2 !== v2) {
            if (vr2 !== f[1]) {
              newV2 = vr2;
            } else {
              newV2 = v2;
            }
          }
          if (newV1 > newV2) {
            const oldV = newV2;
            newV2 = newV1;
            newV1 = oldV;
          }
          this.searchForm
            .get(prop.key + '_1')
            .setValue(newV1, { emitEvent: false });
          this.searchForm
            .get(prop.key + '_r1')
            .setValue(newV1, { emitEvent: false });
          this.searchForm
            .get(prop.key + '_2')
            .setValue(newV2, { emitEvent: false });
          this.searchForm
            .get(prop.key + '_r2')
            .setValue(newV2, { emitEvent: false });
          this.model.filters.set(prop.key, [newV1, newV2]);
        } else if (this.model.filters.has(prop.key)) {
          this.model.filters.delete(prop.key);
          this.searchForm.get(prop.key + '_1').disable({ emitEvent: false });
          this.searchForm.get(prop.key + '_r1').disable({ emitEvent: false });
          this.searchForm.get(prop.key + '_2').disable({ emitEvent: false });
          this.searchForm.get(prop.key + '_r2').disable({ emitEvent: false });
        }
      }
    );
  }

  private _buildRangeForProperties(properties: Property[]): void {
    this.propertiesWithFilter(properties).forEach((prop) => {
      this.searchForm.addControl(prop.key, new FormControl(false));
      this.searchForm.addControl(prop.key + '_1', new FormControl(prop.min));
      this.searchForm.addControl(prop.key + '_2', new FormControl(prop.max));
      this.searchForm.addControl(prop.key + '_r1', new FormControl(prop.min));
      this.searchForm.addControl(prop.key + '_r2', new FormControl(prop.max));
      this.searchForm.get(prop.key + '_1').disable({ emitEvent: false });
      this.searchForm.get(prop.key + '_r1').disable({ emitEvent: false });
      this.searchForm.get(prop.key + '_2').disable({ emitEvent: false });
      this.searchForm.get(prop.key + '_r2').disable({ emitEvent: false });
    });
  }

  private _removeRangeForProperties(properties: Property[]): void {
    this.propertiesWithFilter(properties).forEach((prop) => {
      this.searchForm.removeControl(prop.key);
      this.searchForm.removeControl(prop.key + '_1');
      this.searchForm.removeControl(prop.key + '_2');
      this.searchForm.removeControl(prop.key + '_r1');
      this.searchForm.removeControl(prop.key + '_r2');
    });
  }
}
