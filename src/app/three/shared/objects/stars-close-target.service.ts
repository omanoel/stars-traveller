import { Injectable } from '@angular/core';
import { MainModel } from '@app/app.model';
import { Vector3 } from 'three';
import { BaseCatalogData } from '../../../shared/catalog/catalog.model';
import { PerspectiveCameraService } from '../perspective-camera/perspective-camera.service';
import { TargetService } from '../target/target.service';

@Injectable({
  providedIn: 'root'
})
export class StarsCloseTargetService {
  //

  //
  constructor(
    private _targetService: TargetService,
    private _perspectiveCameraService: PerspectiveCameraService
  ) {
    // Empty
  }

  public filter(mainModel: MainModel): BaseCatalogData[] {
    const closeToTargetData: BaseCatalogData[] = [];
    const targetPosition = this._targetService.model.axesHelper.position;
    const cameraPosition = this._perspectiveCameraService.camera.position;
    const distanceTargetToCamera = targetPosition.distanceTo(cameraPosition);
    for (let i = 0; i < mainModel.objectsImported.length; i++) {
      const record = mainModel.objectsImported[i];
      const pos = new Vector3(record.x, record.y, record.z);
      if (targetPosition.distanceTo(pos) < distanceTargetToCamera) {
        closeToTargetData.push(record);
      }
    }
    return closeToTargetData;
  }
}
