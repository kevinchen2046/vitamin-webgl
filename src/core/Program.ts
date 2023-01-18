import { DefinedType, GLSL_Fragment, GLSL_Vertex } from "./GLSL";
import { Context } from "./Context";
import { Shader } from "./Shader";
import { ColorUtil } from "../utils/ColorUtil";
import { Hashtable } from "../utils/Hashtable";
import { Uniform } from "./Uniform";
import { ShaderProperty } from "./ShaderProperty";
import { Attribute } from "./Attribute";
import { Texture, TextureOptions } from "./Texture";

let GID=0;

export class Program {
    public uid:number;
    private glprogram: WebGLProgram;
    private shaders: Shader[];
    private properties: Map<string, Uniform | Attribute>;
    private textures: Texture[];
    constructor() {
        this.uid=++GID;
        this.shaders = [];
        this.properties = new Map();
        this.textures=[];
        let gl = Context.gl;
        // Create a program object
        let program = gl.createProgram();
        if (!program) {
            console.error('Create WebGLProgram fail!');
            return null;
        }
        this.glprogram = program;
    }

    dispose() {
        let gl = Context.gl;
        gl.deleteProgram(this.glprogram);
    }

    link() {
        let glprogram = this.glprogram;
        let gl = Context.gl;
        for (let shader of this.shaders) {
            // Attach the shader objects
            gl.attachShader(glprogram, shader.vertex);
            gl.attachShader(glprogram, shader.frament);
        }
        // Link the program object
        gl.linkProgram(glprogram);
        // Check the result of linking
        var linked = gl.getProgramParameter(glprogram, gl.LINK_STATUS);
        if (!linked) {
            var error = gl.getProgramInfoLog(glprogram);
            console.error('Failed to link program: ' + error);
            this.unlink();
            return null;
        }
        for (let shader of this.shaders) {
            shader.initialize();
        }
        return this;
    }

    unlink() {
        let gl = Context.gl;
        // gl.linkProgram(null);
        //this.dispose();
        for (let shader of this.shaders) {
            // Attach the shader objects
            gl.deleteShader(shader.vertex);
            gl.deleteShader(shader.frament);
        }
    }

    use() {
        let gl = Context.gl;
        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.glprogram);
        return this;
    }

    createShader<VS>(vs: { new(): GLSL_Vertex }, ps: { new(): GLSL_Fragment }) {
        let shader = new Shader(this, vs, ps);
        this.shaders.push(shader);
        return shader;
    }

    createUniform(name: string, type: DefinedType) {
        let gl = Context.gl;
        if (this.properties.has(name)) return this.properties.get(name);
        let ext = (type == DefinedType.float_array) ? `[0]` : "";
        let location = gl.getUniformLocation(this.glprogram, name as string + ext);
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
        let location = gl.getAttribLocation(this.glprogram, name as string);
        if (location < 0) {
            console.error(`Failed to get the storage location of ${name as string}`);
            return;
        }
        let attribute = new Attribute(name as string, type, location);
        this.properties.set(name, attribute);
        return attribute;
    }

    /**
     * 创建纹理
     * @param name 取样器名称
     * @param image 已加载完成的HTMLImageElement元素对象
     * @param texturePosition 纹理单元队列 默认0位 在片段着色器中至少有8个纹理单元
     * @returns 
     */
    createTexture(image: HTMLImageElement | { width: number, height: number }, options?: TextureOptions): Texture {
        let texture = new Texture(image, options);
        this.textures.push(texture);
        texture.linkProgram(this);
        return texture;
    }

    clear(color?: number, clearDepth?: boolean) {
        let gl = Context.gl;
        if (color) {
            const { r, g, b } = ColorUtil.extract(color);
            gl.clearColor(r / 255, g / 255, b / 255, 1);
        } else {
            // Specify the color for clearing <canvas>
            gl.clearColor(0, 0, 0, 1);
        }
        // Clear <canvas>

        if (clearDepth) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        } else {
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
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