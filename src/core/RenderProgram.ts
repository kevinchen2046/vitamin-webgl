import { GLSL_Fragment, GLSL_Vertex } from "./GLSL";
import { Context } from "./Context";
import { Shader } from "./Shader";
import { ColorUtil } from "./Util";

export class RenderProgram {
    private shaders: Shader[];
    constructor() {
        this.shaders = [];
    }

    createShader<VS>(vs: { new(): GLSL_Vertex }, ps: { new(): GLSL_Fragment }) {
        let shader = new Shader(vs, ps);
        this.shaders.push(shader);
        return shader;
    }

    clear(color?: number) {
        let gl = Context.gl;
        if (color) {
            const { r, g, b } = ColorUtil.extract(color);
            gl.clearColor(r / 255, g / 255, b / 255, 1);
        } else {
            // Specify the color for clearing <canvas>
            gl.clearColor(0, 0, 0, 1);
        }
        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    use() {
        let gl = Context.gl;
        // Tell it to use our program (pair of shaders)
        gl.useProgram(gl.program);
    }

    updateRender() {
        this.clear();
        for (let i = 0; i < this.shaders.length; i++) {
            this.shaders[i].draw();
        }
    }

    get defaultShader() {
        return this.shaders[0];
    }
}