import { vec3 } from "../../core/GLSL";

type Color = { r: number, g: number, b: number }
export class Vector3 {
    public xyz: number[];
    public uv: number[];
    public color: Color;
    constructor(x: number = 0, y: number = 0, z: number = 0, u: number = 0, v: number = 0) {
        this.xyz = [x, y, z];
        this.uv = [u, v];
    }
    public set x(v: number) { this.xyz[0] = v }
    public set y(v: number) { this.xyz[1] = v }
    public set z(v: number) { this.xyz[2] = v }
    public get x() { return this.xyz[0] }
    public get y() { return this.xyz[1] }
    public get z() { return this.xyz[2] }

    public set u(v: number) { this.uv[0] = v }
    public set v(v1: number) { this.uv[1] = v1 }
    public get u() { return this.uv[0] }
    public get v() { return this.uv[1] }

    public scale(v1: number) {
        this.xyz = this.xyz.map(v => v * v1);
        return this;
    }
    public setColor(color: Color) {
        this.color = color;
        return this;
    }
}
export class D3Face {
    /**存放四面体的点 */
    public points: Vector3[];
    /**存放三角形的点 */
    public vectors: Vector3[];
    /**面颜色 */
    public color: Color;
    // a------d
    // |    / |
    // |  /   |
    // b------c
    constructor(a: Vector3, b: Vector3, c: Vector3, d: Vector3, color: Color, size: number = 1, inverse: boolean = false) {
        this.points = [a, b, c, d];
        let vectors = [];
        a.scale(size).setColor(color);
        b.scale(size).setColor(color);
        c.scale(size).setColor(color);
        d.scale(size).setColor(color);
        //正面为逆时针 背面为顺时针
        if (inverse) {//是否背面
            vectors.push(a, b, d);//三角形
            vectors.push(d, b, c);//三角形
        } else {
            vectors.push(a, d, b);//三角形
            vectors.push(b, d, c);//三角形
        }
        this.vectors = vectors;
        this.color = color;
    }
}