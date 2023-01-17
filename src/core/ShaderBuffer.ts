import { Context } from "./Context";

export type BufferUsage = WebGLRenderingContextBase["STATIC_DRAW"] | WebGLRenderingContextBase["STREAM_DRAW"] | WebGLRenderingContextBase["DYNAMIC_DRAW"]
export enum BufferType {
    FLOAT,
    UNSIGNED_BYTE
}
export class ShaderBuffer {
    public buffer: WebGLBuffer;
    private _data: Float32Array;
    private usage: BufferUsage
    public elementCount: number;
    public offset: number;
    public count: number;
    
    private end: number;
    constructor(data: number[] | Float32Array, elementCount: number, usage: BufferUsage, start: number = 0, end: number = 0) {
        let gl = Context.gl;

        this.usage = usage;
        this.elementCount = elementCount;
        this.offset = start;
        this.end=end;

        this.buffer = gl.createBuffer();
        if (!this.buffer) {
            console.log('Failed to create the buffer object');
            return;
        }

        if (!(data instanceof Float32Array)) {
            this.data = data ? new Float32Array(data) : null;
        } else {
            this.data = data;
        }
    }

    set data(v: Float32Array) {
        this._data = v;
        if (this._data) {
            let length = (this.end ? this.end : this._data.length) - this.offset;
            this.count = length / this.elementCount; // The number of vertices
            this.update();
        }
    }

    get data() { return this._data }

    public update() {
        let gl = Context.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, this.data, this.usage);
    }

    /**
     * 指定到location
     * @param location 
     * @param size 
     * @param stride 
     * @param position 
     */
    pointer(location: number, size: number,type:BufferType, normalized: boolean, stride: number, position: number) {
        let gl = Context.gl;
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(location as number);
        // bind the texcoord buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        //数组中每个元素的字节大小。
        //const FSIZE = this.buffer.data.BYTES_PER_ELEMENT;
        // Assign the buffer object to a_Position variable
        let _type=gl.FLOAT;
        switch(type){
            case BufferType.UNSIGNED_BYTE:_type=gl.UNSIGNED_BYTE;break;
        }
        // console.log("vertexAttribPointer:", size, type, normalized, this.data.BYTES_PER_ELEMENT * stride, this.data.BYTES_PER_ELEMENT * position);
        gl.vertexAttribPointer(
            //指定分配 attribute 中的存储地址
            location,
            //指定缓冲区每个顶点分量的个数 1-4
            size,
            //指定数据的类型
            _type,
            //是否将非浮点型数据归一化 - 默认 true
            normalized==undefined?false:normalized,
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


