import { Context } from "./Context";
import { Uniform } from "./Uniform";

export enum TypeTextureDraw {
    LINEAR = "LINEAR",
    CLAMP_TO_EDGE = "CLAMP_TO_EDGE"
};

/**纹理 */
export class Texture {
    public sample: Uniform;
    public gltexture: WebGLTexture;
    public image: HTMLImageElement | { width: number, height: number };
    public position: number;
    public frameBuffer: WebGLFramebuffer;
    constructor(sample: Uniform, gltexture: WebGLTexture, image: HTMLImageElement | { width: number, height: number }, position: number = 0, typedraw?: TypeTextureDraw) {
        this.sample = sample;
        this.gltexture = gltexture;
        this.image = image;
        this.position = position;
        if (typedraw) {
            this.set(typedraw);
        }
    }

    get width(){
        return this.image.width
    }
    get height(){
        return this.image.height
    }
    enableFramebuffer() {
        let gl = Context.gl;
        // Create a framebuffer
        this.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        // Attach a texture to it.
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.gltexture, 0);
    }

    bindFrameBuffer() {
        let gl = Context.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    }

    active() {
        let gl = Context.gl;
        // Enable texture unit0
        gl.activeTexture(gl.TEXTURE0 + this.position);
    }

    use() {
        let gl = Context.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.gltexture);
        this.sample.set(this.position);
    }

    set(type: TypeTextureDraw) {
        let gl = Context.gl;
        // Bind the texture object to the target

        this.use();
        // Set the texture parameters
        if (type == TypeTextureDraw.LINEAR) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        if (type == TypeTextureDraw.CLAMP_TO_EDGE) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        if (this.image instanceof HTMLImageElement) {
            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        } else {
            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA, this.image.width, this.image.height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        // Set the texture unit 0 to the sampler
        // gl.uniform1i(u_Sampler, 0);
    }

    // upload() {
    //     let gl = gl;
    //     // Set the texture image
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
    //     // Set the texture unit 0 to the sampler
    //     // gl.uniform1i(u_Sampler, 0);
    //     this.sample.set(this.position);
    // }
}