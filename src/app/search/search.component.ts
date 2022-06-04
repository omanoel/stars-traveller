import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MainModel } from '@app/app.model';
import { TranslateService } from '@ngx-translate/core';

import { Catalog, Property } from '../shared/catalog/catalog.model';
import { CatalogService } from '../shared/catalog/catalog.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @Input() model: MainModel;

  public isHelpVisible = false;
  public searchForm: UntypedFormGroup;
  public selectedCatalog: Catalog;
  public isSelectedCatalogWithSearch: boolean;

  constructor(
    public translate: TranslateService,
    private _catalogService: CatalogService
  ) {}
  //
  public ngOnInit(): void {
    this.isSelectedCatalogWithSearch =
      this._catalogService.getCatalogService(this.model.selectedCatalog)
        .search$ != null;
    this.searchForm = new UntypedFormGroup({});
    this._buildRangeForProperties(this.model);

    this.searchForm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe({
        next: (values: unknown) => {
          this._manageFormProperties(values);
        }
      });
  }

  public propertiesWithFilter(properties: Property[]): Property[] {
    return properties.filter((p) => p.filter);
  }

  public seeHelp(status: boolean): void {
    this.isHelpVisible = status;
  }

  public search(): void {
    this._catalogService
      .getCatalogService(this.model.selectedCatalog)
      .search$(this.model)
      .subscribe({
        complete: () => {
          // search complete
        }
      });
  }

  public close(): void {
    this.model.showSearch = false;
  }

  private _manageFormProperties(values: unknown): void {
    this.propertiesWithFilter(this.model.selectedCatalog.properties).forEach(
      (prop) => {
        if (values[prop.key] != null && values[prop.key]) {
          if (!this.model.filters.has(prop.key)) {
            this.searchForm.get(prop.key + '_1').enable({ emitEvent: false });
            this.searchForm.get(prop.key + '_r1').enable({ emitEvent: false });
            this.searchForm.get(prop.key + '_2').enable({ emitEvent: false });
            this.searchForm.get(prop.key + '_r2').enable({ emitEvent: false });
            this.model.filters.set(prop.key, [
              this.searchForm.get(prop.key + '_1').value,
              this.searchForm.get(prop.key + '_2').value
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

  private _buildRangeForProperties(model: MainModel): void {
    const properties = model.selectedCatalog.properties;
    this.propertiesWithFilter(properties).forEach((prop) => {
      const isUsed = model.filters.has(prop.key);
      let min = prop.min;
      let max = prop.max;
      if (isUsed) {
        min = model.filters.get(prop.key)[0];
        max = model.filters.get(prop.key)[1];
      }

      this.searchForm.addControl(prop.key, new UntypedFormControl(isUsed));
      this.searchForm.addControl(prop.key + '_1', new UntypedFormControl(min));
      this.searchForm.addControl(prop.key + '_2', new UntypedFormControl(max));
      this.searchForm.addControl(prop.key + '_r1', new UntypedFormControl(min));
      this.searchForm.addControl(prop.key + '_r2', new UntypedFormControl(max));
      if (!isUsed) {
        this.searchForm.get(prop.key + '_1').disable({ emitEvent: false });
        this.searchForm.get(prop.key + '_r1').disable({ emitEvent: false });
        this.searchForm.get(prop.key + '_2').disable({ emitEvent: false });
        this.searchForm.get(prop.key + '_r2').disable({ emitEvent: false });
      }
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
