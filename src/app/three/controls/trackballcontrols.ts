import { PerspectiveCamera, Vector3, Vector2, Quaternion } from 'three';

export class TrackballControls {

    // public properties

    public domElement: HTMLElement;
    public object: PerspectiveCamera;
    public enabled = true;

    public STATE: any = { NONE: -1, ROTATE: 2, ZOOM: 1, PAN: 0, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };
    public screen: any = { left: 0, top: 0, width: 0, height: 0 };

    public rotateSpeed = 1.0;
    public zoomSpeed = 1.2;
    public panSpeed = 0.8;

    public noRotate = false;
    public noZoom = false;
    public noPan = false;

    public staticMoving = false;
    public dynamicDampingFactor = 0.2;

    public minDistance = 0;
    public maxDistance = Infinity;

    public keys: Array<number> = [65 /*A*/, 83 /*S*/, 68 /*D*/];

    public target: Vector3 = new Vector3();

    public EPS = 0.000001;

    public lastPosition: Vector3 = new Vector3();

    public state: number = this.STATE.NONE;

    public target0: any;
    public position0: any;
    public up0: any;

    public changeEvent: Event = new Event('change');
    public startEvent: Event = new Event('start');
    public endEvent: Event = new Event('end');

    // private properties

    private _prevState: number = this.STATE.NONE;

    private _eye: Vector3 = new Vector3();

    private _movePrev: Vector2 = new Vector2();
    private _moveCurr: Vector2 = new Vector2();

    private _lastAxis: Vector3 = new Vector3();
    private _lastAngle = 0;

    private _zoomStart: Vector2 = new Vector2();
    private _zoomEnd: Vector2 = new Vector2();

    private _touchZoomDistanceStart = 0;
    private _touchZoomDistanceEnd = 0;

    private _panStart: Vector2 = new Vector2();
    private _panEnd: Vector2 = new Vector2();

    /**
     * init
     */
    public init = (object: PerspectiveCamera, domElement: HTMLElement) => {
        this.object = object;
        this.domElement = domElement;
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.up0 = this.object.up.clone();

        this.domElement.addEventListener('contextmenu', this.contextmenu, false);
        this.domElement.addEventListener('mousedown', this.mousedown, false);
        this.domElement.addEventListener('mousewheel', this.mousewheel, false);
        this.domElement.addEventListener('MozMousePixelScroll', this.mousewheel, false);

        this.domElement.addEventListener('touchstart', this.touchstart, false);
        this.domElement.addEventListener('touchend', this.touchend, false);
        this.domElement.addEventListener('touchmove', this.touchmove, false);

        window.addEventListener('keydown', this.keydown, false);
        window.addEventListener('keyup', this.keyup, false);

        this.handleResize();
        this.update();
    }

    public handleResize = () => {
        const box = this.domElement.getBoundingClientRect();
        const d = this.domElement.ownerDocument.documentElement;
        this.screen.left = box.left + window.pageXOffset - d.clientLeft;
        this.screen.top = box.top + window.pageYOffset - d.clientTop;
        this.screen.width = box.width;
        this.screen.height = box.height;
    }

    public handleEvent = (event) => {
        if (typeof this[event.type] === 'function') {
            this[event.type](event);
        }
    }

    public getMouseOnScreen: any = (pageX, pageY) => {
        const vector = new Vector2();
        return vector.set(
            (pageX - this.screen.left) / this.screen.width,
            (pageY - this.screen.top) / this.screen.height
        );
    }

    public getMouseOnCircle: any = (pageX, pageY) => {
        const vector = new Vector2();
        return vector.set(
            ((pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5)),
            ((this.screen.height + 2 * (this.screen.top - pageY)) / this.screen.width)
        );
    }

    public rotateCamera = () => {
        const axis: Vector3 = new Vector3();
        const quaternion: Quaternion = new Quaternion();
        const eyeDirection: Vector3 = new Vector3();
        const objectUpDirection: Vector3 = new Vector3();
        const objectSidewaysDirection: Vector3 = new Vector3();
        const moveDirection: Vector3 = new Vector3();
        let angle: number;

        moveDirection.set(this._moveCurr.x - this._movePrev.x, this._moveCurr.y - this._movePrev.y, 0);
        angle = moveDirection.length();

        if (angle) {
            this._eye.copy(this.object.position).sub(this.target);

            eyeDirection.copy(this._eye).normalize();
            objectUpDirection.copy(this.object.up).normalize();
            objectSidewaysDirection.crossVectors(objectUpDirection, eyeDirection).normalize();

            objectUpDirection.setLength(this._moveCurr.y - this._movePrev.y);
            objectSidewaysDirection.setLength(this._moveCurr.x - this._movePrev.x);

            moveDirection.copy(objectUpDirection.add(objectSidewaysDirection));

            axis.crossVectors(moveDirection, this._eye).normalize();

            angle *= this.rotateSpeed;
            quaternion.setFromAxisAngle(axis, angle);

            this._eye.applyQuaternion(quaternion);
            this.object.up.applyQuaternion(quaternion);

            this._lastAxis.copy(axis);
            this._lastAngle = angle;
        } else if (!this.staticMoving && this._lastAngle) {
            this._lastAngle *= Math.sqrt(1.0 - this.dynamicDampingFactor);
            this._eye.copy(this.object.position).sub(this.target);
            quaternion.setFromAxisAngle(this._lastAxis, this._lastAngle);
            this._eye.applyQuaternion(quaternion);
            this.object.up.applyQuaternion(quaternion);

        }
        this._movePrev.copy(this._moveCurr);

    }

