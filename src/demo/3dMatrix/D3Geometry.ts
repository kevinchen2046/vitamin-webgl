import { D3Face } from "./D3Face";

export class D3Geometry {
    public vertexes: number[];
    public colors: number[];
    constructor(...args) {
        this.vertexes = []
        this.colors = []
        for (let i = 0; i < args.length; i++) {
            let p = args[i];
            this.vertexes.push(p.x, p.y, p.z);
            this.colors.push(p.color.r, p.color.g, p.color.b);
        }
    }
    static createCube(size: number = 20) {
        return new D3Geometry(
            ...D3Face.create(
                -1, 1, 1,
                -1, -1, 1,
                1, -1, 1,
                1, 1, 1,
                { r: 255, g: 0, b: 0 }, size),
            ...D3Face.create(
                -1, 1, -1,
                -1, -1, -1,
                1, -1, -1,
                1, 1, -1,
                { r: 0, g: 255, b: 0 }, size),
            ...D3Face.create(
                -1, -1, 1,
                -1, -1, -1,
                -1, 1, -1,
                -1, 1, 1,
                { r: 0, g: 0, b: 255 }, size),
            ...D3Face.create(
                1, -1, 1,
                1, -1, -1,
                1, 1, -1,
                1, 1, 1,
                { r: 128, g: 128, b: 0 }, size),
            ...D3Face.create(
                -1, -1, 1,
                -1, -1, -1,
                1, -1, -1,
                1, -1, 1,
                { r: 0, g: 128, b: 128 }, size),
            ...D3Face.create(
                -1, 1, 1,
                -1, 1, -1,
                1, 1, -1,
                1, 1, 1,
                { r: 128, g: 0, b: 128 }, size)
        )
    }
}