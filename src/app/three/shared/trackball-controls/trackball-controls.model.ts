import { Subject } from 'rxjs';
import { Vector3 } from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

export interface TrackballControlsModel {
  controls: TrackballControls;
  enabled: boolean;
  eventControls: string;
  target$: Subject<Vector3>;
}
