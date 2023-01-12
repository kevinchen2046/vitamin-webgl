import { Context } from "./Context";

export type BufferUsage = WebGLRenderingContextBase["STATIC_DRAW"] | WebGLRenderingContextBase["STREAM_DRAW"] | WebGLRenderingContextBase["DYNAMIC_DRAW"]
export class ShaderBuffer {
    public buffer: WebGLBuffer;
    public data: Float32Array;
    public elementCount: number;
    public offset: number;
    public count: number;
    constructor(data: number[] | Float32Array, elementCount: number, usage: BufferUsage, start: number = 0, end: number = 0) {
        let gl = Context.gl;
        if (!(data instanceof Float32Array)) data = new Float32Array(data);
        this.data = data;
        // Create a buffer object
        this.buffer = gl.createBuffer();
        if (!this.buffer) {
            console.log('Failed to create the buffer object');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, this.data, usage);
        this.elementCount = elementCount;
        this.offset = start;
        this.count = ((end ? end : data.length) - start) / elementCount; // The number of vertices
    }

    update(location: number, size: number, stride: number, position: number) {
        let gl = Context.gl;
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

        // console.log("vertexAttribPointer:", size, type, normalized, this.data.BYTES_PER_ELEMENT * stride, this.data.BYTES_PER_ELEMENT * position);
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


