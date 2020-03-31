import { Subject } from 'rxjs';
import { TrackballControls } from 'three-trackballcontrols-ts';

export interface TrackballControlsModel {
  controls: TrackballControls;
  enabled: boolean;
  eventControls: string;
  target$: Subject<THREE.Vector3>;
}
