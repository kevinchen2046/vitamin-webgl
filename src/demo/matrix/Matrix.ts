export class Matrix {
    private _initial: number[];
    private _data: number[];
    private _translation: number[];
    private _rotation: number[];
    private _scaling: number[];
    constructor(initial?: number[]) {
        this._data = MatrixUtil.identity();
        this._initial = initial;
        if (this._initial) this.reset();

        this._translation = MatrixUtil.translation(0, 0);
        this._rotation = MatrixUtil.rotation(0);
        this._scaling = MatrixUtil.scaling(1, 1);
    }

    public get data() {
        return this._data
    }

    reset(initial?: number[]) {
        if (initial) this._initial = initial;
        initial = this._initial;
        if (!initial) return;
        let _data = this._data;
        for (let i = 0; i < _data.length; i++) {
            _data[i] = initial[i] ?? 0;
        }
    }

    translate(tx: number, ty: number) {
        return this.multiply(MatrixUtil.translationSet(this._translation, tx, ty));
    }

    rotate(angleInRadians: number) {
        return this.multiply(MatrixUtil.rotationSet(this._rotation, angleInRadians));
    }

    scale(sx: number, sy: number) {
        return this.multiply(MatrixUtil.scalingSet(this._scaling, sx, sy));
    }

    multiply(b: number[]) {
        let a = this._data;
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];

        a[0] = b00 * a00 + b01 * a10 + b02 * a20;
        a[1] = b00 * a01 + b01 * a11 + b02 * a21;
        a[2] = b00 * a02 + b01 * a12 + b02 * a22;
        a[3] = b10 * a00 + b11 * a10 + b12 * a20;
        a[4] = b10 * a01 + b11 * a11 + b12 * a21;
        a[5] = b10 * a02 + b11 * a12 + b12 * a22;
        a[6] = b20 * a00 + b21 * a10 + b22 * a20;
        a[7] = b20 * a01 + b21 * a11 + b22 * a21;
        a[8] = b20 * a02 + b21 * a12 + b22 * a22;
    }
}

export class MatrixUtil {

    static projection(width: number, height: number) {
        // Note: This matrix flips the Y axis so that 0 is at the top.
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ];
    }

    static identity() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ];
    }

    static translation(tx: number, ty: number) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
        ];
    }

    static translationSet(m: number[], tx: number, ty: number) {
        m[6] = tx;
        m[7] = ty;
        return m;
    }

    static rotation(angleInRadians: number) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    }

    static rotationSet(m: number[], angleInRadians: number) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        m[0] = c;
        m[1] = -s;
        m[3] = s;
        m[4] = c;
        return m;
    }

    static scaling(sx: number, sy: number) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1,
        ];
    }

    static scalingSet(m: number[], sx: number, sy: number) {
        m[0] = sx;
        m[4] = sy;
        return m;
    }

    static multiply(a: number[], b: number[]) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    }

    static translate(m: number[], tx: number, ty: number) {
        return MatrixUtil.multiply(m, MatrixUtil.translation(tx, ty));
    }

    static rotate(m: number[], angleInRadians: number) {
        return MatrixUtil.multiply(m, MatrixUtil.rotation(angleInRadians));
    }

    static scale(m: number[], sx: number, sy: number) {
        return MatrixUtil.multiply(m, MatrixUtil.scaling(sx, sy));
    }
}

