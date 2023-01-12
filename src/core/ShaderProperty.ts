import { DefinedType } from "./GLSL";
import { Context } from "./Context";

export abstract class ShaderProperty {
    public name: string;
    public type: DefinedType;
    public location: WebGLUniformLocation | number;
    public value: number[];
    constructor(name: string, type: DefinedType, location: WebGLUniformLocation | number) {
        this.name = name;
        this.type = type;
        this.location = location;
    }
    get() {
        return this.value;
    }
    set(...vals) {
        let gl = Context.gl;

        switch (this.type) {
            case DefinedType.sampler2D:
            case DefinedType.int:
                this.value = vals;
                if (Array.isArray(this.value)) {
                    switch (this.value.length) {
                        case 1: gl.uniform1iv(this.location, this.value); break
                        case 2: gl.uniform2iv(this.location, this.value); break
                        case 3: gl.uniform3iv(this.location, this.value); break
                        case 4: gl.uniform4iv(this.location, this.value); break
                    }
                } else {
                    gl.uniform1i(this.location, this.value);
                }
                break;

            case DefinedType.float_array:
                this.value = vals;
                gl.uniform1fv(this.location, this.value);
                break
            case DefinedType.float:
            case DefinedType.vec2:
            case DefinedType.vec3:
            case DefinedType.vec4:
                this.value = vals;
                if (Array.isArray(this.value)) {
                    switch (this.value.length) {
                        case 1: gl.uniform1fv(this.location, this.value); break
                        case 2: gl.uniform2fv(this.location, this.value); break
                        case 3: gl.uniform3fv(this.location, this.value); break
                        case 4: gl.uniform4fv(this.location, this.value); break
                    }
                } else {
                    gl.uniform1f(this.location, this.value);
                }
                break;
            case DefinedType.mat2:
                this.value = vals[0];
                gl.uniformMatrix2fv(this.location, false, this.value);
                break;
            case DefinedType.mat3:
                this.value = vals[0];
                gl.uniformMatrix3fv(this.location, false, this.value);
                break;
            case DefinedType.mat4:
                this.value = vals[0];
                gl.uniformMatrix4fv(this.location, false, this.value);
                break;
        }
    }

    upload() {
    }
}