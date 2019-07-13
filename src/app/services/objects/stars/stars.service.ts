import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { CatalogService } from './catalog.service';

@Injectable()
export class StarsService {

    catalog = [];

    nbStars: number;
    stars: Array<THREE.Mesh> = [];
    groupOfStars: THREE.Object3D;
    groupOfStarsHelpers: THREE.Object3D;
    groupOfStarsGlow: THREE.Object3D;
    starsPoints: THREE.Points;
    loaded = false;
    colors: any = {};
    basicMaterials: any = {};
    shaderMaterials: any = {};

    constructor(private catalogService: CatalogService) {
        this.initMaterials();
    }

    initialize() {
        this.groupOfStars = new THREE.Object3D();
        this.groupOfStars = new THREE.Object3D();
        this.groupOfStarsHelpers = new THREE.Object3D();
        this.groupOfStarsGlow = new THREE.Object3D();
        this.groupOfStarsGlow.name = 'GroupOfStars';
        this.createPoints();
    }

    addInScene(scene: THREE.Scene): void {
        if (this.starsPoints && !this.loaded) {
            scene.add(this.starsPoints);
            scene.add(this.groupOfStarsGlow);
            scene.add(this.groupOfStarsHelpers);
            scene.add(this.groupOfStars);
            this.loaded = true;
        }
    }

    updateSpheresInScene(camera: THREE.PerspectiveCamera, target: THREE.Vector3): void {
        if (!this.groupOfStars) {
            return;
        }
        this.updateShaderMaterials(camera, target);
        const nearest = this.getNearest(camera, target);
        this.createSpheres(nearest);
    }

    getPositionFromId(id: number): THREE.Vector3 {
        let goodRecord =  this.catalogService.stars.find((record) => record.id === +id);
        if (goodRecord) {
            return new THREE.Vector3(goodRecord.x, goodRecord.y, goodRecord.z);
        } else {
            return null;
        }
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
            vertices.push( record.x, record.y, record.z );
            if (maxX < record.x) { maxX = record.x; }
            if (maxY < record.y) { maxY = record.y; }
            if (maxZ < record.z) { maxZ = record.z; }
        }
        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        const material = new THREE.PointsMaterial( { size: 1, color: 0xFFECDF, sizeAttenuation: false, alphaTest: 1, transparent: false } );
        // material.color.setHSL( 0.33, 0.59, 0.80 );
        this.starsPoints = new THREE.Points( geometry, material );
    }

    private getNearest(camera: THREE.PerspectiveCamera, target: THREE.Vector3): any[] {
        let nears = [];
        for (let i = 0; i < this.nbStars; i++) {
            const record = this.catalogService.stars[i];
            const pos = new THREE.Vector3(record.x, record.y, record.z);
            const target2 = new THREE.Vector3(target.x, target.y, target.z)
            const pos2 = new THREE.Vector3(record.x, record.y, record.z);
            const angle = target2.sub(camera.position).angleTo(pos2.sub(camera.position));
            if (pos.distanceTo(camera.position) < 20 && angle <= camera.fov * Math.PI / 180) {
                nears.push(record);
            }
        }
        return nears;
    }

    private createSpheres(nearest: any[]): void {
        this.stars = [];
        this.groupOfStars.children = [];
        this.groupOfStarsHelpers.children = [];
        this.groupOfStarsGlow.children = [];
        const geometrySphere = new THREE.SphereBufferGeometry( 0.01, 32, 16 );
        const materialHelper = new THREE.LineBasicMaterial({ color: 0xfffff, transparent: true, opacity: 0.2 });
        const geometrySphereGlow = new THREE.SphereGeometry( 0.02, 32, 16 );
        
        nearest.forEach((near) => {
            const materialSphere = this.getMaterialFromSpectrum(near);
            const star = new THREE.Mesh(geometrySphere, materialSphere);
            star.translateX(near.x);
            star.translateY(near.y);
            star.translateZ(near.z);
            star.userData.hyg = near;
            this.stars.push(star);
            // this.groupOfStars.add(star);
            this.createStarHelper(new THREE.Vector3(near.x, near.y, near.z), materialHelper);
            
            const materialSphereGlow = this.getShaderMaterialFromSpectrum(near);
            const starGlow = new THREE.Mesh( geometrySphereGlow, materialSphereGlow );        
            starGlow.translateX(near.x);
            starGlow.translateY(near.y);
            starGlow.translateZ(near.z);
            starGlow.userData.hyg = near;
            this.groupOfStarsGlow.add(starGlow);
        });
    }

    private createStarHelper(myPosition: THREE.Vector3, material: THREE.Material) {
        const geometryZ = new THREE.Geometry();
        geometryZ.vertices.push(
            new THREE.Vector3( myPosition.x, myPosition.y, myPosition.z ),
            new THREE.Vector3( myPosition.x, myPosition.y, 0 )
        );
        this.groupOfStarsHelpers.add(new THREE.Line( geometryZ, material ));
    }

    private getSpectrum(near: any): string {
        let spectrum = 'Z';
        if (near.spect && near.spect.length > 0) {
            const idx0 = near.spect.charAt(0);
            if (this.basicMaterials[idx0]) {
                spectrum = idx0;
            }
        }
        return spectrum;
    }

    private getMaterialFromSpectrum(near: any): THREE.MeshBasicMaterial {
        return this.basicMaterials[this.getSpectrum(near)];
    }

    private getShaderMaterialFromSpectrum(near: any): THREE.ShaderMaterial {
        return this.shaderMaterials[this.getSpectrum(near)];
    }

    private initMaterials(): void {
        this.colors = {
            Z: 0xFFFFFF,
            O: 0x93B6FF,
            B: 0xA7C3FF,
            A: 0xD5E0FF,
            F: 0xF9F5FF,
            G: 0xFFECDF,
            K: 0xFFD6AC,
            M: 0xFFAA58,
            L: 0xFF7300,
            T: 0xFF3500,
            Y: 0x999999
        };
        Object.keys(this.colors).forEach((key: string) => {
            this.basicMaterials[key] = new THREE.MeshBasicMaterial( {color: this.colors[key]} );
        });
    }

    private updateShaderMaterials(camera: THREE.PerspectiveCamera, target: THREE.Vector3): void {
        Object.keys(this.colors).forEach((key: string) => {
            this.shaderMaterials[key] = this.createShaderMaterialWithColor(this.colors[key], camera, target);
        }); 
    }

    private createShaderMaterialWithColor(color: any, camera: THREE.PerspectiveCamera, target: THREE.Vector3): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial( 
            {
                uniforms: { 
                    "c":   { type: "f", value: 0.1 },
                    "p":   { type: "f", value: 3.0 },
                    glowColor: { type: "c", value: new THREE.Color(color) },
                    viewVector: { type: "v3", value: target.clone().sub(camera.position) }
                },
                vertexShader:   document.getElementById('vertexShader').textContent,
                fragmentShader: document.getElementById('fragmentShader').textContent,
                side: THREE.DoubleSide,
                blending: THREE.NoBlending,
                transparent: true
            }  
        );
    }
    
}
