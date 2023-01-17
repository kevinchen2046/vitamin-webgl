import { Program } from "typescript";
import { attribute, cos, DefinedType, float, glsl, GLSL_Fragment, GLSL_Vertex, method, precision, PrecisionType, sampler2D, sin, smoothstep, texture2D, uniform, varying, vec2, _vec2, _vec4 } from "../../core/GLSL";
import { Context } from "../../core/Context";
import { Texture, TypeTextureDraw } from "../../core/Texture";

import { Loader } from "../../utils/Util";
import { ConvoUtil } from "./ConvoUtil";
import { kernels, TypeKernel } from "./kernels";

@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
    @attribute(DefinedType.vec2)
    public a_position: vec2;
    @attribute(DefinedType.vec2)
    public a_texCoord: vec2;
    @uniform(DefinedType.vec2)
    public u_resolution: vec2;
    @uniform(DefinedType.float)
    public u_flipY: float;
    @varying(DefinedType.vec2)
    public v_texCoord: vec2;
    protected main() {
        // convert the rectangle from pixels to 0.0 to 1.0
        let zeroToOne = this.a_position._ / this.u_resolution._;//@vec2
        // convert from 0->1 to 0->2
        let zeroToTwo = zeroToOne * 2.0;//@vec2
        // convert from 0->2 to -1->+1 (clipspace)
        let clipSpace = zeroToTwo - 1.0;//@vec2
        this.gl_Position = _vec4(clipSpace * _vec2(1, this.u_flipY)._, 0, 1);
        // pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points.
        this.v_texCoord = this.a_texCoord;
    }
}

@precision(PrecisionType.mediump)
class MyFS extends GLSL_Fragment {
    // our texture
    @uniform(DefinedType.sampler2D)
    public u_image;
    @uniform(DefinedType.vec2)
    public u_textureSize;
    @uniform(DefinedType.float_array, 9)
    public u_kernel;
    @uniform(DefinedType.float)
    public u_kernelWeight;
    // the texCoords passed in from the vertex shader.
    @varying(DefinedType.vec2)
    public v_texCoord;
    protected main() {
        glsl`
        vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
        vec4 colorSum =
            texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
            texture2D(u_image, v_texCoord + onePixel * vec2(0, -1)) * u_kernel[1] +
            texture2D(u_image, v_texCoord + onePixel * vec2(1, -1)) * u_kernel[2] +
            texture2D(u_image, v_texCoord + onePixel * vec2(-1, 0)) * u_kernel[3] +
            texture2D(u_image, v_texCoord + onePixel * vec2(0, 0)) * u_kernel[4] +
            texture2D(u_image, v_texCoord + onePixel * vec2(1, 0)) * u_kernel[5] +
            texture2D(u_image, v_texCoord + onePixel * vec2(-1, 1)) * u_kernel[6] +
            texture2D(u_image, v_texCoord + onePixel * vec2(0, 1)) * u_kernel[7] +
            texture2D(u_image, v_texCoord + onePixel * vec2(1, 1)) * u_kernel[8];
        gl_FragColor = vec4((colorSum / u_kernelWeight).rgb, 1);
        // gl_FragColor = texture2D(u_image,v_texCoord);
        `;
    }
}
/**
 * 卷积
 * https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-image-processing-continued.html
 */
export class Convolutional {
    private image: HTMLImageElement;
    private originalTexture: Texture;
    private processTextures: Texture[];
    constructor() {
        this.initialize();
    }
    async initialize() {
        var canvas = document.getElementById('webgl');
        //创建渲染器
        Context.initialize(canvas as HTMLCanvasElement);
        let program = Context.createProgram();
        //创建Shader
        let shader = program.createShader(MyVS, MyFS);
        shader.printf();

        this.image = await Loader.loadImage('./res/flower.jpg');

        //创建顶点数据并且关联到attribute属性
        shader.getAttribute("a_position").linkBuffer(
            shader.createBuffer(
                ConvoUtil.createRectangleData(0, 0, this.image.width, this.image.height),
                2,
                Context.gl.STATIC_DRAW));
            
        //创建纹理坐标uv数据并且关联到attribute属性
        shader.getAttribute("a_texCoord").linkBuffer(
            shader.createBuffer(
                [
                    0.0, 0.0,
                    1.0, 0.0,
                    0.0, 1.0,
                    0.0, 1.0,
                    1.0, 0.0,
                    1.0, 1.0,
                ],
                2,
                Context.gl.STATIC_DRAW));
        
        
        this.originalTexture = shader.createTexture("u_image", this.image, 0, TypeTextureDraw.CLAMP_TO_EDGE);

        /**
         * 创造两个纹理交替渲染
         */
        this.processTextures = [];
        for (var ii = 0; ii < 2; ++ii) {
            let texture = shader.createTexture("u_image", { width: this.image.width, height: this.image.height }, 0, TypeTextureDraw.CLAMP_TO_EDGE);
            texture.enableFramebuffer();
            this.processTextures.push(texture);
        }

        program.use();

        this.draw([
            "gaussianBlur3",
            "gaussianBlur3",
            "gaussianBlur3",
            "emboss"
        ]);
        // this.draw(TypeKernel.emboss)
    }

    private draw(effects: string[] | string) {
        if (!Array.isArray(effects)) effects = [effects];
        let gl = Context.gl;
        let program = Context.defaultProgram;
        let shader = Context.defaultShader;
        let image = this.image;

        program.clear();

        /**
         * 设置Uniform
         */
        shader.get("u_textureSize").set(image.width, image.height);
        shader.get("u_resolution").set(gl.canvas.width, gl.canvas.width);

        shader.get("u_flipY").set(1);
        this.originalTexture.use();
        var count = 0;
        for (let name of effects) {

            shader.useFrameBuffer(this.processTextures[count % 2]);

            shader.get("u_kernel").set(...kernels[name]);
            shader.get("u_kernelWeight").set(ConvoUtil.computeKernelWeight(kernels[name]));
            shader.draw();

            ++count;
        }

        shader.clearFrameBuffer();
        shader.get("u_flipY").set(-1);

        shader.get("u_kernel").set(...kernels.normal);
        shader.get("u_kernelWeight").set(ConvoUtil.computeKernelWeight(kernels.normal));
        shader.draw();
    }
}

