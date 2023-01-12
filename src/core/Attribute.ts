import { DefinedType } from "./GLSL";
import { ShaderBuffer } from "./ShaderBuffer";
import { ShaderProperty } from "./ShaderProperty";

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
     * @param stride 步进 
     * @param position 取缓冲区数据元素的起始位置
     * - 比如缓冲区数据[x,y,r,g,b,....],其元素长度为5 
     * - position的长度为2 位置为0
     * - color的长度为3 位置为2
     */
    linkBuffer(buffer: ShaderBuffer, size?: number, stride?: number, position?: number) {
        this.buffer = buffer;
        this.length = size==undefined?buffer.elementCount:size;
        this.stride = stride == undefined ? buffer.elementCount : stride;
        this.position = position == undefined ? 0 : position;
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



