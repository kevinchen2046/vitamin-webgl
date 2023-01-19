import { Attribute } from "./Attribute";
import { DefinedType, getGlsl, getGlslInfo, GLSL_Fragment, GLSL_Vertex } from "./GLSL";
import { Context } from "./Context";
import { BufferUsage, ShaderBuffer } from "./ShaderBuffer";
import { Texture, TextureOptions } from "./Texture";
import { Uniform } from "./Uniform";
import { Program } from "./Program";

export class Shader {
    public program: Program;
    private buffers: ShaderBuffer[];
    private properties: Map<string, Uniform | Attribute>;
    public vsclzz:any;
    public fsclzz:any;
    public vertexString: string;
    public framentString: string;
    public vertex: WebGLShader;
    public frament: WebGLShader;
    private textureFrameBuffer: Texture;
    constructor(program: Program, vs: { new(): GLSL_Vertex }, fs: { new(): GLSL_Fragment }) {
        this.program = program;
        //console.log(getGlsl(vs));
        this.vsclzz=vs;
        this.fsclzz=fs;
        this.vertexString = getGlsl(vs);
        this.framentString = getGlsl(fs);
        let result = this.initShaders(Context.gl, this.vertexString, this.framentString)
        if (!result) {
            console.error('Failed to intialize shaders.');
            return;
        }
        this.vertex = result.vertex;
        this.frament = result.fragment;
        this.properties = new Map();
        this.buffers = [];
    }

    initialize(){
        let vsinfo = getGlslInfo(this.vsclzz);
        vsinfo.attributes.forEach(value => this.createAttribute(value.name, value.type));
        vsinfo.uniforms.forEach(value => this.createUniform(value.name, value.type));
        // vsInfo.varyings.forEach(value => this.createVarying(value.name, value.type));
        let fsinfo = getGlslInfo(this.fsclzz);
        fsinfo.attributes.forEach(value => this.createAttribute(value.name, value.type));
        fsinfo.uniforms.forEach(value => this.createUniform(value.name, value.type));
        // psInfo.varyings.forEach(value => this.createVarying(value.name, value.type));
    }

    /**
     * 创建链接的program对象
     * @param gl GL 渲染上下文
     * @param vshader 顶点着色器程序 (string)
     * @param fshader 片段着色器程序 (string)
     * @return 已创建program对象，如果创建失败，则为空
     */
    private initShaders(gl: WebGLRenderingContext, vshader, fshader) {
        // Create shader object
        var vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vshader);
        var fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        return { vertex: vertexShader, fragment: fragmentShader }
    }

    /**
     * Create a shader object
     * @param gl GL context
     * @param type the type of the shader object to be created
     * @param source shader program (string)
     * @return created shader object, or null if the creation has failed.
     */
    private loadShader(gl: WebGLRenderingContext, type, source) {
        // Create shader object
        var shader = gl.createShader(type);
        if (shader == null) {
            console.log('unable to create shader');
            return null;
        }

        // Set the shader program
        gl.shaderSource(shader, source);

        // Compile the shader
        gl.compileShader(shader);

        // Check the result of compilation
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            var error = gl.getShaderInfoLog(shader);
            console.log('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    draw() {
        let gl = Context.gl;
        this.properties.forEach((value) => {
            value.bind();
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
            this.textureFrameBuffer.bind();
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
        if (this.properties.has(name)) return this.properties.get(name);
        let uniform = this.program.createUniform(name, type);
        if (uniform) this.properties.set(name, uniform);
        return uniform;
    }

    createAttribute(name: string, type: DefinedType) {
        if (this.properties.has(name)) return this.properties.get(name);
        let attribute = this.program.createAttribute(name, type);
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