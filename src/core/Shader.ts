import { Attribute } from "./Attribute";
import { DefinedType, getGlsl, getGlslInfo, GLSL_Fragment, GLSL_Vertex } from "./GLSL";
import { Context } from "./Context";
import { BufferUsage, ShaderBuffer } from "./ShaderBuffer";
import { Texture, TypeTextureDraw } from "./Texture";
import { Uniform } from "./Uniform";

export class Shader {

    private buffers: ShaderBuffer[];
    private textures: Texture[];
    private properties: Map<string, Uniform | Attribute>;
    public vertexString: string;
    public framentString: string;
    private textureFrameBuffer: Texture;
    constructor(vs: { new(): GLSL_Vertex }, ps: { new(): GLSL_Fragment }) {

        //console.log(getGlsl(vs));
        this.vertexString = getGlsl(vs);
        this.framentString = getGlsl(ps);
        if (!Utils.initShaders(Context.gl, this.vertexString, this.framentString)) {
            console.error('Failed to intialize shaders.');
            return;
        }
        this.properties = new Map();
        this.buffers = [];
        this.textures = [];

        let vsInfo = getGlslInfo(vs);
        vsInfo.attributes.forEach(value => this.createAttribute(value.name, value.type));
        vsInfo.uniforms.forEach(value => this.createUniform(value.name, value.type));
        // vsInfo.varyings.forEach(value => this.createVarying(value.name, value.type));
        let psInfo = getGlslInfo(ps);
        psInfo.attributes.forEach(value => this.createAttribute(value.name, value.type));
        psInfo.uniforms.forEach(value => this.createUniform(value.name, value.type));
        // psInfo.varyings.forEach(value => this.createVarying(value.name, value.type));
    }

    draw() {
        let gl = Context.gl;
        this.properties.forEach((value) => {
            value.upload();
        });
        let offset = this.buffers[0].offset;
        let count = this.buffers[0].count;
        if (this.buffers.length > 1) {
            for (let i = 1; i < this.buffers.length; i++) {
                if (offset != this.buffers[i].offset || count != this.buffers[i].count) {
                    console.warn("diff offset or count!");
                }
            }
        }
        gl.drawArrays(gl.TRIANGLES, offset, count);
        if (this.textureFrameBuffer) {
            this.textureFrameBuffer.use();
            this.textureFrameBuffer = null;
        }
    }

    get(name: string) {
        return this.properties.get(name)
    }
    getAttribute(name: string) {
        return this.properties.get(name) as Attribute
    }
    set(name: string, value: any) {
        if (!this.properties.has(name)) return;
        this.properties.get(name)?.set(value);
    }

    createUniform(name: string, type: DefinedType) {
        let gl = Context.gl;
        if (this.properties.has(name)) return this.properties.get(name);
        let ext = (type == DefinedType.float_array) ? `[0]` : "";
        let location = gl.getUniformLocation(gl.program, name as string + ext);
        if (location < 0) {
            console.error(`Failed to get the storage location of ${name as string}`);
            return;
        }
        let uniform = new Uniform(name as string, type, location);
        this.properties.set(name, uniform);
        return uniform;
    }

    createAttribute(name: string, type: DefinedType) {
        let gl = Context.gl;
        if (this.properties.has(name)) return this.properties.get(name);
        let location = gl.getAttribLocation(gl.program, name as string);
        if (location < 0) {
            console.error(`Failed to get the storage location of ${name as string}`);
            return;
        }
        let attribute = new Attribute(name as string, type, location);
        this.properties.set(name, attribute);
        return attribute;
    }

    /**
     * 创建Buffer
     * @param data 写入缓冲区对象的数据(类型化数组)
     * @param elementCount 元素长度 每个元素存在于数据中的长度 
     * @param usage 表示程序将如何使用存储在缓冲区对象中的数据。该参数将帮助WebGL优化操作,但是就算你传入了错误的值,也不会终止程序(仅仅是降低程序的效率)
     *  - `gl.STATIC_DRAW` 只会向缓冲区对象中写入一次数据,但需要绘制很多次
     *  - `gl.STREAM_DRAW` 只会向缓冲区对象中写入一次数据,然后绘制若干次
     *  - `gl.DYNAMIC_DRAW` 会向缓冲区对象中多次写入数据,并绘制很多次
     * @param start 开始读取的位置
     * @param end 结束读取的位置 默认为data.length
     * @returns 
     */
    createBuffer(data: number[] | Float32Array, elementCount: number, usage: BufferUsage, start: number = 0, end: number = 0) {
        let buffer = new ShaderBuffer(data, elementCount, usage, start, end);
        this.buffers.push(buffer);
        return buffer;
    }

    /**
     * 创建纹理
     * @param name 取样器名称
     * @param image 已加载完成的HTMLImageElement元素对象
     * @param texturePosition 纹理单元队列 默认0位 在片段着色器中至少有8个纹理单元
     * @returns 
     */
    createTexture(
        name: string,
        image: HTMLImageElement | { width: number, height: number },
        texturePosition: number = 0,
        typedraw?: TypeTextureDraw): Texture {
        let gl = Context.gl;
        var gltexture = gl.createTexture();   // Create a texture object
        if (!gltexture) {
            console.log('Failed to create the texture object');
            return null;
        }
        let uniform = this.createUniform(name, DefinedType.sampler2D);
        let texture = new Texture(uniform, gltexture, image, texturePosition, typedraw);
        // texture.upload(gl);
        this.textures.push(texture);
        return texture;
    }

    /**
     * 使用纹理缓冲
     * @param texture 
     */
    useFrameBuffer(texture: Texture) {
        this.textureFrameBuffer = texture;
        this.textureFrameBuffer.bindFrameBuffer();
    }

    /**
     * 清除纹理帧缓冲
     */
    clearFrameBuffer() {
        let gl = Context.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    printf() {
        console.group("shader:");
        console.group("vertex:");
        console.info(`%c${this.vertexString}`, "color:grey");
        console.groupEnd();
        console.group("frament:");
        console.info(`%c${this.framentString}`, "color:grey");
        console.groupEnd();
        console.groupEnd();
    }
}