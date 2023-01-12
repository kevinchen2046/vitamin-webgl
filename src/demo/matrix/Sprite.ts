import { Context } from "../../core/Context";
import { Texture, TypeTextureDraw } from "../../core/Texture";
import { Loader } from "../Util";
import { Matrix, MatrixUtil } from "./Matrix";

export class Sprite {
    public texture: Texture;
    private bitmap: HTMLImageElement;
    private _matrix: Matrix;
    private _angle: number;
    private _tint: number;
    private _transform: { pos: { x: number, y: number }, alpha: number, radian: number, scale: { x: number, y: number }, tint: number[] }
    constructor() {
        this._angle = 0;

        this._transform = {
            pos: { x: 0, y: 0 },
            alpha: 1,
            radian: 0,
            scale: { x: 1, y: 1 },
            tint: [1, 1, 1, 1]
        }
        this._matrix = new Matrix(MatrixUtil.projection(Context.clientWidth, Context.clientHeight));
        this.tint = 0xFFFFFF;
    }
    public async load(url: string) {
        this.bitmap = await Loader.loadImage(url);
        this.texture = Context.defaultShader.createTexture("u_sampler", this.bitmap, 0, TypeTextureDraw.CLAMP_TO_EDGE);
    }

    public pos(x: number, y: number) {
        this._transform.pos.x = x;
        this._transform.pos.y = y;
        this.updateMatrix();
    }

    public scale(x: number, y: number) {
        this._transform.scale.x = x;
        this._transform.scale.y = y;
        this.updateMatrix();
    }

    public set x(v: number) {
        if (this._transform.pos.x != v) {
            this._transform.pos.x = v;
            this.updateMatrix();
        }
    }
    public get x() { return this._transform.pos.x }

    public set y(v: number) {
        if (this._transform.pos.y != v) {
            this._transform.pos.y = v;
            this.updateMatrix();
        }
    }
    public get y() { return this._transform.pos.y }
    public set scaleX(v: number) {
        if (this._transform.scale.x != v) {
            this._transform.scale.x = v;
            this.updateMatrix();
        }
    }
    public get scaleX() { return this._transform.scale.x }

    public set scaleY(v: number) {
        if (this._transform.scale.y != v) {
            this._transform.scale.y = v;
            this.updateMatrix();
        }
    }
    public get scaleY() { return this._transform.scale.y }

    public set angle(v: number) {
        if (this._angle != v) {
            this._angle = v;
            this.updateAngle();
        }
    }

    public get angle() { return this._angle }

    public set tint(v: number) {
        if (this._tint != v) {
            this._tint = v;
            this.updateTint();
        }
    }

    public get tint() { return this._tint }

    private _tintTime: number;
    public tintTo(v: number, time: number = 1000) {
        if (this._tint == v) return;
        this._tint = v;
        if (this._tintTime) {
            clearTimeout(this._tintTime);
            this._tintTime = undefined;
            Context.removeTick(this);
        }
        let r = ((v & 0xff0000) >> 16) / 255;
        let g = ((v & 0x00ff00) >> 8) / 255;
        let b = ((v & 0x0000ff)) / 255;
        let start = new Date().getTime();
        let sr = this._transform.tint[0];
        let sg = this._transform.tint[1];
        let sb = this._transform.tint[2];
        let fr = r - sr;
        let fg = g - sg;
        let fb = b - sb;
        Context.addTick(this, () => {
            let dt = new Date().getTime() - start;
            this._transform.tint[0] = this.__linearNone(dt, sr, fr, time);
            this._transform.tint[1] = this.__linearNone(dt, sg, fg, time);
            this._transform.tint[2] = this.__linearNone(dt, sb, fb, time);
        });
        this._tintTime = setTimeout(() => {
            this._tintTime = undefined;
            Context.removeTick(this);
        }, time);
    }
    __linearNone(t, b, c, d) {
        return c * t / d + b;
    }

    public get transform() {
        return this._transform;
    }

    public get matrix() {
        return this._matrix;
    }

    private updateAngle() {
        this._transform.radian = this._angle * Math.PI / 180;
    }
    private updateTint() {
        this._transform.tint[0] = ((this._tint & 0xff0000) >> 16) / 255;
        this._transform.tint[1] = ((this._tint & 0x00ff00) >> 8) / 255;
        this._transform.tint[2] = ((this._tint & 0x0000ff)) / 255;
    }

    updateMatrix() {
        this._matrix.reset();
        this._matrix.translate(this._transform.pos.x, this._transform.pos.y);
        this._matrix.rotate(this._transform.radian);
        this._matrix.scale(this._transform.scale.x, this._transform.scale.y);
    }
}