    public zoomCamera = () => {
        let factor = 0;
        if (this.state === this.STATE.TOUCH_ZOOM_PAN) {
            factor = this._touchZoomDistanceStart / this._touchZoomDistanceEnd;
            this._touchZoomDistanceStart = this._touchZoomDistanceEnd;
            this._eye.multiplyScalar(factor);
        } else {
            const distance = this.getDistance(this.object.position.x, this.object.position.y, this.object.position.z);
            factor = (this._zoomEnd.y - this._zoomStart.y) * this.zoomSpeed / Math.log(distance);
            factor = 1 / (1.0 + factor);
            //factor = factor / this.getDistance(this.object.position.x, this.object.position.y, this.object.position.z);
            //console.log(factor);
            //factor = Math.abs(this._zoomEnd.y - this._zoomStart.y);
            const delta = Math.abs(1 - factor);
            if (factor !== 1.0 && delta > this.EPS) {
                this._eye.multiplyScalar(factor);
                if (this.staticMoving) {
                    this._zoomStart.copy(this._zoomEnd);
                } else {
                    this._zoomStart.y += (this._zoomEnd.y - this._zoomStart.y) * this.dynamicDampingFactor;
                }
            }
        }
    }

    public panCamera = () => {
        const mouseChange: Vector2 = new Vector2();
        const objectUp: Vector3 = new Vector3();
        const pan: Vector3 = new Vector3();

        mouseChange.copy(this._panEnd).sub(this._panStart);

        if (mouseChange.lengthSq()) {

            mouseChange.multiplyScalar(this._eye.length() * this.panSpeed);

            pan.copy(this._eye).cross(this.object.up).setLength(mouseChange.x);
            pan.add(objectUp.copy(this.object.up).setLength(mouseChange.y));

            this.object.position.add(pan);
            this.target.add(pan);

            if (this.staticMoving) {
                this._panStart.copy(this._panEnd);
            } else {
                this._panStart.add(mouseChange.subVectors(this._panEnd, this._panStart).multiplyScalar(this.dynamicDampingFactor));
            }
        }
    }

    public checkDistances = () => {
        if (!this.noZoom || !this.noPan) {
            if (this._eye.lengthSq() > this.maxDistance * this.maxDistance) {
                this.object.position.addVectors(this.target, this._eye.setLength(this.maxDistance));
                this._zoomStart.copy(this._zoomEnd);
            }
            if (this._eye.lengthSq() < this.minDistance * this.minDistance) {
                this.object.position.addVectors(this.target, this._eye.setLength(this.minDistance));
                this._zoomStart.copy(this._zoomEnd);
            }
        }
    }

    public update = () => {
        this._eye.subVectors(this.object.position, this.target);
        if (!this.noRotate) {
            this.rotateCamera();
        }
        if (!this.noZoom) {
            this.zoomCamera();
        }
        if (!this.noPan) {
            this.panCamera();
        }
        this.object.position.addVectors(this.target, this._eye);
        this.checkDistances();
        this.object.lookAt(this.target);
        if (this.lastPosition.distanceToSquared(this.object.position) > this.EPS) {
            dispatchEvent(this.changeEvent);
            this.lastPosition.copy(this.object.position);
        }
    }

    public reset = () => {
        this.state = this.STATE.NONE;
        this._prevState = this.STATE.NONE;
        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.up.copy(this.up0);
        this._eye.subVectors(this.object.position, this.target);
        this.object.lookAt(this.target);
        dispatchEvent(this.changeEvent);
        this.lastPosition.copy(this.object.position);
    }

    public keydown = (event: KeyboardEvent) => {
        if (this.enabled === false) { return; }
        window.removeEventListener('keydown', this.keydown);
        this._prevState = this.state;
        if (this.state !== this.STATE.NONE) {
            return;
        } else if (event.keyCode === this.keys[this.STATE.ROTATE] && !this.noRotate) {
            this.state = this.STATE.ROTATE;
        } else if (event.keyCode === this.keys[this.STATE.ZOOM] && !this.noZoom) {
            this.state = this.STATE.ZOOM;
        } else if (event.keyCode === this.keys[this.STATE.PAN] && !this.noPan) {
            this.state = this.STATE.PAN;
        }
    }

    public keyup = (event: KeyboardEvent) => {
        if (this.enabled === false) { return; }
        this.state = this._prevState;
        window.addEventListener('keydown', this.keydown, false);
    }

