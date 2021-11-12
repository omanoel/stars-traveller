import { Subject } from 'rxjs';

export interface TimelineModel {
  startEpoch: number;
  deltaEpoch: number;
  deltaSpeedEpoch: number;
  deltaEpoch$: Subject<number>;
  displayAnimation: boolean;
}
