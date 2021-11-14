import { Injectable } from '@angular/core';

export interface ShaderModel {
  fragment: string;
  vertex: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShadersConstant {
  shaderForSphere(): ShaderModel {
    const fragmentShader = `
    uniform vec3 color;
    uniform float coefficient;
    uniform float power;
    varying vec3 vVertexNormal;
    varying vec3 vVertexWorldPosition;
    void main() {
      vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
      vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
      viewCameraToVertex = normalize(viewCameraToVertex);
      float intensity	= pow(
        coefficient + dot(vVertexNormal, viewCameraToVertex),
        power
      );
      gl_FragColor = vec4(color, intensity);
    }`;

    const vertexShader = `
    varying vec3 vVertexWorldPosition;
    varying vec3 vVertexNormal;
    void main() {
      vVertexNormal	= normalize(normalMatrix * normal);
      vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;
    return {
      fragment: fragmentShader,
      vertex: vertexShader
    };
  }

  shaderForPoints(): ShaderModel {
    const vertexShader = `
    attribute float size;
    attribute float absmag;
    varying vec3 vColor;
    varying float fAbsmag;
    void main() {
      fAbsmag = absmag;
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize =  size * 500.0 / -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
    }`;

    const fragmentShader = `
    uniform sampler2D pointTexture;
    varying float fAbsmag;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4( vColor, fAbsmag );
      gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
    }`;
    return {
      fragment: fragmentShader,
      vertex: vertexShader
    };
  }

  shaderForSphereAka(): ShaderModel {
    const vertexShader = `
    uniform vec3 viewVector;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main() 
    {
      vec3 vNormal = normalize( normalMatrix * normal );
      vec3 vNormel = normalize( normalMatrix * viewVector );
      intensity = pow( c - dot(vNormal, vNormel), p );
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`;
    const fragmentShader = `
    uniform vec3 glowColor;
    varying float intensity;
    void main() 
    {
      vec3 glow = glowColor * intensity;
      gl_FragColor = vec4( glow, 1.0 );
    }`;
    return {
      fragment: fragmentShader,
      vertex: vertexShader
    };
  }
}
