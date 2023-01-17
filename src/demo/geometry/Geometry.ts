import { ColorUtil } from "../../utils/ColorUtil";
import { Hashtable } from "../../utils/Hashtable";

export class Geometry {
    public size: number = 1;
    public points: Point[];
    public map: Hashtable<Point>;
    public rects: Rect[];
    public values: number[];
    public buffer: Float32Array;
    private _vextexs: Float32Array;
    private _uvs: Float32Array;
    constructor(sigX: number, sigY: number, anchorX: number = 0, anchorY: number = 0) {
        this.map = new Hashtable<Point>();
        this.rects = [];
        let halfX = sigX * anchorX;
        let halfY = sigY * anchorY;
        for (let b = 0; b <= sigY; b++) {
            for (let a = 0; a <= sigX; a++) {
                this.map.set(`${a}_${b}`, new Point(
                    (a - halfX) / sigX,
                    (b - halfY) / sigY,
                    this.randColor()))
            }
        }
        for (let b = 0; b < sigY; b++) {
            for (let a = 0; a < sigX; a++) {
                let index = b * sigX + a;
                if (!this.rects[index]) {
                    let ra = this.getPoint(a, b);
                    let rb = this.getPoint(a, b + 1);
                    let rc = this.getPoint(a + 1, b + 1);
                    let rd = this.getPoint(a + 1, b);
                    this.rects[index] = new Rect(ra, rb, rc, rd);
                }
            }
        }

        // console.log(this.map.length);
        // console.log(this.rects.length);
        this.points = [];
        this.rects.forEach(rect => rect.concat(this.points));
        this.values = new Array(this.points.length * 5);
        this.buffer = new Float32Array(this.values);
        this._vextexs = new Float32Array(this.points.length * 2);
        this._uvs = new Float32Array(this.points.length * 2);
        this.format();
    }

    getPoint(a, b) {
        return this.map.get(`${a}_${b}`)
    }

    randColor() {
        return Math.floor(Math.random() * 0xFFFFFF);
    }

    format() {
        this.points.forEach((p, i) => {
            let index = i * 5;
            this.buffer[index] = p.x;
            this.buffer[index + 1] = p.y;
            this.buffer[index + 2] = p.r;
            this.buffer[index + 3] = p.g;
            this.buffer[index + 4] = p.b;
        });
        return this.buffer;
    }

    vertexs(width: number = 1, height: number = 1) {
        this.points.forEach((p, i) => {
            let index = i * 2;
            this._vextexs[index] = p.x * width;
            this._vextexs[index + 1] = p.y * height;
        });
        return this._vextexs;
    }

    uvs() {
        this.points.forEach((p, i) => {
            let index = i * 2;
            this._uvs[index] = p.x;
            this._uvs[index + 1] = p.y;
        });
        return this._uvs;
    }

    pointToString() {
        return this.points.map((p, i) => {
            return { x: p.x, y: p.y };
        })
    }
}

class Point {
    public x: number;
    public y: number;
    public r: number;
    public g: number;
    public b: number;
    constructor(x: number = 0, y: number = 0, color: number = 0xFFFFFF) {
        this.x = x;
        this.y = y;
        this.setColor(color);
    }

    clone() {
        let _p = new Point();
        _p.x = this.x;
        _p.y = this.y;
        _p.r = this.r;
        _p.g = this.g;
        _p.b = this.b;
        return _p;
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    setColor(v: number) {
        let { r, g, b } = ColorUtil.extract(v);
        this.r = r / 0xFF;
        this.g = g / 0xFF;
        this.b = b / 0xFF;
    }

    format() {
        return [
            this.x,
            this.y,
            this.r,
            this.g,
            this.b
        ];
    }

    average(target: Point) {
        if (this.x == target.x) {
            return { x: this.x, y: this.y + (target.y - this.y) / 2, r: Math.floor(this.r + target.r / 2), g: Math.floor(this.g + target.g / 2), b: Math.floor(this.b + target.b / 2) }
        }
        if (this.y == target.y) {
            return { x: this.x + (target.x - this.x) / 2, y: this.y, r: Math.floor(this.r + target.r / 2), g: Math.floor(this.g + target.g / 2), b: Math.floor(this.b + target.b / 2) }
        }
        return { x: this.x + (target.x - this.x) / 2, y: this.y + (target.y - this.y) / 2, r: Math.floor(this.r + target.r / 2), g: Math.floor(this.g + target.g / 2), b: Math.floor(this.b + target.b / 2) }
    }
}

class Rect {
    public points: Point[];

    constructor(a: Point, b: Point, c: Point, d: Point) {
        this.points = [a, b, c, d];
        //[a, b, d, b, c, d]
    }

    public concat(list: Point[]) {
        return list.push(this.a, this.b, this.d, this.b, this.c, this.d)
    }

    public get a() { return this.points[0] }
    public get b() { return this.points[1] }
    public get c() { return this.points[2] }
    public get d() { return this.points[3] }
}