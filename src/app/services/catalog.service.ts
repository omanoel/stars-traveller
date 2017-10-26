import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class CatalogService {

    loader = new THREE.FileLoader();

    stars: any;

    constructor() {

    }

    initialize(): Promise<any> {
        const _that = this;
        return new Promise((resolve, reject) => {
            this.loader.load(
                // resource URL
                '/assets/hygxyz.csv',

                // Function when resource is loaded
                function (data) {

                    _that.stars = _that.csvJSON(data);
                    resolve();
                },

                // Function called when download progresses
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
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
