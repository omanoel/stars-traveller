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
import {
  ATTRIBUTE_ABSMAG,
  ATTRIBUTE_COLOR,
  ATTRIBUTE_POSITION,
  ATTRIBUTE_SIZE,
  Collection3d,
  ColorIndex
} from './objects.model';
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
    objectsFiltered: BaseCatalogData[],
    deltaTimeInYear = 0
  ): void {
    const vertices = [];
    const colors = [];
    const sizes = [];
    const absmags = [];

    for (let i = 0; i < objectsFiltered.length; i++) {
      const record = objectsFiltered[i];
      vertices.push(
        record.x + (record.vx ? record.vx : 0) * deltaTimeInYear,
        record.y + (record.vy ? record.vy : 0) * deltaTimeInYear,
        record.z + (record.vz ? record.vz : 0) * deltaTimeInYear
      );
      const color = new Color(model.colors[this._getSpectrum(model, record)]);
      // const color = new Color(
      //   starColorFromColorIndex[this._getColorIndex(record)]
      // );
      colors.push(color.r, color.g, color.b);
      const mag = this._computeMagnitude(record.absmag);
      sizes.push(mag);
      absmags.push(mag);
    }

    // Light points
    const geometryLight = new BufferGeometry();
    geometryLight.setAttribute(
      ATTRIBUTE_POSITION,
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
      (<Points>lightPoints).geometry.attributes[
        ATTRIBUTE_POSITION
      ].needsUpdate = true;
      (<Points>lightPoints).geometry.attributes[ATTRIBUTE_POSITION] =
        new Float32BufferAttribute(vertices, 3);
    }

    // Glow points (for stars catalog only)
    const geometryGlow = new BufferGeometry();
    geometryGlow.setAttribute(
      ATTRIBUTE_POSITION,
      new Float32BufferAttribute(vertices, 3)
    );
    geometryGlow.attributes[ATTRIBUTE_POSITION].needsUpdate = true;
    geometryGlow.setAttribute(
      ATTRIBUTE_COLOR,
      new Float32BufferAttribute(colors, 3)
    );
    geometryGlow.attributes[ATTRIBUTE_COLOR].needsUpdate = true;
    geometryGlow.setAttribute(
      ATTRIBUTE_SIZE,
      new Float32BufferAttribute(sizes, 1)
    );
    geometryGlow.attributes[ATTRIBUTE_SIZE].needsUpdate = true;
    geometryGlow.setAttribute(
      ATTRIBUTE_ABSMAG,
      new Float32BufferAttribute(absmags, 1)
    );
    geometryGlow.attributes[ATTRIBUTE_ABSMAG].needsUpdate = true;
    const materialGlow = this._getShaderMaterialForPoint();

    let glowPoints = model.groupOfObjectsPoints.children.find(
      (obj) => obj.name === StarsAsPointsService.GLOW_POINTS
    );
    if (!glowPoints) {
      glowPoints = new Points(geometryGlow, materialGlow);
      glowPoints.name = StarsAsPointsService.GLOW_POINTS;
      model.groupOfObjectsPoints.add(glowPoints);
    } else {
      const attributes = (<Points>glowPoints).geometry.attributes;
      attributes[ATTRIBUTE_POSITION] = new Float32BufferAttribute(vertices, 3);
      attributes[ATTRIBUTE_POSITION].needsUpdate = true;
      attributes[ATTRIBUTE_COLOR] = new Float32BufferAttribute(colors, 3);
      attributes[ATTRIBUTE_COLOR].needsUpdate = true;
      attributes[ATTRIBUTE_SIZE] = new Float32BufferAttribute(sizes, 1);
      attributes[ATTRIBUTE_SIZE].needsUpdate = true;
      attributes[ATTRIBUTE_ABSMAG] = new Float32BufferAttribute(absmags, 1);
      attributes[ATTRIBUTE_ABSMAG].needsUpdate = true;
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

  private _getColorIndex(near: BaseCatalogData): ColorIndex {
    let colorIndex = ColorIndex.G0V;
    if (!isNaN(Number(near.ci))) {
      if (Number(near.ci) < -0.3) {
        colorIndex = ColorIndex.O5V;
      } else if (Number(near.ci) < -0.02) {
        colorIndex = ColorIndex.B0V;
      } else if (Number(near.ci) < 0.3) {
        colorIndex = ColorIndex.A0V;
      } else if (Number(near.ci) < 0.58) {
        colorIndex = ColorIndex.F0V;
      } else if (Number(near.ci) < 0.81) {
        colorIndex = ColorIndex.G0V;
      } else if (Number(near.ci) < 1.4) {
        colorIndex = ColorIndex.K0V;
      } else {
        colorIndex = ColorIndex.M0V;
      }
    }
    return colorIndex;
  }

  private _getShaderMaterialForPoint(): ShaderMaterial {
    return new ShaderMaterial({
      uniforms: {
        pointTexture: {
          value: new TextureLoader().load('assets/textures/star_alpha.png')
        }
      },
      vertexShader: this._shadersConstant.shaderForPoints().vertex,
      fragmentShader: this._shadersConstant.shaderForPoints().fragment,
      blending: AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });
  }

  /**
   *
   * @param absmag the absolute magnitude
   * @returns
   */
  private _computeMagnitude(absmag: number): number {
    const min = 0.1;
    const max = 3;
    const minAbsMag = -17;
    const maxAbsMag = 20;
    if (absmag > maxAbsMag) {
      return min;
    }
    if (absmag < minAbsMag) {
      return max;
    }
    const magnitude =
      min + ((max - min) * (maxAbsMag - absmag)) / (maxAbsMag - minAbsMag);
    return magnitude;
  }
}
