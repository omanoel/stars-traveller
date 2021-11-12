import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MainModel } from '@app/app.model';
import { TranslateService } from '@ngx-translate/core';
import { TimelineModel } from './timeline.model';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {
  //
  public readonly DELTA_EPOCH_FC = 'deltaEpochFc';
  private _timelineForm: FormGroup;
  //
  @Input() model: TimelineModel;

  constructor(public translate: TranslateService) {
    // Empty
  }

  ngOnInit(): void {
    // Empty
    this._timelineForm = new FormGroup({});
    this._timelineForm.addControl(
      this.DELTA_EPOCH_FC,
      new FormControl(this.model.deltaEpoch)
    );
    this._timelineForm
      .get(this.DELTA_EPOCH_FC)
      .valueChanges.subscribe((value: number) => {
        this.model.deltaEpoch = +value;
      });
    this.model.deltaEpoch$.subscribe((value: number) => {
      this._timelineForm
        .get(this.DELTA_EPOCH_FC)
        .setValue(value, { emitEvent: false });
    });
  }

  public get timelineForm(): FormGroup {
    return this._timelineForm;
  }

  public get currentEpoch(): number {
    return this.model.startEpoch + this.model.deltaEpoch;
  }

  public play(): void {
    this._togglePlayPause();
  }

  public pause(): void {
    this._togglePlayPause();
  }

  public faster(): void {
    this.model.deltaSpeedEpoch = this.model.deltaSpeedEpoch * 2;
  }

  public slower(): void {
    this.model.deltaSpeedEpoch = this.model.deltaSpeedEpoch / 2;
  }

  public stop(): void {
    this.model.deltaEpoch = 0;
    this.model.displayAnimation = false;
  }

  private _togglePlayPause(): void {
    this.model.displayAnimation = !this.model.displayAnimation;
  }
}
