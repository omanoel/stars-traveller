import { TrackballControls } from 'three-trackballcontrols-ts';
import { Subject } from 'rxjs';

export interface TrackballControlsModel {
    controls: TrackballControls;
    enabled: boolean;
    eventControls: string;
    target$: Subject<THREE.Vector3>;
}