import { Geometry } from "./Geometry";

export class Quad extends Geometry {
    constructor(anchorX: number = 0, anchorY: number = 0) {
        super(1, 1, anchorX, anchorY);
    }
}