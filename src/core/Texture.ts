import { MathUtil } from "../utils/MathUtil";
import { Context } from "./Context";
import { DefinedType } from "./GLSL";
import { Program } from "./Program";
import { Uniform } from "./Uniform";

export enum TextureWrap {
    REPEAT = 10497,
    CLAMP_TO_EDGE = 33071,
    MIRRORED_REPEAT = 33648
};
export enum TextureMap {
    /**从最大的贴图中选择 1 个像素 */
    NEAREST = 9728,
    /**从最大的贴图中选择4个像素然后混合 */
    LINEAR = 9729,
    /**选择最合适的贴图，然后从上面找到一个像素 */
    NEAREST_MIPMAP_NEAREST = 9984,
    /**选择最合适的贴图，然后取出 4 个像素进行混合 */
    LINEAR_MIPMAP_NEAREST = 9985,
    /**选择最合适的两个贴图，从每个上面选择 1 个像素然后混合 */
    NEAREST_MIPMAP_LINEAR = 9986,
    /**选择最合适的两个贴图，从每个上选择 4 个像素然后混合 */
    LINEAR_MIPMAP_LINEAR = 9987,
};

export type TextureOptions = {
    uniformName?: string,
    samplePosition?: number,
    mipmap?: boolean,
    wrap?: {
        s?: TextureWrap, t?: TextureWrap
    },
    map?: {
        min?: TextureMap, mag?: TextureMap
    }
}
/**纹理 */
export class Texture {
    public sampler: Uniform;
    public position: number;
    public gltexture: WebGLTexture;
    public image: HTMLImageElement | { width: number, height: number };

    public frameBuffer: WebGLFramebuffer;
    private options: TextureOptions;
    constructor(image: HTMLImageElement | { width: number, height: number }, options?: TextureOptions) {
        this.options = options;
        this.position = options?.samplePosition ?? 0;
        let gl = Context.gl;
        var gltexture = gl.createTexture();   // Create a texture object
        if (!gltexture) {
            console.log('Failed to create the texture object');
            return null;
        }
        this.gltexture = gltexture;
        this.image = image;
    }

    get width() {
        return this.image.width
    }

    get height() {
        return this.image.height
    }

    linkProgram(program: Program) {
        // program=Context.defaultProgram;
        let name=this.options?.uniformName ?? "sampler";
        // let location = Context.gl.getUniformLocation((program as any).glProgram, name);
        // this.sampler = new Uniform(name, DefinedType.sampler2D, location);
        this.sampler = program.createUniform(name, DefinedType.sampler2D);
        this.update();
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

    bind() {
        let gl = Context.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.gltexture);
        this.sampler.set(this.position);
        // gl.uniform1i(this.sampler.location, 0);
    }

    update() {
        let gl = Context.gl;
        let image = this.image;
        // Bind the texture object to the target

        this.bind();

        if (this.options?.mipmap && MathUtil.allPowerOf2(image.width, image.height)) {
            // 是 2 的幂，一般用贴图
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            if (this.options?.wrap?.s) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.options.wrap.s ?? gl.CLAMP_TO_EDGE);
            }
            if (this.options?.wrap?.t) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.options.wrap.t ?? gl.CLAMP_TO_EDGE);
            }
        }

        if (this.options?.map?.min) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.options.map.min ?? gl.NEAREST);
        }
        if (this.options?.map?.mag) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.options.map.mag ?? gl.NEAREST);
        }
        // Set the texture parameters
        // if (this.typedraw == TypeTextureDraw.LINEAR) {
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // }
        // if (this.typedraw == TypeTextureDraw.CLAMP_TO_EDGE) {
        //     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        //     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // }
        if (image instanceof HTMLImageElement) {
            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        } else {
            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        // Set the texture unit 0 to the sampler
        // gl.uniform1i(u_Sampler, 0);
    }
}