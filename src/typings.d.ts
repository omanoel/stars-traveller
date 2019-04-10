import { LineSegments } from "three";

/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare namespace THREE {
  export class PolarGridHelper extends LineSegments {
    constructor(radius?:number, radials?:number, circles?:number, divisions?:number, color1?:number, color2?:number);
  }
}
