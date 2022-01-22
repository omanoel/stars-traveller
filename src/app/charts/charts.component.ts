import { Component, Input, OnInit } from '@angular/core';
import { MainModel } from '@app/app.model';
import { BaseCatalogProp } from '@app/shared/catalog/catalog.model';
import { CatalogService } from '@app/shared/catalog/catalog.service';
import { TranslateService } from '@ngx-translate/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {
  //
  @Input() model: MainModel;

  public options: EChartsOption;
  public chartInstance: any;
  public xProp: BaseCatalogProp = 'mag';
  public yProp: BaseCatalogProp = 'absmag';
  public xRange = [Infinity, -Infinity];
  public yRange = [Infinity, -Infinity];
  public xSelectedRange = [Infinity, -Infinity];
  public ySelectedRange = [Infinity, -Infinity];
  public properties: BaseCatalogProp[] = [
    'id',
    'hip',
    'hd',
    'hr',
    'gl',
    'bf',
    'proper',
    'ra',
    'dec',
    'dist',
    'pmra',
    'pmdec',
    'mag',
    'absmag',
    'ci',
    'x',
    'y',
    'z',
    'vx',
    'vy',
    'vz',
    'rarad',
    'decrad',
    'pmrarad',
    'pmdecrad'
  ];

  constructor(
    public translate: TranslateService,
    private _catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this._initData();
  }

  public get arrayFilters(): any[] {
    const arrayF = [];
    this.model.filters.forEach((value, key) => {
      arrayF.push([key, value[0], value[1]]);
    });
    return arrayF;
  }

  public onChartEvent(event: any, type: string): void {
    if (event.batch) {
      event.batch.forEach((batchItem) => {
        if (batchItem.dataZoomId === 'inside-x') {
          this.xSelectedRange[0] =
            this.xRange[0] +
            (batchItem.start * (this.xRange[1] - this.xRange[0])) / 100;
          this.xSelectedRange[1] =
            this.xRange[0] +
            (batchItem.end * (this.xRange[1] - this.xRange[0])) / 100;
        } else if (batchItem.dataZoomId === 'inside-y') {
          this.ySelectedRange[0] =
            this.yRange[0] +
            (batchItem.start * (this.yRange[1] - this.yRange[0])) / 100;
          this.ySelectedRange[1] =
            this.yRange[0] +
            (batchItem.end * (this.yRange[1] - this.yRange[0])) / 100;
        }
      });
    } else {
      if (event.dataZoomId === 'slider-x') {
        this.xSelectedRange[0] =
          this.xRange[0] +
          (event.start * (this.xRange[1] - this.xRange[0])) / 100;
        this.xSelectedRange[1] =
          this.xRange[0] +
          (event.end * (this.xRange[1] - this.xRange[0])) / 100;
      } else if (event.dataZoomId === 'slider-y') {
        this.ySelectedRange[0] =
          this.yRange[0] +
          (event.start * (this.yRange[1] - this.yRange[0])) / 100;
        this.ySelectedRange[1] =
          this.yRange[0] +
          (event.end * (this.yRange[1] - this.yRange[0])) / 100;
      }
    }
  }

  public addFilterOnX(): void {
    this._addFilter(this.xProp, this.xSelectedRange);
    this.xRange = [Infinity, -Infinity];
    this.xSelectedRange = [Infinity, -Infinity];
    this.yRange = [Infinity, -Infinity];
    this.ySelectedRange = [Infinity, -Infinity];
    this._initData(true);
  }

  public addFilterOnY(): void {
    this._addFilter(this.yProp, this.ySelectedRange);
    this.xRange = [Infinity, -Infinity];
    this.xSelectedRange = [Infinity, -Infinity];
    this.yRange = [Infinity, -Infinity];
    this.ySelectedRange = [Infinity, -Infinity];
    this._initData(true);
  }

  public addFilterOnXY(): void {
    this._addFilter(this.xProp, this.xSelectedRange);
    this._addFilter(this.yProp, this.ySelectedRange);
    this.xRange = [Infinity, -Infinity];
    this.xSelectedRange = [Infinity, -Infinity];
    this.yRange = [Infinity, -Infinity];
    this.ySelectedRange = [Infinity, -Infinity];
    this._initData(true);
  }

  public selectXAxis(prop: BaseCatalogProp): void {
    this.xProp = prop;
    this.xRange = [Infinity, -Infinity];
    this.xSelectedRange = [Infinity, -Infinity];
    this._initData();
  }

  public selectYAxis(prop: BaseCatalogProp): void {
    this.yProp = prop;
    this.yRange = [Infinity, -Infinity];
    this.ySelectedRange = [Infinity, -Infinity];
    this._initData();
  }

  public resetAllFilters(): void {
    this.model.filters.clear();
    this.xRange = [Infinity, -Infinity];
    this.xSelectedRange = [Infinity, -Infinity];
    this.yRange = [Infinity, -Infinity];
    this.ySelectedRange = [Infinity, -Infinity];
    this._initData(true);
  }

  private _initData(applyFilter = false): void {
    if (applyFilter) {
      this._catalogService
        .getCatalogService(this.model.selectedCatalog)
        .search$(this.model)
        .subscribe({
          next: () => {
            this.model.objectsFiltered = this.model.objectsImported;
            this._initOptions();
          }
        });
    } else {
      this._initOptions();
    }
  }

  private _initOptions(): void {
    const data: number[][] = [];
    this.model.objectsFiltered.forEach((obj) => {
      const x: number = +obj[this.xProp];
      const y: number = +obj[this.yProp];
      if (x < this.xRange[0]) {
        this.xRange[0] = x;
        this.xSelectedRange[0] = x;
      }
      if (x > this.xRange[1]) {
        this.xRange[1] = x;
        this.xSelectedRange[1] = x;
      }
      if (y < this.yRange[0]) {
        this.yRange[0] = y;
        this.ySelectedRange[0] = y;
      }
      if (y > this.yRange[1]) {
        this.yRange[1] = y;
        this.ySelectedRange[1] = y;
      }
      data.push([x, y]);
    });
    this.options = {
      xAxis: {
        type: 'value',
        min: 'dataMin',
        max: 'dataMax'
      },
      yAxis: {
        type: 'value',
        min: 'dataMin',
        max: 'dataMax'
      },
      symbolSize: 10,
      tooltip: {
        position: 'top'
      },
      dataZoom: [
        {
          id: 'inside-x',
          xAxisIndex: 0,
          type: 'inside'
        },
        {
          id: 'slider-x',
          xAxisIndex: 0,
          type: 'slider'
        },
        {
          id: 'inside-y',
          yAxisIndex: 0,
          type: 'inside'
        },
        {
          id: 'slider-y',
          yAxisIndex: 0,
          type: 'slider'
        }
      ],
      series: [
        {
          type: 'scatter',
          data: data,
          encode: { tooltip: [0, 1] },
          large: true,
          largeThreshold: 20000
        }
      ]
    };
  }

  private _addFilter(prop: BaseCatalogProp, range: number[]): void {
    this.model.filters.set(prop, [range[0], range[1]]);
  }
}
