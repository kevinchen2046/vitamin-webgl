import { vec3 } from "../../core/GLSL";

type Color = { r: number, g: number, b: number }
export class Vector3 {
    public vec3: number[];

    public color: Color;
    constructor(x: number = 0, y: number = 0, z: number = 0, color: Color = null) {
        this.vec3 = [x, y, z];
        this.color = color;
    }
    public set x(v: number) { this.vec3[0] = v }
    public set y(v: number) { this.vec3[1] = v }
    public set z(v: number) { this.vec3[2] = v }
    public get x() { return this.vec3[0] }
    public get y() { return this.vec3[1] }
    public get z() { return this.vec3[2] }
}
export class D3Face {
    public vectors: Vector3[];
    public color: Color;

    constructor(
        ax: number, ay: number, az: number,
        bx: number, by: number, bz: number,
        cx: number, cy: number, cz: number,
        dx: number, dy: number, dz: number,
        color: Color, size: number = 1, inverse: boolean = false) {
        let vectors = [];
        let a = this.createPoint(ax * size, ay * size, az * size, color);
        let b = this.createPoint(bx * size, by * size, bz * size, color);
        let c = this.createPoint(cx * size, cy * size, cz * size, color);
        let d = this.createPoint(dx * size, dy * size, dz * size, color);

        if (inverse) {
            vectors.push(a);
            vectors.push(b);
            vectors.push(d);
            vectors.push(c);
            vectors.push(d);
            vectors.push(b);
        } else {
            vectors.push(a);
            vectors.push(d);
            vectors.push(b);
            vectors.push(c);
            vectors.push(b);
            vectors.push(d);
        }
        this.vectors = vectors;
        this.color=color;
    }
    private createPoint(x: number, y: number, z: number, color: Color) {
        return new Vector3(x, y, z, color)
    }
}