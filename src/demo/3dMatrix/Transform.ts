export class Transform {
    alpha: number;
    color: { r: number, g: number, b: number };
    positon: { x: number, y: number, z: number };
    rotation: { x: number, y: number, z: number };
    scale: { x: number, y: number, z: number };
    pivot: { x: number, y: number, z: number }
    constructor() {
        this.alpha = 1;

        this.positon = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        this.pivot = { x: 0, y: 0, z: 0 };
    }

    public pos(x: number, y?: number, z?: number) {
        this.positon.x = x;
        this.positon.y = y ?? x;
        this.positon.z = z ?? x;
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
        if (this.positon.x != v) {
            this.positon.x = v;
        }
    }
    public get x() { return this.positon.x }

    public set y(v: number) {
        if (this.positon.y != v) {
            this.positon.y = v;
        }
    }
    public get y() { return this.positon.y }

    public set z(v: number) {
        if (this.positon.z != v) {
            this.positon.z = v;
        }
    }
    public get z() { return this.positon.z }

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