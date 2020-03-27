import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { environment } from '@env/environment';

@Injectable()
export class CatalogService {

    loader: THREE.FileLoader;
    average: String = '';
    stars: any;

    constructor() {
        this.loader = new THREE.FileLoader();
    }

    initialize(localPath: boolean): Promise<any> {
        const _that = this;
        return new Promise((resolve, reject) => {
            this.loader.load(
                // resource URL
                localPath ? environment.catalogLocalPath : environment.catalogUrl,

                // Function when resource is loaded
                (data: string) => {
                    _that.average = '';
                    _that.stars = _that.csvJSON(data);
                    resolve();
                },

                // Function called when download progresses
                (progress: ProgressEvent) => {
                    _that.average = this.displaySize(progress.loaded);
                },

                // Function called when download errors
                (error: ErrorEvent) => {
                    console.error('An error happened: ' + error);
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

    displaySize(size: number): String {
        return size + '...';
    }

}
