import { DefinedType, getGlsl, getGlslInfo, GLSL_Fragment, GLSL_Vertex } from "./GLSL";
import { RenderContext } from "./RenderContext";

export class Shader {
    public gl: WebGLRenderingContext;
    private buffers: ShaderBuffer[];
    private textures: Texture[];
    private properties: Map<string, Uniform | Attribute>;
    public vertexString: string;
    public framentString: string;
    constructor(gl: WebGLRenderingContext, vs: { new(): GLSL_Vertex }, ps: { new(): GLSL_Fragment }) {
        this.gl = gl;
        //console.log(getGlsl(vs));
        this.vertexString = getGlsl(vs);
        this.framentString = getGlsl(ps);
        if (!Utils.initShaders(this.gl, this.vertexString, this.framentString)) {
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
        this.properties.forEach((value) => {
            value.upload();
        });
        let offset=this.buffers[0].offset;
        let count=this.buffers[0].count;
        if(this.buffers.length>1){
            for (let i = 1; i < this.buffers.length; i++) {
                if(offset!=this.buffers[i].offset||count!=this.buffers[i].count){
                    console.warn("diff offset or count!");
                }
            }
        }
        this.gl.drawArrays(this.gl.TRIANGLES, offset,count);
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
        let ext = (type == DefinedType.float_array) ? `[0]` : "";
        let location = this.gl.getUniformLocation(this.gl.program, name as string + ext);
        if (location < 0) {
            console.error(`Failed to get the storage location of ${name as string}`);
            return;
        }
        let uniform = new Uniform(name as string, type, location);
        uniform.gl = this.gl;
        this.properties.set(name, uniform);
        return uniform;
    }

    createAttribute(name: string, type: DefinedType) {
        if (this.properties.has(name)) return this.properties.get(name);
        let location = this.gl.getAttribLocation(this.gl.program, name as string);
        if (location < 0) {
            console.error(`Failed to get the storage location of ${name as string}`);
            return;
        }
        let attribute = new Attribute(name as string, type, location);
        attribute.gl = this.gl;
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
    createBuffer(
        data: number[] | Float32Array,
        elementCount: number,
        usage: WebGLRenderingContextBase["STATIC_DRAW"] | WebGLRenderingContextBase["STREAM_DRAW"] | WebGLRenderingContextBase["DYNAMIC_DRAW"],
        start: number = 0,
        end: number = 0) {
        if (!(data instanceof Float32Array)) {
            data = new Float32Array(data);
        }
        // Create a buffer object
        var glbuffer = this.gl.createBuffer();
        if (!glbuffer) {
            console.log('Failed to create the buffer object');
            return;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, glbuffer);
        // Write date into the buffer object
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);

        let buffer = new ShaderBuffer(glbuffer, data, elementCount, start, end);
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
    createTexture(name: string, image: HTMLImageElement | { width: number, height: number }, texturePosition: number = 0): Texture {
        var gltexture = this.gl.createTexture();   // Create a texture object
        if (!gltexture) {
            console.log('Failed to create the texture object');
            return null;
        }
        let uniform = this.createUniform(name, DefinedType.sampler2D);
        let texture = new Texture(uniform, gltexture, image, texturePosition);
        texture.gl = this.gl;
        // texture.upload(this.gl);
        this.textures.push(texture);
        return texture;
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

export class ShaderBuffer {
    public buffer: WebGLBuffer;
    public data: Float32Array;
    public elementCount: number;
    public offset: number;
    public count: number;
    constructor(buffer: WebGLBuffer, data: Float32Array, elementCount: number, start: number = 0, end: number = 0) {
        this.buffer = buffer;
        this.data = data;
        this.elementCount = elementCount;
        this.offset = start;
        this.count = ((end ? end : data.length) - start) / elementCount; // The number of vertices
    }
    update(location: number, size: number, stride: number, position: number) {
        let gl = RenderContext.inst.gl;
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(location as number);
        // bind the texcoord buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        //数组中每个元素的字节大小。
        //const FSIZE = this.buffer.data.BYTES_PER_ELEMENT;
        // Assign the buffer object to a_Position variable

        //指定数据的类型
        let type = gl.FLOAT;
        //是否将非浮点型数据归一化 - 默认 true
        let normalized = false;

        console.log("vertexAttribPointer:", size, type, normalized, this.data.BYTES_PER_ELEMENT * stride, this.data.BYTES_PER_ELEMENT * position);
        gl.vertexAttribPointer(
            //指定分配 attribute 中的存储地址
            location,
            //指定缓冲区每个顶点分量的个数 1-4
            size,
            //指定数据的类型
            type,
            //是否将非浮点型数据归一化 - 默认 true
            normalized,
            //指定相邻两个顶点间的字节数 - 默认 0
            this.data.BYTES_PER_ELEMENT * stride,
            //指定缓冲区对象中的偏移量 - 默认 0
            this.data.BYTES_PER_ELEMENT * position);
    }
    // draw(gl: WebGLRenderingContext) {
    //     // Draw the rectangle
    //     console.log("drawArrays:", this.offset, this.count);
    //     gl.drawArrays(gl.TRIANGLES, this.offset, this.count);
    // }
}

export abstract class ShaderProperty {
    public name: string;
    public type: DefinedType;
    public location: WebGLUniformLocation | number;
    public value: number[];
    public gl: WebGLRenderingContext
    constructor(name: string, type: DefinedType, location: WebGLUniformLocation | number) {
        this.name = name;
        this.type = type;
        this.location = location;
    }
    get() {
        return this.value;
    }
    set(...vals) {
        this.value = vals;
        let gl = this.gl;
        switch (this.type) {
            case DefinedType.sampler2D:
            case DefinedType.int:
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
                gl.uniform1fv(this.location, this.value);
                break
            case DefinedType.float:
            case DefinedType.vec2:
            case DefinedType.vec3:
            case DefinedType.vec4:
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
        }

    }
    upload() {
    }
}

export class Attribute extends ShaderProperty {
    public buffer: ShaderBuffer;
    public length: number;
    public stride: number;
    public position: number;
    constructor(name: string, type: DefinedType, location: WebGLUniformLocation | number) {
        super(name, type, location);
    }
    /**
     * 链接缓冲区数据
     * @param gl gl上下文
     * @param buffer 创建的缓冲区数据封装对象
     * @param size 取缓冲区数据元素的长度 
     * @param position 取缓冲区数据元素的起始位置
     * - 比如缓冲区数据[x,y,r,g,b,....],其元素长度为5 
     * - position的长度为2 位置为0
     * - color的长度为3 位置为2
     */
    linkBuffer(buffer: ShaderBuffer, size: number, stride: number, position: number) {
        this.buffer = buffer;
        this.length = size;
        this.stride = stride;
        this.position = position;
        return this;
    }

    /**
     * 
     * @param gl 
     */
    upload() {
        this.buffer.update(this.location as number, this.length, this.stride, this.position);
    }
}

export class Uniform extends ShaderProperty {
    constructor(name: string, type: DefinedType, location: WebGLUniformLocation) {
        super(name, type, location);
    }
}

/**纹理 */
export class Texture {
    public sample: Uniform;
    public gltexture: WebGLTexture;
    public image: HTMLImageElement | { width: number, height: number };
    public position: number;
    public frameBuffer: WebGLFramebuffer;
    public gl: WebGLRenderingContext;
    constructor(sample: Uniform, gltexture: WebGLTexture, image: HTMLImageElement | { width: number, height: number }, position: number = 0) {
        this.sample = sample;
        this.gltexture = gltexture;
        this.image = image;
        this.position = position;
    }

    enableFramebuffer() {
        let gl = this.gl;
        // Create a framebuffer
        this.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        // Attach a texture to it.
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.gltexture, 0);
    }

    bindFrameBuffer() {
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    }

    static clearFrameBuffer() {
        let gl = RenderContext.inst.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    active() {
        let gl = this.gl;
        // Enable texture unit0
        gl.activeTexture(gl.TEXTURE0 + this.position);
    }
    bind(){
        let gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.gltexture);
        this.sample.set(this.position);
    }
    set(type: "LINEAR" | "CLAMP_TO_EDGE") {
        let gl = this.gl;
        // Bind the texture object to the target
        
        this.bind();
        // Set the texture parameters
        if (type == "LINEAR") {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        if (type == "CLAMP_TO_EDGE") {
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
    //     let gl = this.gl;
    //     // Set the texture image
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
    //     // Set the texture unit 0 to the sampler
    //     // gl.uniform1i(u_Sampler, 0);
    //     this.sample.set(this.position);
    // }
}