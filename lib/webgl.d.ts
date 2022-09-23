declare interface WebGLProgram {
    [key: string]: number | WebGLUniformLocation
}
declare interface WebGLRenderingContext {
    program: WebGLProgram
}
declare interface WebGLRenderingContextBase {
    /**
     * 执行顶点着色器,按照`mode`参数指定的方式绘制图形
     * @param mode 指定的绘制方式,可接受以下的常量 
     * - `gl.POINTS` 绘制一个点 
     * - `gl.LINES` 绘制一条直线
     * - `gl.LINE_STRIP` 绘制一条直线到下一个顶点
     * - `gl.LINE_LOOP` 绘制一条首尾相连的线
     * - `gl.TRIANGLES` 绘制一个三角形
     * - `gl.TRIANGLES.STRIP` 
     * - `gl.TRIANGLES.FAN`
     * @param first 指定从哪个顶点开始绘制(整型)
     * @param count 指定绘制需要用到多少顶点(整型)
     * @error - `INVALID_ENUM` 传入的参数不是前述参数之一
     *        - `INVALID_VALUE` 参数first和count是负数
     */
    drawArrays(mode: number, first: number, count: number): void
    /**
     * 获取由name参数指定的attribute变量的存储地址
     * @param program 指定包含顶点着色器和片元着色器的着色器程序对象
     * @param name 指定想要获取其存储地址的attribute变量名称
     * @return  - `\>=0` attribute变量的存储地址
     *          - `-1` 指定的attribute变量不存在,或者其命名空间具有gl_或webgl_前缀
     * @error   - `INVALID_OPERATION` program对象未能成功连接
     *          - `INVALID_VALUE` name参数的长度大于attribute变量名的最大长度(默认为256字节)
     */
    getAttribLocation(program: WebGLProgram, name: string): number
    /**
     * 将数据(v0,v1,v2)传给由location参数指定的attribute变量
     * @param index 指定将要修改的attribute变量的存储位置
     * @param x 指定填充attribute变量第一个分量的值
     * @param y 指定填充attribute变量第二个分量的值
     * @param z 指定填充attribute变量第三个分量的值
     * @return `void`
     * @error   - `INVALID_OPERATION` 没有当前的program对象
     *          - `INVALID_VALUE` location大于等于attribute变量的最大数目(默认为8)
     */
    vertexAttrib3f(index: number, x: number, y: number, z: number): void

    /**
     * 创建缓冲区
     */
    createBuffer(): WebGLBuffer
    /**
     * 待删除的缓冲区对象
     */
    deleteBuffer(buffer: WebGLBuffer): void
    /**
     * 绑定缓冲区
     * @param target - 参数可以是以下中的一个
     *  - `gl.ARRAY_BUFFER` 表示缓冲区对象包含了顶点数据
     *  - `gl.ELEMENT` 表示缓冲区对象包含了顶点的索引值
     * ----
     * @param buffer - 指定之前由`gl.createBuffer()`返回的待绑定的缓冲区对象
     *   - 如果指定为null,则禁用对target的绑定
     * ----
     * @return 无
     * @error `INVALID_ENUM` target不是上述值之一,这将保持原有的绑定情况不变
     */
    bindBuffer(target: number, buffer: WebGLBuffer);

    /**
     * 开辟存储空间,向绑定在target上的缓冲区对象中写入数据data
     * @param target gl.ARRAY_BUFFER | gl.ELEMENT_ARRAY_BUFFER
     * @param data 写入缓冲区对象的数据(类型化数组)
     * @param usage 表示程序将如何使用存储在缓冲区对象中的数据。该参数将帮助WebGL优化操作,但是就算你传入了错误的值,也不会终止程序(仅仅是降低程序的效率)
     *  - `gl.STATIC_DRAW` 只会向缓冲区对象中写入一次数据,但需要绘制很多次
     *  - `gl.STREAM_DRAW` 只会向缓冲区对象中写入一次数据,然后绘制若干次
     *  - `gl.DYNAMIC_DRAW` 会向缓冲区对象中多次写入数据,并绘制很多次
     */
    bufferData(target: number, data: BufferSource, usage: number);

    vertexAttribPointer(index: number, size: number, type: number, normalized: boolean, stride: number, offset: number);

    enableVertexAttribArray(index: number);
}