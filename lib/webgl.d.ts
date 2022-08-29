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
}