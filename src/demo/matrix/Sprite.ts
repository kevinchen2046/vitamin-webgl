import { Context } from "../../core/Context";
import { Texture, TypeTextureDraw } from "../../core/Texture";
import { Quad } from "../geometry/Quad";
import { Loader } from "../../utils/Util";
import { Matrix3, MatrixUtil } from "./Matrix3";
import { glsl, mat3, vec3, vec4, _vec3 } from "../../core/GLSL";
import { attribute, cos, DefinedType, float, GLSL_Fragment, GLSL_Vertex, method, precision, PrecisionType, sampler2D, sin, smoothstep, texture2D, uniform, varying, vec2, _vec2, _vec4 } from "../../core/GLSL";
import { Shader } from "../../core/Shader";

@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
    @attribute(DefinedType.vec2)
    public a_position: vec2;
    @attribute(DefinedType.vec2)
    public a_texcoord: vec2;

    @uniform(DefinedType.vec4)
    public u_color: vec4;

    @uniform(DefinedType.float)
    public u_time: float;

    @uniform(DefinedType.mat3)
    public u_matrix: mat3;

    //-----------
    @varying(DefinedType.vec4)
    public v_color: vec4;
    @varying(DefinedType.vec2)
    public v_texcoord: vec2;

    protected main() {
        let position: any = (this.u_matrix._ * _vec3(this.a_position.x, this.a_position.y, 1.0)._);//@vec3
        this.gl_Position = _vec4(position.x, position.y, 0.0, 1.0);
        this.v_color = this.u_color;
        this.v_texcoord = this.a_texcoord;
        // this.v_texcoord = __vec2(this.a_texcoord.x, this.a_texcoord.y);
    }
}

@precision(PrecisionType.mediump)
class MyFS extends GLSL_Fragment {
    @uniform(DefinedType.sampler2D)
    public u_sampler: sampler2D;

    @uniform(DefinedType.float)
    public u_time: float;

    @varying(DefinedType.vec4)
    public v_color: vec4;

    @varying(DefinedType.vec2)
    public v_texcoord: vec2;

    protected main() {
        glsl`
      gl_FragColor = texture2D(u_sampler, v_texcoord.xy)*v_color;
    `;
    }
}
export class Sprite {
    private _texture: Texture;
    private _bitmap: HTMLImageElement;
    private _matrix: Matrix3;
    private _angle: number;
    private _tint: number;
    private _transform: {
        size: { w: number, h: number },
        pos: { x: number, y: number },
        alpha: number,
        radian: number,
        scale: { x: number, y: number },
        tint: number[],
        pivot: { x: number, y: number }
    };
    private _quad: Quad;
    private _shader: Shader;
    constructor() {
        this._angle = 0;

        this._transform = {
            size: { w: 0, h: 0 },
            pos: { x: 0, y: 0 },
            alpha: 1,
            radian: 0,
            scale: { x: 1, y: 1 },
            tint: [1, 1, 1, 1],
            pivot: { x: 0, y: 0 }
        }
        this._matrix = new Matrix3(MatrixUtil.projection(Context.clientWidth, Context.clientHeight));
        this.tint = 0xFFFFFF;
        this._quad = new Quad(0, 0);

        //创建Shader
        this._shader = Context.defaultProgram.createShader(MyVS, MyFS);
        //创建顶点数据并且关联到attribute属性
        this._shader.getAttribute("a_position").linkBuffer(
            this._shader.createBuffer(
                this.vertexs,
                // ConvoUtil.createRectangleData(0, 0, sprite.texture.width, sprite.texture.height),
                2,
                Context.gl.STATIC_DRAW));

        //创建纹理坐标uv数据并且关联到attribute属性
        this._shader.getAttribute("a_texcoord").linkBuffer(
            this._shader.createBuffer(
                this.uvs,
                2,
                Context.gl.STATIC_DRAW));
    }

    public updateRender() {
        let shader = this._shader;
        shader.get("u_color").set(...this.transform.tint);
        shader.get("u_matrix").set(this.matrix.data);
        shader.draw();
    }

    public async load(url: string) {
        this.bitmap = await Loader.loadImage(url);
    }

    public set bitmap(v: HTMLImageElement) {
        if (this._bitmap != v) {
            this._bitmap = v;
            if (!this.texture) {
                this.texture = Context.defaultShader.createTexture("u_sampler", this._bitmap, 0, TypeTextureDraw.CLAMP_TO_EDGE);
            } else {
                this.texture.image = this._bitmap;
                this.texture.update();
            }
        }
    }

    public set texture(v: Texture) {
        if (this._texture != v) {
            this._texture = v;
            if (this._texture) {
                this._transform.size.w = this._texture.width;
                this._transform.size.h = this._texture.height;
                let attribute = this._shader.getAttribute("a_position");
                attribute.buffer.data = this.vertexs;
                attribute.buffer.update();

            } else {
                this._transform.size.w = this._transform.size.h = 0;
            }
        }
    }

    public get texture() {
        return this._texture;
    }

    public get width(){return this._texture?.width}
    public get height(){return this._texture?.height}

    public get vertexs() {
        return this._quad.vertexs(this._texture?.width, this._texture?.height);
    }

    public get uvs() {
        return this._quad.uvs();
    }

    public pos(x: number, y?: number) {
        this._transform.pos.x = x;
        this._transform.pos.y = y??x;
        this.updateMatrix();
    }

    public scale(x: number, y?: number) {
        this._transform.scale.x = x;
        this._transform.scale.y = y??x;
        this.updateMatrix();
    }

    public pivot(x: number, y?: number) {
        this._transform.pivot.x = x;
        this._transform.pivot.y = y??x;
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
        this.updateMatrix();
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
        this._matrix.pivot(-this._transform.pivot.x, -this._transform.pivot.y)
    }
}