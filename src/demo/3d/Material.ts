import { Attribute } from "../../core/Attribute";
import { Context } from "../../core/Context";
import { mat4, vec4 } from "../../core/GLSL";
import { attribute, DefinedType, GLSL_Fragment, GLSL_Vertex, precision, PrecisionType, sampler2D, uniform, varying, _vec2, _vec4 } from "../../core/GLSL";
import { Shader } from "../../core/Shader";
import { BufferType } from "../../core/ShaderBuffer";

@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
    @attribute(DefinedType.vec4)
    public a_position: vec4;
    @attribute(DefinedType.vec4)
    public a_color: vec4;
    @uniform(DefinedType.mat4)
    public u_matrix: mat4;
    @varying(DefinedType.vec4)
    public v_color: vec4;
    @varying(DefinedType.vec4)
    public v_position: vec4;
    protected main() {
        // Multiply the position by the matrix.
        this.gl_Position._ = this.u_matrix._ * this.a_position._;
        // Pass the color to the fragment shader.
        this.v_color = this.a_color;
        this.v_position = this.a_position;
    }
}

@precision(PrecisionType.mediump)
class MyFS extends GLSL_Fragment {
    @uniform(DefinedType.sampler2D)
    public u_sampler: sampler2D;
    @varying(DefinedType.vec4)
    public v_color: vec4;
    @varying(DefinedType.vec4)
    public v_position: vec4;
    protected main() {
        this.gl_FragColor._ = this.v_color._ * 0.8 + (this.v_position._ * 0.03) * 0.2;
    }
}

export class Material {
    protected _shader: Shader;
    constructor() { }
    public initShader(vsclzz?: any, fsclazz?: any) {
        if (!this._shader) {
            this._shader = Context.defaultProgram.createShader(vsclzz ?? MyVS, fsclazz ?? MyFS);
            return true;
        }
        return false;
    }

    public initialize() {
        let shader = this._shader;
        //创建顶点数据并且关联到attribute属性
        shader.getAttribute("a_position").linkBuffer(
            shader.createBuffer(
                null,
                3,
                Context.gl.STATIC_DRAW));

        //创建纹理坐标uv数据并且关联到attribute属性
        shader.getAttribute("a_color").linkBuffer(
            shader.createBuffer(
                null,
                3,
                Context.gl.STATIC_DRAW), 3, BufferType.UNSIGNED_BYTE, true);
    }

    public get shader() { return this._shader }

    public setProperty(name: string, ...args) {
        let prop = this._shader.get(name);
        if (prop instanceof Attribute) {
            prop.buffer.data = args[0];
        } else {
            prop.set(...args);
        }
    }

    public getProperty(name: string) {
        return this._shader.get(name);
    }

    public draw() {
        this._shader.draw();
    }
}