    public mousedown = (event: MouseEvent) => {
        if (this.enabled === false) { return; }
        event.preventDefault();
        event.stopPropagation();
        if (this.state === this.STATE.NONE) {
            this.state = event.button;
        }

        if (this.state === this.STATE.ROTATE && !this.noRotate) {
            this._moveCurr.copy(this.getMouseOnCircle(event.pageX, event.pageY));
            this._movePrev.copy(this._moveCurr);
        } else if (this.state === this.STATE.ZOOM && !this.noZoom) {
            this._zoomStart.copy(this.getMouseOnScreen(event.pageX, event.pageY));
            this._zoomEnd.copy(this._zoomStart);
        } else if (this.state === this.STATE.PAN && !this.noPan) {
            this._panStart.copy(this.getMouseOnScreen(event.pageX, event.pageY));
            this._panEnd.copy(this._panStart);
        }
        document.addEventListener('mousemove', this.mousemove, false);
        document.addEventListener('mouseup', this.mouseup, false);
        dispatchEvent(this.startEvent);
    }

    public mousemove = (event: MouseEvent) => {
        if (this.enabled === false) { return; }
        event.preventDefault();
        event.stopPropagation();
        if (this.state === this.STATE.ROTATE && !this.noRotate) {
            this._movePrev.copy(this._moveCurr);
            this._moveCurr.copy(this.getMouseOnCircle(event.pageX, event.pageY));
        } else if (this.state === this.STATE.ZOOM && !this.noZoom) {
            this._zoomEnd.copy(this.getMouseOnScreen(event.pageX, event.pageY));
        } else if (this.state === this.STATE.PAN && !this.noPan) {
            this._panEnd.copy(this.getMouseOnScreen(event.pageX, event.pageY));
        }
    }

    public mouseup = (event: MouseEvent) => {
        if (this.enabled === false) { return; }
        event.preventDefault();
        event.stopPropagation();
        this.state = this.STATE.NONE;
        document.removeEventListener('mousemove', this.mousemove);
        document.removeEventListener('mouseup', this.mouseup);
        dispatchEvent(this.endEvent);
    }

    public mousewheel = (event: WheelEvent) => {
        if (this.enabled === false) { return; }
        event.preventDefault();
        event.stopPropagation();
        let delta = 0;
        if (event.deltaY) {
            delta = event.deltaY / 10;
        } else if (event.detail) {
            delta = -event.detail / 3;
        }
        this._zoomStart.y += delta * 0.01;
        dispatchEvent(this.startEvent);
        dispatchEvent(this.endEvent);
    };

    public touchstart = (event: TouchEvent) => {
        if (this.enabled === false) { return; }
        switch (event.touches.length) {
            case 1:
                this.state = this.STATE.TOUCH_ROTATE;
                this._moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
                this._movePrev.copy(this._moveCurr);
                break;
            default: // 2 or more
                this.state = this.STATE.TOUCH_ZOOM_PAN;
                const dx = event.touches[0].pageX - event.touches[1].pageX;
                const dy = event.touches[0].pageY - event.touches[1].pageY;
                this._touchZoomDistanceEnd = this._touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
                const x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                const y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                this._panStart.copy(this.getMouseOnScreen(x, y));
                this._panEnd.copy(this._panStart);
                break;
        }
        dispatchEvent(this.startEvent);
    };

    public touchmove = (event: TouchEvent) => {
        if (this.enabled === false) { return; }
        event.preventDefault();
        event.stopPropagation();

        switch (event.touches.length) {
            case 1:
                this._movePrev.copy(this._moveCurr);
                this._moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
                break;

            default: // 2 or more
                const dx = event.touches[0].pageX - event.touches[1].pageX;
                const dy = event.touches[0].pageY - event.touches[1].pageY;
                this._touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
                const x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                const y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                this._panEnd.copy(this.getMouseOnScreen(x, y));
                break;
        }
    }

    public touchend = (event: TouchEvent) => {
        if (this.enabled === false) { return; }
        switch (event.touches.length) {
            case 0:
                this.state = this.STATE.NONE;
                break;

            case 1:
                this.state = this.STATE.TOUCH_ROTATE;
                this._moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
                this._movePrev.copy(this._moveCurr);
                break;
        }
        dispatchEvent(this.endEvent);
    }

    private dispose() {
        this.domElement.removeEventListener('contextmenu', this.contextmenu, false);
        this.domElement.removeEventListener('mousedown', this.mousedown, false);
        this.domElement.removeEventListener('mousewheel', this.mousewheel, false);
        this.domElement.removeEventListener('MozMousePixelScroll', this.mousewheel, false); // firefox

        this.domElement.removeEventListener('touchstart', this.touchstart, false);
        this.domElement.removeEventListener('touchend', this.touchend, false);
        this.domElement.removeEventListener('touchmove', this.touchmove, false);

        document.removeEventListener('mousemove', this.mousemove, false);
        document.removeEventListener('mouseup', this.mouseup, false);

        window.removeEventListener('keydown', this.keydown, false);
        window.removeEventListener('keyup', this.keyup, false);
    }

    private getDistance(deltaX: number, deltaY: number, deltaZ: number): number {
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    }

    public contextmenu = (event: MouseEvent) => {
        event.preventDefault();
    }

}
