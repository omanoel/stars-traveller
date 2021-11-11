import { Injectable } from '@angular/core';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  ShaderMaterial,
  TextureLoader
} from 'three';
import { BaseCatalogData } from '../../../shared/catalog/catalog.model';
import { Collection3d } from './objects.model';
import { ShadersConstant } from './shaders.constant';

@Injectable({
  providedIn: 'root'
})
export class StarsAsPointsService {
  //
  private static readonly LIGHT_POINTS = 'LIGHT_POINTS';
  private static readonly GLOW_POINTS = 'GLOW_POINTS';

  //
  constructor(private _shadersConstant: ShadersConstant) {
    // Empty
  }

  // ========================================================================
  // Create objects as points (light and glow)
  // ========================================================================
  public createOrUpdate(
    model: Collection3d,
    objectsImported: BaseCatalogData[]
  ): void {
    const vertices = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < objectsImported.length; i++) {
      const record = objectsImported[i];
      vertices.push(record.x, record.y, record.z);
      const color = new Color(model.colors[this._getSpectrum(model, record)]);
      colors.push(color.r, color.g, color.b);
      sizes.push(1);
    }

    // Light points
    const geometryLight = new BufferGeometry();
    geometryLight.setAttribute(
      'position',
      new Float32BufferAttribute(vertices, 3)
    );
    const materialLight = new PointsMaterial({
      size: 1,
      color: 0xffecdf,
      sizeAttenuation: false,
      alphaTest: 1,
      transparent: false
    });
    let lightPoints = model.groupOfObjectsPoints.children.find(
      (obj) => obj.name === StarsAsPointsService.LIGHT_POINTS
    );
    if (!lightPoints) {
      lightPoints = new Points(geometryLight, materialLight);
      lightPoints.name = StarsAsPointsService.LIGHT_POINTS;
      model.groupOfObjectsPoints.add(lightPoints);
    } else {
      (<any>lightPoints).geometry.attributes['position'].needsUpdate = true;
      (<any>lightPoints).geometry.attributes['position'] =
        new Float32BufferAttribute(vertices, 3);
    }

    // Glow points (for stars catalog only)
    const geometryGlow = new BufferGeometry();
    geometryGlow.setAttribute(
      'position',
      new Float32BufferAttribute(vertices, 3)
    );
    geometryGlow.attributes['position'].needsUpdate = true;
    geometryGlow.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometryGlow.attributes['color'].needsUpdate = true;
    geometryGlow.setAttribute('size', new Float32BufferAttribute(sizes, 1));
    geometryGlow.attributes['size'].needsUpdate = true;
    const materialGlow = this._getShaderMaterialForPoint();

    let glowPoints = model.groupOfObjectsPoints.children.find(
      (obj) => obj.name === StarsAsPointsService.GLOW_POINTS
    );
    if (!glowPoints) {
      glowPoints = new Points(geometryGlow, materialGlow);
      glowPoints.name = StarsAsPointsService.GLOW_POINTS;
      model.groupOfObjectsPoints.add(glowPoints);
    } else {
      (<any>glowPoints).geometry.attributes['position'] =
        new Float32BufferAttribute(vertices, 3);
      (<any>glowPoints).geometry.attributes['position'].needsUpdate = true;
      (<any>glowPoints).geometry.attributes['color'] =
        new Float32BufferAttribute(colors, 3);
      (<any>glowPoints).geometry.attributes['color'].needsUpdate = true;
      (<any>glowPoints).geometry.attributes['size'] =
        new Float32BufferAttribute(sizes, 1);
      (<any>glowPoints).geometry.attributes['size'].needsUpdate = true;
    }
  }

  private _getSpectrum(model: Collection3d, near: BaseCatalogData): string {
    let spectrum = 'Z';
    if (near.spect && near.spect.length > 0) {
      const idx0 = near.spect.charAt(0);
      if (model.basicMaterials[idx0]) {
        spectrum = idx0;
      }
    }
    return spectrum;
  }

  private _getShaderMaterialForPoint(): ShaderMaterial {
    return new ShaderMaterial({
      uniforms: {
        pointTexture: {
          value: new TextureLoader().load('assets/textures/star_alpha.png')
        },
        magnitude: { value: 1.0 }
      },
      vertexShader: this._shadersConstant.shaderForPoints().vertex,
      fragmentShader: this._shadersConstant.shaderForPoints().fragment,
      blending: AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });
  }
}
