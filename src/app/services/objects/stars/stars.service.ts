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
    basicMaterials: any;

    constructor(private catalogService: CatalogService) {
        this.initMaterials();
    }

    initialize() {
        this.groupOfStars = new THREE.Object3D();
        this.groupOfStars.name = 'GroupOfStars';
        this.createPoints();
    }

    addInScene(scene: THREE.Scene): void {
        if (this.starsPoints && !this.loaded) {
            scene.add(this.starsPoints);
            scene.add(this.groupOfStars);
            this.loaded = true;
        }
    }

    updateSpheresInScene(camera: THREE.Camera, target: THREE.Vector3): void {
        if (!this.groupOfStars) {
            return;
        }
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
        const material = new THREE.PointsMaterial( { size: 1, color: 0xFFECDF, sizeAttenuation: false, alphaTest: 1, transparent: false } );
        // material.color.setHSL( 0.33, 0.59, 0.80 );
        this.starsPoints = new THREE.Points( geometry, material );
    }

    private getNearest(camera: THREE.Camera, target: THREE.Vector3): any[] {
        let nears = [];
        for (let i = 0; i < this.nbStars; i++) {
            const record = this.catalogService.stars[i];
            const pos = new THREE.Vector3(record.X, record.Y, record.Z);
            const target2 = new THREE.Vector3(target.x, target.y, target.z)
            const pos2 = new THREE.Vector3(record.X, record.Y, record.Z);
            const angle = target2.sub(camera.position).angleTo(pos2.sub(camera.position));
            if (pos.distanceTo(camera.position) < 20 && angle < Math.PI / 4) {
                nears.push(record);
            }
        }
        return nears;
    }

    private createSpheres(nearest: any[]): void {
        this.stars = [];
        this.groupOfStars.children = [];
        const geometrySphere = new THREE.SphereBufferGeometry( 0.05, 32, 16 );
        
        nearest.forEach((near) => {
            const materialSphere = this.getMaterialFromSpectrum(near);
            const star = new THREE.Mesh(geometrySphere, materialSphere);
            star.translateX(near.X);
            star.translateY(near.Y);
            star.translateZ(near.Z);
            star.userData.hyg = near;
            this.stars.push(star);
            this.groupOfStars.add(star);
        });
    }

    private getMaterialFromSpectrum(near: any): THREE.MeshBasicMaterial {
        let spectrum = 'Z';
        if (near.Spectrum && near.Spectrum.length > 0) {
            const idx0 = near.Spectrum.charAt(0);
            if (this.basicMaterials[idx0]) {
                spectrum = idx0;
            }
        }
        return this.basicMaterials[spectrum];
    }

    private initMaterials(): void {
        this.basicMaterials = {
            Z: new THREE.MeshBasicMaterial( {color: 0xFFFFFF} ),
            O: new THREE.MeshBasicMaterial( {color: 0x93B6FF} ),
            B: new THREE.MeshBasicMaterial( {color: 0xA7C3FF} ),
            A: new THREE.MeshBasicMaterial( {color: 0xD5E0FF} ),
            F: new THREE.MeshBasicMaterial( {color: 0xF9F5FF} ),
            G: new THREE.MeshBasicMaterial( {color: 0xFFECDF} ),
            K: new THREE.MeshBasicMaterial( {color: 0xFFD6AC} ),
            M: new THREE.MeshBasicMaterial( {color: 0xFFAA58} ),
            L: new THREE.MeshBasicMaterial( {color: 0xFF7300} ),
            T: new THREE.MeshBasicMaterial( {color: 0xFF3500} ),
            Y: new THREE.MeshBasicMaterial( {color: 0x999999} )
        };
    }
}
