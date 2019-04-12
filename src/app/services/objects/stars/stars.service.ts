import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { CatalogService } from './catalog.service';

@Injectable()
export class StarsService {

    catalog = [];

    nbStars: number;
    stars: Array<THREE.Mesh> = [];
    groupOfStars: THREE.Object3D;
    starsPoints: THREE.Points;
    loaded = false;
    lastUpdate: Date;

    constructor(private catalogService: CatalogService) {
        this.lastUpdate = new Date();
    }

    initialize() {
        this.groupOfStars = new THREE.Object3D();
        this.groupOfStars.name = 'GroupOfStars';
        this.catalogService.initialize().then(
            () => this.createPoints()
        );

    }

    addInScene(scene: THREE.Scene): void {
        if (this.starsPoints && !this.loaded) {
            scene.add(this.starsPoints);
            scene.add(this.groupOfStars);
            this.loaded = true;
        }
    }

    updateSpheresInScene(camera: THREE.Camera, target: THREE.Vector3): void {
        const now = new Date();
        if (now.getTime() - this.lastUpdate.getTime() < 5000) {
            return;
        }
        this.lastUpdate = new Date();
        const nearest = this.getNearest(camera, target);
        this.createSpheres(nearest);
    }

    private createPoints(): void {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        this.nbStars = this.catalogService.stars.length;
        let maxX = 0;
        let maxY = 0;
        let maxZ = 0;
        for (let i = 0; i < this.nbStars; i++) {
            const record = this.catalogService.stars[i];
            vertices.push( record.X, record.Y, record.Z );
            if (maxX < record.X) { maxX = record.X; }
            if (maxY < record.Y) { maxY = record.Y; }
            if (maxZ < record.Z) { maxZ = record.Z; }
        }
        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        const material = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false, alphaTest: 1, transparent: false } );
        material.color.setHSL( 0.33, 0.59, 0.80 );
        this.starsPoints = new THREE.Points( geometry, material );
    }

    private getNearest(camera: THREE.Camera, target: THREE.Vector3): any[] {
        let z = [];
        for (let i = 0; i < this.nbStars; i++) {
            const record = this.catalogService.stars[i];
            const pos = new THREE.Vector3(record.X, record.Y, record.Z);
            const target2 = new THREE.Vector3(target.x, target.y, target.z)
            const pos2 = new THREE.Vector3(record.X, record.Y, record.Z);
            const angle = target2.sub(camera.position).angleTo(pos2.sub(camera.position));
            if (pos.distanceTo(camera.position) < 20 && angle < Math.PI / 4) {
                z.push(record);
            }
        }
        return z;
    }

    private createSpheres(nearest: any[]): void {
        this.stars = [];
        this.groupOfStars.children = [];
        const geometrySphere = new THREE.SphereBufferGeometry( 0.05, 32, 32 );
        const materialSphere = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        
        nearest.forEach((near) => {
            const star = new THREE.Mesh(geometrySphere, materialSphere);
            star.translateX(near.X);
            star.translateY(near.Y);
            star.translateZ(near.Z);
            star.userData.hyg = near;
            this.stars.push(star);
            this.groupOfStars.add(star);
        });
    }
}
