import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { environment } from '@env/environment';

@Injectable()
export class CatalogService {

    loader: THREE.FileLoader;
    average: number = 0;
    stars: any;

    constructor() {
        this.loader = new THREE.FileLoader();
    }

    initialize(): Promise<any> {
        const _that = this;
        return new Promise((resolve, reject) => {
            this.loader.load(
                // resource URL
                environment.catalogUrl,

                // Function when resource is loaded
                function (data) {

                    _that.stars = _that.csvJSON(data);
                    resolve();
                },

                // Function called when download progresses
                function (xhr) {
                    _that.average = Math.round(xhr.loaded / xhr.total * 10000) / 100;
                },

                // Function called when download errors
                function (xhr) {
                    console.error('An error happened');
                    reject();
                }
            );
        });
    }

    csvJSON(csv): any {

        const lines = csv.split('\n');
        const result = [];
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentline = lines[i].split(',');
            if (currentline.length > 1) {
                for (let j = 0; j < headers.length; j++) {
                    const value = currentline[j];
                    let valueTransform;
                    valueTransform = parseFloat(value);
                    if (isNaN(valueTransform)) {
                        valueTransform = value;
                    }
                    obj[headers[j]] = valueTransform;
                }
                result.push(obj);
            }
        }
        return result;
    }

}
