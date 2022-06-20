import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TimelineModel } from './timeline.model';

export interface TimelineFormGroup {
  deltaEpochFc: FormControl<number>;
}
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {
  //
  public readonly DELTA_EPOCH_FC = 'deltaEpochFc';
  @Input() model: TimelineModel;

  private _timelineForm: FormGroup<TimelineFormGroup>;
  private _updateByCursor = false;

  constructor(public translate: TranslateService) {
    // Empty
  }

  ngOnInit(): void {
    // Empty
    this._timelineForm = new FormGroup<TimelineFormGroup>({
      deltaEpochFc: new FormControl<number>(this.model.deltaEpoch)
    });
    this._timelineForm.get(this.DELTA_EPOCH_FC).valueChanges.subscribe({
      next: (value: number) => {
        this._updateByCursor = true;
        this.model.deltaEpoch = +value;
        this.model.displayAnimation = true;
      }
    });
    this.model.deltaEpoch$.subscribe({
      next: (value: number) => {
        if (this._updateByCursor) {
          this.model.displayAnimation = false;
        } else {
          this._timelineForm
            .get(this.DELTA_EPOCH_FC)
            .setValue(value, { emitEvent: false });
        }
      }
    });
  }

  public get timelineForm(): FormGroup<TimelineFormGroup> {
    return this._timelineForm;
  }

  public get currentEpoch(): number {
    return this.model.startEpoch + this.model.deltaEpoch;
  }

  public play(): void {
    this._updateByCursor = false;
    this._togglePlayPause();
  }

  public pause(): void {
    this._updateByCursor = false;
    this._togglePlayPause();
  }

  public faster(): void {
    this.model.deltaSpeedEpoch = this.model.deltaSpeedEpoch * 2;
  }

  public slower(): void {
    this.model.deltaSpeedEpoch = this.model.deltaSpeedEpoch / 2;
  }

  public stop(): void {
    this._updateByCursor = false;
    this.model.deltaEpoch = 0;
    this.model.displayAnimation = false;
  }

  private _togglePlayPause(): void {
    this.model.displayAnimation = !this.model.displayAnimation;
  }
}
