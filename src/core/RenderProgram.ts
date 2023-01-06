import { GLSL_Fragment, GLSL_Vertex } from "./GLSL";
import { Shader } from "./Shader";

export class RenderProgram {
    public gl: WebGLRenderingContext;
    private shaders: Shader[];
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.shaders = [];
    }
    createShader<VS>(vs: { new(): GLSL_Vertex }, ps: { new(): GLSL_Fragment }) {
        let shader = new Shader(this.gl, vs, ps);
        this.shaders.push(shader);
        return shader;
    }

    clear(){
        let gl = this.gl;
        // Specify the color for clearing <canvas>
        gl.clearColor(0, 0, 0, 1);
        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    use(){
        let gl = this.gl;
        // Tell it to use our program (pair of shaders)
        gl.useProgram(gl.program);
    }

    updateRender() {
        this.clear();
        for (let i = 0; i < this.shaders.length; i++) {
            this.shaders[i].draw();
        }
    }
}