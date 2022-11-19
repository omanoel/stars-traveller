import { Subject } from 'rxjs';
import { Clock, Vector3 } from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

export interface PovControlsModel {
  controls: FirstPersonControls;
  enabled: boolean;
  clock: Clock;
  eventControls: string;
  target$: Subject<Vector3>;
  initialCameraPosition: Vector3;
  initialTargetPosition: Vector3;
}
