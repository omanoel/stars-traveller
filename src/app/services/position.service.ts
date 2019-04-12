import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class PositionService {

    ELLIPSIS_NAME = 'ellipsisName';
    starPosition: THREE.Object3D = new THREE.Object3D();
    targetPosition: THREE.Object3D = new THREE.Object3D();
    color = 0xff0000;

    /**
     * @method create
     * @param myScene
     * @param myPosition
     * @param myObjectName
     * @public
     */
    create(myScene: THREE.Scene, myPosition: THREE.Vector3, myObjectName: string): void {
        if (myObjectName === 'star') {
            this._createFor(this.starPosition, myScene, myPosition);
        } else if (myObjectName === 'target') {
            this._createFor(this.targetPosition, myScene, myPosition);
        }
    }

    /**
     * @method hide
     * @param myObjectName
     * @public
     */
    hide(myObjectName: string): void {
        if (myObjectName === 'star') {
            this._updateVisibleFor(this.starPosition, false);
        } else if (myObjectName === 'target') {
            this._updateVisibleFor(this.targetPosition, false);
        }
    }

    /**
     * @method show
     * @param myObjectName
     * @public
     */
    show(myObjectName: string): void {
        if (myObjectName === 'star') {
            this._updateVisibleFor(this.starPosition, true);
        } else if (myObjectName === 'target') {
            this._updateVisibleFor(this.targetPosition, true);
        }
    }

    /**
     * @method updPosition
     * @param myPosition
     * @param myObjectName
     * @public
     */
    update(myPosition: THREE.Vector3, myObjectName: string) {
        if (myObjectName === 'star') {
            this._updateFor(this.starPosition, myPosition);
        } else if (myObjectName === 'target') {
            this._updateFor(this.targetPosition, myPosition);
        }
    }

    /**
     * @method _createFor
     * @param myObject
     * @param myScene
     * @param myPosition
     * @private
     */
    private _createFor(myObject: THREE.Object3D, myScene: THREE.Scene, myPosition: THREE.Vector3): void {

        const material = new THREE.LineBasicMaterial({ color: this.color, transparent: true, opacity: 0.5 });

        // Z axis
        const geometryZ = new THREE.Geometry();
        geometryZ.vertices.push(
            new THREE.Vector3(myPosition.x, myPosition.y, myPosition.z),
            new THREE.Vector3(myPosition.x, myPosition.y, 0)
        );
        const lineZ = new THREE.Line(geometryZ, material);
        myObject.add(lineZ);

        //  ellipsis
        const radiusXY = Math.sqrt(myPosition.x * myPosition.x + myPosition.y * myPosition.y);
        if (radiusXY > 0) {
            const curveXY = new THREE.EllipseCurve(
                0, 0,            // ax, aY
                radiusXY, radiusXY,  // xRadius, yRadius
                0, 2 * Math.PI,  // aStartAngle, aEndAngle
                false,            // aClockwise
                0                 // aRotation
            );
            const pathXY = new THREE.Path(curveXY.getPoints(50));
            const geometryXY = pathXY.createPointsGeometry(50);
            const ellipseXY = new THREE.Line(geometryXY, material);
            ellipseXY.name = this.ELLIPSIS_NAME;
            ellipseXY.userData.radius = radiusXY;
            myObject.add(ellipseXY);
        }
        // add composite object (XYellipsis + Zaxis) to scene
        myScene.add(myObject);
    }

    /**
     * @method _updateVisibleFor
     * @param myObject
     * @param myVisibility
     * @private
     */
    private _updateVisibleFor(myObject: THREE.Object3D, myVisibility: boolean): void {
        myObject.visible = myVisibility;
    }

    /**
     * @method _updateFor
     * @param myObject
     * @param myPosition
     * @private
     */
    private _updateFor(myObject: THREE.Object3D, myPosition: THREE.Vector3): void {
        const _objAxis = this._findAxis(myObject);
        const _newDistance = Math.sqrt(myPosition.x * myPosition.x + myPosition.y * myPosition.y);
        const _objEllipsis = this._findEllipsis(myObject);
        const material = new THREE.LineBasicMaterial({ color: this.color, transparent: true, opacity: 0.5 });
        if (_newDistance > 0) {
            if (!_objEllipsis) {
                const curveXY = new THREE.EllipseCurve(
                    0, 0,            // ax, aY
                    _newDistance, _newDistance,  // xRadius, yRadius
                    0, 2 * Math.PI,  // aStartAngle, aEndAngle
                    false,            // aClockwise
                    0                 // aRotation
                );
                const pathXY = new THREE.Path(curveXY.getPoints(50));
                const geometryXY = pathXY.createPointsGeometry(50);
                const ellipseXY = new THREE.Line(geometryXY, material);
                ellipseXY.name = this.ELLIPSIS_NAME;
                ellipseXY.userData.radius = _newDistance;
                myObject.add(ellipseXY);
            } else {
                const _oldDistance = _objEllipsis.userData.radius;
                if (Math.abs(_newDistance - _oldDistance) > 0.01) {
                    const _scaleT = _newDistance / _oldDistance;
                    _objEllipsis.scale.x = _scaleT;
                    _objEllipsis.scale.y = _scaleT;
                }
            }
        }
        _objAxis.geometry.vertices[0].x = myPosition.x;
        _objAxis.geometry.vertices[0].y = myPosition.y;
        _objAxis.geometry.vertices[0].z = 0;
        _objAxis.geometry.vertices[1].x = myPosition.x;
        _objAxis.geometry.vertices[1].y = myPosition.y;
        _objAxis.geometry.vertices[1].z = myPosition.z;
        _objAxis.geometry.verticesNeedUpdate = true;

    }

    /**
     * @method _findEllipsis
     * @param {THREE.Object3D} myObject
     * @returns {any}
     * @private
     */
    private _findEllipsis(myObject: THREE.Object3D): any {
        let _ellipsis = null;
        for (const obj of myObject.children) {
            if (obj.name === this.ELLIPSIS_NAME) {
                _ellipsis = obj;
            }
        }
        return _ellipsis;
    }

    /**
     * @method _findAxis
     * @param {THREE.Object3D} myObject
     * @returns {any}
     * @private
     */
    private _findAxis(myObject: THREE.Object3D): any {
        let _axis = null;
        for (const obj of myObject.children) {
            if (obj.name !== this.ELLIPSIS_NAME) {
                _axis = obj;
            }
        }
        return _axis;
    }

}
