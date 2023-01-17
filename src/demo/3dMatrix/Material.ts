import { Attribute } from "../../core/Attribute";
import { Context } from "../../core/Context";
import { mat4, vec4 } from "../../core/GLSL";
import { attribute, DefinedType, GLSL_Fragment, GLSL_Vertex, precision, PrecisionType, sampler2D, uniform, varying, __vec2, __vec4 } from "../../core/GLSL";
import { Shader } from "../../core/Shader";

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
        this.gl_Position.__ = this.u_matrix.__ * this.a_position.__;

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
        this.gl_FragColor.__ = this.v_color.__*0.8+(this.v_position.__*0.03)*0.2;
    }
}

let _GID = 0;

export class Material {
    private _shader: Shader;
    constructor() { }
    public createShader() {
        if (!this._shader) {
            this._shader = Context.defaultProgram.createShader(MyVS, MyFS);
            return true;
        }
        return false;
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