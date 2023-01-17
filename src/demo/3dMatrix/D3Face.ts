type Color = { r: number, g: number, b: number }
export class D3Face {
    // public points: { x: number, y: number, z: number, color: Color }[];
    // public color: Color;
    static create(
        ax: number, ay: number, az: number,
        bx: number, by: number, bz: number,
        cx: number, cy: number, cz: number,
        dx: number, dy: number, dz: number,
        color: Color, size: number = 1) {
        let points = [];
        let a = this.createPoint(ax * size, ay * size, az * size, color);
        let b = this.createPoint(bx * size, by * size, bz * size, color);
        let c = this.createPoint(cx * size, cy * size, cz * size, color);
        let d = this.createPoint(dx * size, dy * size, dz * size, color);
        points.push(a);
        points.push(b);
        points.push(d);
        points.push(d);
        points.push(b);
        points.push(c);
        return points;
    }
    private static createPoint(x: number, y: number, z: number, color: Color) {
        return { x: x, y: y, z: z, color: color }
    }
}