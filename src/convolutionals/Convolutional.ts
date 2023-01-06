import { Program } from "typescript";
import { attribute, cos, DefinedType, float, glsl, GLSL_Fragment, GLSL_Vertex, method, precision, PrecisionType, sampler2D, sin, smoothstep, texture2D, uniform, varying, vec2, __vec2, __vec4 } from "../core/GLSL";
import { RenderContext } from "../core/RenderContext";
import { RenderProgram } from "../core/RenderProgram";
import { Shader, Texture } from "../core/Shader";
import { Loader } from "../Util";
import { ConvoUtil } from "./ConvoUtil";
import { kernels } from "./kernels";

@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
    @attribute(DefinedType.vec2)
    public a_position;
    @attribute(DefinedType.vec2)
    public a_texCoord;
    @uniform(DefinedType.vec2)
    public u_resolution;
    @uniform(DefinedType.float)
    public u_flipY;
    @varying(DefinedType.vec2)
    public v_texCoord;
    protected main() {
        // convert the rectangle from pixels to 0.0 to 1.0
        let zeroToOne = this.a_position.__ / this.u_resolution.__;//@vec2
        // convert from 0->1 to 0->2
        let zeroToTwo = zeroToOne * 2.0;//@vec2
        // convert from 0->2 to -1->+1 (clipspace)
        let clipSpace = zeroToTwo - 1.0;//@vec2
        this.gl_Position = __vec4(clipSpace * __vec2(1, this.u_flipY).__, 0, 1);
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

    constructor() {
        this.initialize();
    }
    async initialize() {
        var canvas = document.getElementById('webgl');
        //创建渲染器
        let context = new RenderContext(canvas as HTMLCanvasElement);
        let program = context.createProgram();
        //创建Shader
        let shader = program.createShader(MyVS, MyFS);
        shader.printf();

        var image = await Loader.loadImage('./res/yellowflower.jpg');

        let positionbuffer = shader.createBuffer(
            ConvoUtil.createRectangleData(0, 0, image.width, image.height),
            2,
            context.gl.STATIC_DRAW);
        shader.getAttribute("a_position").linkBuffer(positionbuffer, 2, 0, 0)

        let texcoordbuffer = shader.createBuffer(
            [
                0.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                1.0, 1.0,
            ],
            2,
            context.gl.STATIC_DRAW);
        shader.getAttribute("a_texCoord").linkBuffer(texcoordbuffer, 2, 0, 0)

        let originalTexture = shader.createTexture("u_image", image);
        // originalTexture.active()
        originalTexture.set("CLAMP_TO_EDGE");


        var textures: Texture[] = [];
        for (var ii = 0; ii < 2; ++ii) {
            let texture = shader.createTexture("u_image", { width: image.width, height: image.height });
            texture.set("CLAMP_TO_EDGE");
            texture.enableFramebuffer();
            textures.push(texture);
        }


        var effects = [
            "gaussianBlur",

            "gaussianBlur"
        ];

        let drawEffects = (name: string = "normal") => {

            shader.get("u_textureSize").set(image.width, image.height);
            shader.get("u_flipY").set(1);

            let gl = RenderContext.inst.gl;
            program.clear();
            program.use();
            // shader.getAttribute("a_position").upload();
            // shader.getAttribute("a_texCoord").upload();
            originalTexture.bind();
            var count = 0;
            for (var i = 0; i < effects.length; ++i) {
                let name = effects[i];
                let texture = textures[count % 2];

                texture.bindFrameBuffer();
                shader.get("u_resolution").set(image.width, image.height);
                shader.get("u_kernel").set(...kernels[name]);
                shader.get("u_kernelWeight").set(ConvoUtil.computeKernelWeight(kernels[name]));
                shader.draw();
                texture.bind()
                // gl.bindTexture(gl.TEXTURE_2D, texture.gltexture);
                ++count;
            }
            // gl.bindTexture(gl.TEXTURE_2D, texture.gltexture);
            Texture.clearFrameBuffer();
            shader.get("u_flipY").set(-1);
            shader.get("u_resolution").set(gl.canvas.width, gl.canvas.height);
            shader.get("u_kernel").set(...kernels.normal);
            shader.get("u_kernelWeight").set(ConvoUtil.computeKernelWeight(kernels.normal));
            shader.draw();
        }
        drawEffects();
    }

}

