import { Attribute } from "../../core/Attribute";
import { Context } from "../../core/Context";
import { mat4, vec4 } from "../../core/GLSL";
import { attribute, DefinedType, GLSL_Fragment, GLSL_Vertex, precision, PrecisionType, sampler2D, uniform, varying, _vec2, _vec4 } from "../../core/GLSL";
import { Shader } from "../../core/Shader";
import { BufferType } from "../../core/ShaderBuffer";


export class Material {
    protected _shader: Shader;
    private _vsclzz:any;
    private _fsclzz:any;
    constructor(vsclzz,fsclzz) {
        this._vsclzz=vsclzz;
        this._fsclzz=fsclzz;
    }
    public initShader() {
        if (!this._shader) {
            this._shader = Context.defaultProgram.createShader(this._vsclzz,this._fsclzz);
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
        if(!prop){
            // console.warn("shader 不包含属性:"+name);
            return;
        }
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