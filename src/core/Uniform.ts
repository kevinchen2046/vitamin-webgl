import { DefinedType } from "./GLSL";
import { ShaderProperty } from "./ShaderProperty";

export class Uniform extends ShaderProperty {
    constructor(name: string, type: DefinedType, location: WebGLUniformLocation) {
        super(name, type, location);
    }
}