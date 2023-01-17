import { Vector3 } from "./D3Face";

export class Transform {
    alpha: number;
    color: { r: number, g: number, b: number };
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
    pivot: Vector3
    constructor() {
        this.alpha = 1;

        this.position = new Vector3();
        this.rotation = new Vector3();
        this.scale = new Vector3(1,1,1);
        this.pivot = new Vector3()
    }

    public pos(x: number, y?: number, z?: number) {
        this.position.x = x;
        this.position.y = y ?? x;
        this.position.z = z ?? x;
    }

    public setScale(x: number, y?: number, z?: number) {
        this.scale.x = x;
        this.scale.y = y ?? x;
        this.scale.z = z ?? x;
    }

    public setPivot(x: number, y?: number, z?: number) {
        this.pivot.x = x;
        this.pivot.y = y ?? x;
        this.pivot.z = z ?? x;
    }

    public setRotation(x?: number, y?: number, z?: number) {
        if (x != undefined) this.rotation.x = x;
        if (y != undefined) this.rotation.y = y;
        if (z != undefined) this.rotation.z = z;
    }

    public setTintColor(v:number){
        this.color.r = ((v & 0xff0000) >> 16) / 255;
        this.color.g = ((v & 0x00ff00) >> 8) / 255;
        this.color.b = ((v & 0x0000ff)) / 255;
    }

    public setColor(r:number,g:number,b:number) {
        if (r != undefined) this.color.r = r;
        if (g != undefined) this.color.g = g;
        if (b != undefined) this.color.b = b;
    }

    public set x(v: number) {
        if (this.position.x != v) {
            this.position.x = v;
        }
    }
    public get x() { return this.position.x }

    public set y(v: number) {
        if (this.position.y != v) {
            this.position.y = v;
        }
    }
    public get y() { return this.position.y }

    public set z(v: number) {
        if (this.position.z != v) {
            this.position.z = v;
        }
    }
    public get z() { return this.position.z }

    public set scaleX(v: number) {
        if (this.scale.x != v) {
            this.scale.x = v;
        }
    }
    public get scaleX() { return this.scale.x }

    public set scaleY(v: number) {
        if (this.scale.y != v) {
            this.scale.y = v;
        }
    }
    public get scaleY() { return this.scale.y }

    public set scaleZ(v: number) {
        if (this.scale.z != v) {
            this.scale.z = v;
        }
    }
    public get scaleZ() { return this.scale.z }


    public set rotationX(v: number) {
        if (this.rotation.x != v) {
            this.rotation.x = v;
        }
    }
    public get rotationX() { return this.rotation.x }

    public set rotationY(v: number) {
        if (this.rotation.y != v) {
            this.rotation.y = v;
        }
    }
    public get rotationY() { return this.rotation.y }

    public set rotationZ(v: number) {
        if (this.rotation.z != v) {
            this.rotation.z = v;
        }
    }
    public get rotationZ() { return this.rotation.z }
}